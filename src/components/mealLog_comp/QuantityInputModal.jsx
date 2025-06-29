import React, { useState } from "react";
import ReactDOM from "react-dom";

const SERVING_SIZES = [
  {
    label: 'Teaspoon',
    grams: 5,
    img: 'https://m.media-amazon.com/images/I/61uiNIXBq7L.jpg',
  },
  {
    label: 'Tablespoon',
    grams: 15,
    img: 'https://cdn-icons-png.flaticon.com/512/3312/3313000.png',
  },
  {
    label: 'Small bowl',
    grams: 50,
    img: 'data:image/jpeg;base64,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',
  },
  {
    label: 'Big bowl',
    grams: 100,
    img: 'data:image/jpeg;base64,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',
  },
  {
    label: 'Cup',
    grams: 240,
    img: 'https://cdn-icons-png.flaticon.com/512/135/135633.png',
  },
  {
    label: 'Plate',
    grams: 300,
    img: 'https://cdn-icons-png.flaticon.com/512/135/135634.png',
  },
  {
    label: 'Piece',
    grams: 30,
    img: 'https://cdn-icons-png.flaticon.com/512/135/135636.png',
  },
];


export default function QuantityInputModal({ food, onClose, onSave }) {
  const [selectedServing, setSelectedServing] = useState(null);
  const [selectedFraction, setSelectedFraction] = useState(1);
  const [customGrams, setCustomGrams] = useState(food.quantity || "");

  const handleServingClick = (serving) => {
    setSelectedServing(serving);
    setSelectedFraction(1);
    setCustomGrams(serving.grams);
  };

  const handleFractionClick = (fraction) => {
    if (selectedServing) {
      setSelectedFraction(fraction);
      const grams = (selectedServing.grams * fraction).toFixed(2);
      setCustomGrams(grams);
    }
  };

  const handleSave = () => {
    const grams = Number(customGrams);
    if (!grams || grams <= 0) return;
    onSave(grams, selectedServing ? selectedServing.label : "Custom", grams);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-dark-200/90 backdrop-blur-md rounded-2xl p-6 w-full max-w-md shadow-2xl relative border border-card-border">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-text-muted hover:text-text-base transition-colors"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4 text-text-base">
          Edit Quantity for {food.name}
        </h2>
        <div className="mb-4 grid grid-cols-2 gap-3">
          {SERVING_SIZES.map((serving) => (
            <button
              key={serving.label}
              className={`flex flex-col items-center border rounded-lg p-2 transition ${
                selectedServing?.label === serving.label
                  ? "border-primary-DEFAULT bg-primary-DEFAULT/20 shadow-lg shadow-primary-DEFAULT/20"
                  : "border-card-border bg-dark-100/50 hover:border-primary-DEFAULT hover:bg-dark-200"
              }`}
              onClick={() => handleServingClick(serving)}
              type="button"
            >
              <img
                src={serving.img}
                alt={serving.label}
                className="w-12 h-12 object-fill rounded mb-1"
              />
              <span className="font-semibold text-text-base">
                {serving.label}
              </span>
              <span className="text-xs text-text-muted">{serving.grams}g</span>
            </button>
          ))}
        </div>
        {selectedServing && (
          <div className="flex justify-center gap-2 mb-4">
            {[0.25, 0.5, 0.75, 1].map((fraction) => (
              <button
                key={fraction}
                className={`px-3 py-1 rounded-lg border font-semibold transition-colors ${
                  selectedFraction === fraction
                    ? 'bg-primary-DEFAULT text-white border-primary-DEFAULT'
                    : 'bg-dark-100/50 text-text-base border-card-border hover:bg-dark-200 hover:border-primary-DEFAULT'
                }`}
                onClick={() => handleFractionClick(fraction)}
                type="button"
              >
                {fraction === 1 ? 'Full' : `${fraction * 4}/4`}
              </button>
            ))}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-text-muted font-medium mb-1">
            Or enter grams:
          </label>
          <input
            type="number"
            min="1"
            className="w-full bg-dark-100/50 border border-card-border rounded-lg px-3 py-2 text-text-base placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
            value={customGrams}
            onChange={(e) => {
              setCustomGrams(e.target.value);
              setSelectedServing(null);
            }}
          />
        </div>
        <button
          className="w-full bg-primary-DEFAULT text-white font-semibold py-2 rounded-lg hover:bg-primary-600 transition"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>,
    document.body
  );
}
