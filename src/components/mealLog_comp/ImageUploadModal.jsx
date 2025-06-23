import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Camera, ChevronDown, ChevronUp } from 'lucide-react';
import QuantityInputModal from './QuantityInputModal';
import LoadingSpinner from '../general_comp/LoadingSpinner';

export default function ImageUploadModal({ isOpen, onClose, onDishesConfirmed }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [selectedDishes, setSelectedDishes] = useState({});
  const [imageId, setImageId] = useState(null);
  const [currentQuantityDish, setCurrentQuantityDish] = useState(null);
  const [confirmedDishes, setConfirmedDishes] = useState([]);
  const [step, setStep] = useState('upload');
  const [expandedItems, setExpandedItems] = useState({});
  const [error, setError] = useState(null);
  const [subclassesExpanded, setSubclassesExpanded] = useState({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      resetState();
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const resetState = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setLoading(false);
    setPredictions([]);
    setSelectedDishes({});
    setImageId(null);
    setCurrentQuantityDish(null);
    setConfirmedDishes([]);
    setStep('upload');
    setExpandedItems({});
    setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const res = await axios.post('/api/meals/segment', formData);
      setPredictions(res.data.segmentation_results || []);
      setImageId(res.data.imageId);
      setStep('select');
    } catch (error) {
      console.error('Segment error:', error);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDetails = (itemIndex) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemIndex]: !prev[itemIndex]
    }));
  };

  const toggleSubclasses = (itemIndex, event) => {
    event.stopPropagation(); // Prevent triggering the parent button's onClick
    setSubclassesExpanded(prev => ({
      ...prev,
      [itemIndex]: !prev[itemIndex]
    }));
  };

  const handleDishSelect = (itemIndex, predIndex, subclassIndex = null) => {
    const item = predictions[itemIndex];
    const prediction = item.recognition_results[predIndex];
    const position = item.food_item_position;
    
    let selectedName = prediction.name;
    let selectedId = prediction.id;
    let parentId = null;
    let parentName = null;
    
    // If a subclass is selected, use its details
    if (subclassIndex !== null && prediction.subclasses && prediction.subclasses[subclassIndex]) {
      const subclass = prediction.subclasses[subclassIndex];
      selectedName = subclass.name;
      selectedId = subclass.id || prediction.id; // fallback to parent id if subclass doesn't have one
      parentId = prediction.id;
      parentName = prediction.name;
    }
    
    setSelectedDishes(prev => ({
      ...prev,
      [position]: {
        dishId: selectedId,
        name: selectedName,
        position: position,
        predIndex: predIndex,
        subclassIndex: subclassIndex,
        source: subclassIndex !== null ? 
          ['logmeal', 'other'] : 
          ['logmeal', 'other'],
        ...(subclassIndex !== null && {
          parentId,
          parentName
        })
      }
    }));
  };

  const clearItemSelection = (itemIndex) => {
    const item = predictions[itemIndex];
    const position = item.food_item_position;
    
    setSelectedDishes(prev => {
      const newDishes = { ...prev };
      delete newDishes[position];
      return newDishes;
    });
  };

  const handleConfirm = async () => {
    if (Object.keys(selectedDishes).length === 0) {
      setError('Please select at least one dish');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Convert selectedDishes object to array and sort by position
      const dishesArray = Object.values(selectedDishes).sort((a, b) => a.position - b.position);
      
      await axios.post('/api/meals/confirm', {
        imageId,
        items: dishesArray
      });
      
      setConfirmedDishes(dishesArray);
      if (dishesArray.length > 0) {
        setCurrentQuantityDish(dishesArray[0]);
        setStep('quantity');
      }
    } catch (error) {
      console.error('Confirm error:', error);
      setError('Failed to confirm dishes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityConfirm = (food) => {
    const remainingDishes = confirmedDishes.filter(
      dish => dish.dishId !== currentQuantityDish.dishId
    );
    
    if (remainingDishes.length > 0) {
      setCurrentQuantityDish(remainingDishes[0]);
    } else {
      onDishesConfirmed(confirmedDishes.map(dish => ({
        ...food,
        id: dish.dishId,
        name: dish.name,
        source: 'logmeal'
      })));
      onClose();
    }
  };

  

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-dark-200/90 backdrop-blur-md rounded-2xl p-6 w-[95%] max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-card-border relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text-base">
                {step === 'upload' && 'Upload Meal Image'}
                {step === 'select' && 'Confirm Food Items'}
                {step === 'quantity' && 'Set Quantity'}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-dark-300/70 text-text-muted hover:text-text-base transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg">
                {error}
              </div>
            )}

            {step === 'upload' && (
              <div className="space-y-4">
                <div 
                  className="border-2 border-dashed border-card-border rounded-xl p-8 text-center cursor-pointer hover:border-primary-DEFAULT transition-colors"
                  onClick={() => document.getElementById('meal-image-upload').click()}
                >
                  {previewUrl ? (
                    <div className="relative">
                      <img 
                        src={previewUrl} 
                        alt="Meal preview" 
                        className="max-h-64 mx-auto rounded-lg object-contain"
                      />
                      <button
                        className="absolute top-2 right-2 bg-dark-300/80 p-1 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewUrl(null);
                          setSelectedFile(null);
                        }}
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <Camera size={48} className="mx-auto mb-4 text-text-muted" />
                      <p className="text-text-base font-medium">Click to upload an image</p>
                      <p className="text-text-muted text-sm mt-1">or drag and drop</p>
                    </div>
                  )}
                  <input 
                    id="meal-image-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </div>
                
                <button
                  onClick={handleUpload}
                  disabled={loading || !selectedFile}
                  className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-colors ${
                    loading || !selectedFile 
                      ? 'bg-dark-300/70 cursor-not-allowed' 
                      : 'bg-primary-DEFAULT hover:bg-primary-600'
                  }`}
                >
                  {loading ? (
                    <span className="flex justify-center items-center h-5">
                      <LoadingSpinner size="small" text="" />
                    </span>
                  ) : 'Recognize Food Items'}
                </button>
              </div>
            )}

            {step === 'select' && predictions.length > 0 && (
              <div className="space-y-6">
                <div className="mb-4">
                  <img 
                    src={previewUrl} 
                    alt="Meal" 
                    className="max-h-48 mx-auto rounded-lg object-contain"
                  />
                </div>
                
                <p className="text-text-base mb-2">
                  We detected {predictions.length} food item(s). Please confirm each item:
                  Select all the correct items and click confirm.
                </p>
                
                <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
                  {predictions.map((item, itemIndex) => {
                    const position = item.food_item_position;
                    const selectedDish = selectedDishes[position];
                    
                    return (
                      <div 
                        key={`item-${itemIndex}`}
                        className="border border-card-border rounded-xl overflow-hidden"
                      >
                        <div className="flex items-center gap-4 p-4 border-b border-card-border">
                          <div className="h-20 w-20 rounded-lg overflow-hidden bg-dark-300 flex-shrink-0">
                            <div className="w-full h-full bg-dark-300 flex items-center justify-center">
                              <Camera size={24} className="text-text-muted" />
                            </div>
                          </div>
                          
                          <div className="flex-grow">
                            <h3 className="text-lg font-medium text-text-base">
                              {selectedDish 
                                ? selectedDish.name 
                                : `Food Item ${position}`}
                            </h3>
                            {selectedDish && (
                              <div className="text-xs text-text-muted mt-1">
                                {selectedDish.subclassIndex !== null 
                                  ? `Subclass of ${selectedDish.parentName}`
                                  : 'Selected'}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => toggleDetails(itemIndex)}
                              className="p-2 rounded-full bg-dark-300/40 text-text-muted hover:bg-dark-300/70 hover:text-text-base"
                            >
                              {expandedItems[itemIndex] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            <button 
                              onClick={() => clearItemSelection(itemIndex)}
                              className="p-2 rounded-full bg-dark-300/40 text-text-muted hover:bg-dark-300/70 hover:text-text-base"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        </div>
                        
                        {expandedItems[itemIndex] && (
                          <div className="p-4 bg-dark-300/20">
                            {item.recognition_results.slice(0, 10).map((prediction, predIndex) => {
                              const isItemSelected = selectedDishes[position]?.predIndex === predIndex;
                              const hasSubclasses = prediction.subclasses && prediction.subclasses.length > 0;
                              
                              return (
                                <div key={`pred-${itemIndex}-${predIndex}`} className="mb-3 last:mb-0">
                                  <button
                                    onClick={() => handleDishSelect(itemIndex, predIndex, null)}
                                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                                      isItemSelected && selectedDishes[position]?.subclassIndex === null
                                        ? 'bg-primary-DEFAULT/20 border border-primary-DEFAULT/40' 
                                        : 'bg-dark-300/20 hover:bg-dark-300/40'
                                    }`}
                                  >
                                    <div className="flex justify-between items-center">
                                      <div className="font-medium text-text-base flex items-center gap-2">
                                        {prediction.name}
                                        <span className="text-text-muted text-sm">
                                          {Math.round(prediction.prob * 100)}%
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {hasSubclasses && !subclassesExpanded[itemIndex] && (
                                          <button
                                            onClick={(e) => toggleSubclasses(itemIndex, e)}
                                            className="text-text-base hover:bg-dark-200/40 rounded-lg p-2"
                                          >
                                            <ChevronDown size={20}  />
                                          </button>
                                        )}
                                        {hasSubclasses && subclassesExpanded[itemIndex] && (
                                          <button
                                            onClick={(e) => toggleSubclasses(itemIndex, e)}
                                            className="text-text-base hover:bg-dark-200/40 rounded-lg p-2"
                                          >
                                            <ChevronUp size={20}  />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </button>

                                  {hasSubclasses && subclassesExpanded[itemIndex] && (
                                    <div className="mt-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-dark-300 scrollbar-bg-dark-200">
                                      <div className="flex gap-2 min-w-min px-0.5">
                                        {prediction.subclasses.map((subclass, subIndex) => (
                                          <button
                                            key={`subclass-${subIndex}`}
                                            onClick={() => handleDishSelect(itemIndex, predIndex, subIndex)}
                                            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                                              isItemSelected && selectedDishes[position]?.subclassIndex === subIndex
                                                ? 'bg-primary-DEFAULT text-white'
                                                : 'bg-dark-300/40 text-text-base hover:bg-dark-300/70'
                                            }`}
                                          >
                                            {subclass.name}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-card-border flex justify-between">
                  <button
                    onClick={() => setStep('upload')}
                    className="px-4 py-2 rounded-xl border border-card-border hover:bg-dark-300/70 transition-colors"
                  >
                    Back
                  </button>
                  
                  <button
                    onClick={handleConfirm}
                    disabled={Object.keys(selectedDishes).length === 0 || loading}
                    className={`px-6 py-2 rounded-xl font-medium transition-colors ${
                      Object.keys(selectedDishes).length === 0 || loading
                        ? 'bg-dark-300/70 text-text-muted cursor-not-allowed'
                        : 'bg-primary-DEFAULT text-white hover:bg-primary-600'
                    }`}
                  >
                    {loading ? (
                      <span className="flex justify-center items-center h-5">
                        <LoadingSpinner size="small" text="" />
                      </span>
                    ) : 'Confirm Selection'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {step === 'quantity' && currentQuantityDish && (
        <QuantityInputModal
          isOpen={true}
          onClose={onClose}
          dish={currentQuantityDish}
          onConfirm={handleQuantityConfirm}
        />
      )}
    </>
  );
}