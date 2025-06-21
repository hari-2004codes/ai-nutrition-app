// frontend/src/components/SummaryView.jsx
import React from 'react';

export default function SummaryView({ summary }) {
  if (!summary) return null;
  const { totalCalories, totalFat, totalCarbs, totalProtein, items } = summary;
  return (
    <div>
      <h3>Meal Summary</h3>
      <p>Total Calories: {totalCalories}</p>
      <p>Total Fat: {totalFat} g</p>
      <p>Total Carbs: {totalCarbs} g</p>
      <p>Total Protein: {totalProtein} g</p>
      <h4>Items:</h4>
      <ul>
        {items.map((it, idx) => (
          <li key={idx}>
            {it.name} — Qty: {it.quantity} {it.unit} — Calories: {it.nutrition?.calories ?? 'N/A'}
          </li>
        ))}
      </ul>
    </div>
  );
}
