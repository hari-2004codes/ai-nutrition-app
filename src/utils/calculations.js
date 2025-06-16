// BMR calculation using Mifflin-St Jeor Equation
export const calculateBMR = (userData) => {
  const { weight, height, age, gender } = userData;
  
  if (!weight || !height || !age || !gender) {
    return 0;
  }

  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
};

// TDEE calculation using activity level multipliers
export const calculateTDEE = (bmr, activityLevel) => {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very: 1.725,
    extra: 1.9
  };

  return bmr * (multipliers[activityLevel] || 1.2);
};

// Calculate macronutrient targets based on goal
export const calculateMacroTargets = (tdee, goal) => {
  let calories = tdee;
  
  // Adjust calories based on goal
  switch (goal) {
    case 'lose':
      calories = tdee * 0.85; // 15% deficit
      break;
    case 'gain':
      calories = tdee * 1.15; // 15% surplus
      break;
    default:
      calories = tdee; // maintenance
  }

  // Default macro distribution (can be customized)
  const proteinCalories = calories * 0.25; // 25% protein
  const fatCalories = calories * 0.25; // 25% fat
  const carbCalories = calories * 0.50; // 50% carbs

  return {
    calories: Math.round(calories),
    protein: Math.round(proteinCalories / 4), // 4 cal/g
    fat: Math.round(fatCalories / 9), // 9 cal/g
    carbs: Math.round(carbCalories / 4), // 4 cal/g
  };
};

// Calculate BMI
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return 0;
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

// Get BMI category
export const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};