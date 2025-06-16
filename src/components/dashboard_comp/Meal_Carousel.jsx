import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
const items = [
    {id: 1, name: "Meal 1", description: "Veggy Bowl", image: "./download.jpeg"},
    {id: 2, name: "Meal 2", description: "Chapathi with Dal", image: "./download (1).jpeg"},
    {id: 3, name: "Meal 3", description: "Tandoori Chicken", image: "./download (2).jpeg"},
  ]
const Meal_Carousel = ( ) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="flex flex-row items-center justify-center bg-dark-200/50 border-2 border-card-border rounded-xl w-full h-full">
      <button className="text-white border-2 border-card-border rounded-xl p-2 ml-2" onClick={handlePrevious}><ChevronLeft size={20}/></button>
      <div className="flex flex-col items-center justify-center w-full h-full p-2">
        <h3 className="text-white text-2xl font-bold text-center py-2">Meal Recommendation</h3>
        <img src={items[currentIndex].image} alt={items[currentIndex].name} className="w-full h-full object-fill rounded-xl my-2 mx-2" />
        <p className="text-white text-lg text-center py-4">{items[currentIndex].description}</p>
      </div>
      <button className="text-white border-2 border-card-border rounded-xl p-2 mr-2" onClick={handleNext}><ChevronRight size={20}/></button>
    </div>
  );
};

export default Meal_Carousel;    
