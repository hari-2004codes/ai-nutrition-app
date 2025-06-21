// backend/controllers/mealController.js
import MealLog from '../models/MealLog.js';
import { callSegmentation, callNutrition } from '../services/logmealService.js';


// inside mealController.js
export function parseSegmentationResult(raw) {
  // raw is the JSON returned by LogMeal, e.g., raw.segmentation_results array
  const segs = raw.segmentation_results || [];
  return segs.map(seg => {
    const position = seg.food_item_position;
    const candidates = (seg.recognition_results || []).map(r => ({
      dishId: r.id,
      name: r.name,
      probability: r.prob
    }));
    const top = candidates[0] || {};
    return {
      position,
      polygon: seg.polygon,
      bbox: seg.contained_bbox,
      candidates,
      selectedDishId: top.dishId,
      selectedName: top.name,
      probability: top.probability,
      quantity: 1,
      unit: 'serving'
    };
  });
}

/**
 * Handle segmentation: parse LogMeal response, but do NOT persist yet.
 * Returns raw result to frontend.
 */
export async function segmentImage(req, res, next) {
  try {
    const imagePath = req.file.path;
    const result = await callSegmentation(imagePath);
    // result contains segmentation_results, recognition_results, imageId, etc.
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * After frontend confirmation: receives selected items with quantities.
 * Body format: { imagePath?, imageId, items: [ { position, dishId, name, quantity, unit? }, ... ] }
 * Looks up nutrition for each, aggregates totals, persists a MealLog, returns summary.
 */
export async function confirmMeal(req, res, next) {
  try {
    const { imagePath, imageId, items } = req.body;
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'No items provided' });
    }
    const processedItems = [];
    let totalCalories = 0, totalFat = 0, totalCarbs = 0, totalProtein = 0;
    for (const it of items) {
      const { position, dishId, name, quantity, unit } = it;
      if (!dishId || quantity == null) {
        // skip invalid
        continue;
      }
      let nutrition = null;
      try {
        nutrition = await callNutrition(dishId, quantity, unit || 'serving');
      } catch {
        nutrition = null;
      }
      // Extract fields; adjust names per actual response
      const cals = nutrition?.calories ?? 0;
      const fat = nutrition?.fat ?? 0;
      const carbs = nutrition?.carbohydrates ?? 0;
      const protein = nutrition?.protein ?? 0;
      totalCalories += cals;
      totalFat += fat;
      totalCarbs += carbs;
      totalProtein += protein;
      processedItems.push({
        position,
        dishId,
        name,
        probability: it.probability, // optional if passed
        quantity,
        unit: unit || 'serving',
        nutrition: {
          calories: cals,
          fat,
          carbohydrates: carbs,
          protein
        }
      });
    }
    // Persist log
    const mealLog = new MealLog({
      imagePath: imagePath || null,
      imageId: imageId || null,
      items: processedItems,
      totalCalories,
      totalFat,
      totalCarbs,
      totalProtein
    });
    await mealLog.save();
    res.json({
      message: 'Meal confirmed and saved',
      summary: {
        totalCalories, totalFat, totalCarbs, totalProtein,
        items: processedItems
      },
      logId: mealLog._id
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieve past logs (optional)
 */
export async function getMealLogs(req, res, next) {
  try {
    const logs = await MealLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    next(err);
  }
}
