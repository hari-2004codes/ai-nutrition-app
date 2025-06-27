// frontend/src/components/SegmentationViewer.jsx
import React, { useEffect, useRef, useState } from 'react';
import { drawBox, drawPolygon } from '../utils/canvasUtils';

export default function SegmentationViewer({ file, data, onConfirm }) {
  const canvasRef = useRef();
  const [items, setItems] = useState([]); 
  // items: array of { position, candidates: [...], selectedDishId, selectedName, probability, quantity }

  useEffect(() => {
    if (!data || !file) return;
    // Initialize items state from data.segmentation_results
    const segs = data.segmentation_results || [];
    const initialItems = segs.map(seg => {
      const candidates = seg.recognition_results.map(r => ({
        dishId: r.id,
        name: r.name,
        probability: r.prob
      }));
      const top = candidates[0] || {};
      return {
        position: seg.food_item_position,
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
    setItems(initialItems);
    // Draw overlays once image loads
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;
      // Draw image
      ctx.drawImage(img, 0, 0, img.width, img.height);
      // Overlay boxes/polygons
      initialItems.forEach(item => {
        if (item.polygon && item.polygon.length) {
          drawPolygon(ctx, item.polygon);
        } else if (item.bbox) {
          drawBox(ctx, {
            x: item.bbox.x,
            y: item.bbox.y,
            w: item.bbox.w,
            h: item.bbox.h
          });
        }
      });
      URL.revokeObjectURL(url);
    };
  }, [data, file]);

  const handleSelectChange = (idx, field, value) => {
    setItems(prev => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], [field]: value };
      // If dishId/name changed, update probability if available
      if (field === 'selectedDishId') {
        const cand = arr[idx].candidates.find(c => c.dishId === Number(value));
        if (cand) {
          arr[idx].selectedName = cand.name;
          arr[idx].probability = cand.probability;
        }
      }
      return arr;
    });
  };

  const handleConfirm = () => {
    // Build payload: include file info? We can send imagePath if backend stored it; here send imageId from data
    const payload = {
      imagePath: null,  // optional
      imageId: data.imageId,
      items: items.map(it => ({
        position: it.position,
        dishId: it.selectedDishId,
        name: it.selectedName,
        probability: it.probability,
        quantity: it.quantity,
        unit: it.unit
      }))
    };
    onConfirm(payload);
  };

  return (
    <div>
      <canvas ref={canvasRef} style={{ border: '1px solid #ccc', maxWidth: '100%' }} />
      <div>
        <h3>Detected Items</h3>
        {items.map((it, idx) => (
          <div key={idx} style={{ border: '1px solid #ddd', margin: '8px', padding: '8px' }}>
            <p><strong>Item #{it.position}</strong></p>
            <label>
              Choose item:
              <select
                value={it.selectedDishId}
                onChange={e => handleSelectChange(idx, 'selectedDishId', e.target.value)}
              >
                {it.candidates.map(c => (
                  <option key={c.dishId} value={c.dishId}>
                    {c.name} ({(c.probability * 100).toFixed(1)}%)
                  </option>
                ))}
              </select>
            </label>
            <label style={{ marginLeft: '16px' }}>
              Qty:
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={it.quantity}
                onChange={e => handleSelectChange(idx, 'quantity', parseFloat(e.target.value))}
                style={{ width: '60px', marginLeft: '4px' }}
              />
            </label>
          </div>
        ))}
        <button onClick={handleConfirm}>Confirm Selections</button>
      </div>
    </div>
  );
}
