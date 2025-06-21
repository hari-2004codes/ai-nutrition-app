// src/components/mealLog_comp/DetectedFoodsList.jsx
import React, { useState, useEffect } from 'react';

const DetectedFoodsList = ({ detectedFoods, onConfirmSelection, onCancel }) => {
  const [selectedFoods, setSelectedFoods] = useState([]);

  // Initialize all foods as selected by default
  useEffect(() => {
    if (detectedFoods && detectedFoods.length > 0) {
      setSelectedFoods(detectedFoods.map((_, index) => index));
    }
  }, [detectedFoods]);

  const toggleFoodSelection = (index) => {
    setSelectedFoods(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleConfirm = () => {
    const selectedItems = detectedFoods.filter((_, index) => 
      selectedFoods.includes(index)
    );
    onConfirmSelection(selectedItems);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#28a745'; // Green
    if (confidence >= 0.6) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  const formatNutrients = (nutrients) => {
    if (!nutrients) return 'No nutritional info';
    
    const parts = [];
    if (nutrients.calories) parts.push(`${Math.round(nutrients.calories)} cal`);
    if (nutrients.carbs) parts.push(`${Math.round(nutrients.carbs)}g carbs`);
    if (nutrients.protein) parts.push(`${Math.round(nutrients.protein)}g protein`);
    if (nutrients.fat) parts.push(`${Math.round(nutrients.fat)}g fat`);
    
    return parts.join(' • ') || 'No nutritional info';
  };

  if (!detectedFoods || detectedFoods.length === 0) {
    return null;
  }

  return (
    <div className="detected-foods-list">
      <h3>🍽️ Detected Foods</h3>
      <p className="instruction">Select the foods you want to add to your meal log:</p>
      
      <div className="foods-container">
        {detectedFoods.map((food, index) => (
          <div 
            key={index} 
            className={`food-item ${selectedFoods.includes(index) ? 'selected' : ''}`}
          >
            <label className="food-checkbox">
              <input
                type="checkbox"
                checked={selectedFoods.includes(index)}
                onChange={() => toggleFoodSelection(index)}
              />
              <div className="food-info">
                <div className="food-header">
                  <span className="food-name">{food.name}</span>
                  <span 
                    className="confidence-badge"
                    style={{ backgroundColor: getConfidenceColor(food.confidence) }}
                  >
                    {Math.round(food.confidence * 100)}%
                  </span>
                </div>
                <div className="food-nutrients">
                  {formatNutrients(food.nutrients)}
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>

      <div className="action-buttons">
        <button 
          onClick={onCancel}
          className="btn btn-cancel"
        >
          Cancel
        </button>
        <button 
          onClick={handleConfirm}
          disabled={selectedFoods.length === 0}
          className="btn btn-confirm"
        >
          Confirm Selected Items ({selectedFoods.length})
        </button>
      </div>

      <style jsx>{`
        .detected-foods-list {
          margin: 20px 0;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #dee2e6;
        }

        .detected-foods-list h3 {
          margin: 0 0 10px 0;
          color: #495057;
        }

        .instruction {
          margin: 0 0 20px 0;
          color: #6c757d;
          font-size: 14px;
        }

        .foods-container {
          margin-bottom: 20px;
        }

        .food-item {
          margin-bottom: 12px;
          padding: 15px;
          background: white;
          border-radius: 8px;
          border: 2px solid #e9ecef;
          transition: all 0.2s ease;
        }

        .food-item:hover {
          border-color: #007bff;
        }

        .food-item.selected {
          border-color: #28a745;
          background-color: #f8fff9;
        }

        .food-checkbox {
          display: flex;
          align-items: flex-start;
          cursor: pointer;
          width: 100%;
        }

        .food-checkbox input[type="checkbox"] {
          margin-right: 12px;
          margin-top: 2px;
          transform: scale(1.2);
        }

        .food-info {
          flex: 1;
        }

        .food-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .food-name {
          font-weight: 600;
          color: #212529;
          text-transform: capitalize;
        }

        .confidence-badge {
          padding: 2px 8px;
          border-radius: 12px;
          color: white;
          font-size: 12px;
          font-weight: 600;
          min-width: 40px;
          text-align: center;
        }

        .food-nutrients {
          color: #6c757d;
          font-size: 13px;
          line-height: 1.4;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-cancel {
          background-color: #6c757d;
          color: white;
        }

        .btn-cancel:hover:not(:disabled) {
          background-color: #545b62;
        }

        .btn-confirm {
          background-color: #28a745;
          color: white;
        }

        .btn-confirm:hover:not(:disabled) {
          background-color: #1e7e34;
        }
      `}</style>
    </div>
  );
};

export default DetectedFoodsList;