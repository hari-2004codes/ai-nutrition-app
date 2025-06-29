import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Camera, ChevronDown, ChevronUp, SquareChevronDown, Plus, CheckCircle2 } from 'lucide-react'; // Added CheckCircle2 for selection
import LoadingSpinner from '../general_comp/LoadingSpinner';
import FoodSearch from '../mealLog_comp/FoodSearch';
import toast from 'react-hot-toast';

export default function ImageUploadModal({ isOpen, onClose, onDishesConfirmed, addFoodToMeal }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [selectedDishes, setSelectedDishes] = useState({});
  const [imageId, setImageId] = useState(null);
  const [step, setStep] = useState('upload');
  const [expandedItems, setExpandedItems] = useState({});
  const [error, setError] = useState(null);
  const [subclassesExpanded, setSubclassesExpanded] = useState({});
  const [loadingText, setLoadingText] = useState('');

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
    setStep('upload');
    setExpandedItems({});
    setError(null);
    setSubclassesExpanded({});
    setLoadingText('');
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
    setLoadingText('Analyzing your image...');

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      setLoadingText('Detecting food items...');
      const res = await axios.post('/api/meals/segment', formData);
      setPredictions(res.data.segmentation_results || []);
      setImageId(res.data.imageId);
      setStep('select');
    } catch (error) {
      console.error('Segment error:', error);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  };

  const toggleDetails = (itemIndex) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemIndex]: !prev[itemIndex]
    }));
  };

  const toggleSubclasses = (itemIndex, event) => {
    event.stopPropagation();
    setSubclassesExpanded(prev => ({
      ...prev,
      [itemIndex]: !prev[itemIndex]
    }));
  };

  const handleDishSelect = (itemIndex, predIndex, subclassIndex = null) => {
    const item = predictions[itemIndex];
    const prediction = item.recognition_results[predIndex];
    const position = itemIndex + 1;
    
    let selectedName = prediction.name;
    let selectedId = prediction.id;
    
    if (subclassIndex !== null && prediction.subclasses && prediction.subclasses[subclassIndex]) {
      const subclass = prediction.subclasses[subclassIndex];
      selectedName = subclass.name;
      selectedId = subclass.id || prediction.id;
    }
    
    setSelectedDishes(prev => ({
      ...prev,
      [position]: {
        dishId: selectedId,
        name: selectedName,
        position: position,
        predIndex: predIndex,
        subclassIndex: subclassIndex,
        source: "logmeal"
      }
    }));
  };

  const clearItemSelection = (itemIndex) => {
    const position = itemIndex + 1;
    
    setSelectedDishes(prev => {
      const newDishes = { ...prev };
      delete newDishes[position];
      return newDishes;
    });
  };

  const handleManualSelect = (food) => {
    addFoodToMeal(food);
    toast.success('Food item added successfully to your meal!');
    setStep('select');
  };

  const handleConfirm = async () => {
    if (predictions.length === 0) {
      setError('No food items detected.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dishesArray = Object.values(selectedDishes)
        .sort((a, b) => a.position - b.position);

      if (dishesArray.length === 0) {
        onClose();
        return;
      }

      const payload = {
        imageId,
        confirmedClass: dishesArray.map(d => d.dishId),
        source: dishesArray.map(() => "logmeal"),
        food_item_position: dishesArray.map(d => d.position)
      };

      console.log('Sending confirmation payload:', JSON.stringify(payload, null, 2));

      setLoadingText('Confirming dishes...');
      const confirmResponse = await axios.post('/api/meals/confirm', payload);
      console.log('Confirm response:', confirmResponse.data);

      setLoadingText('Getting nutrition...');
      const nutritionRes = await axios.post('/api/meals/nutrition', { imageId });

      if (nutritionRes.data) {
        onDishesConfirmed(nutritionRes.data);
      } else {
        throw new Error('No nutrition data received');
      }
    } catch (error) {
      console.error('Confirm error:', error.response?.data || error.message);
      setError(error.response?.data?.error || error.message || 'Failed to confirm dishes. Please try again.');
      setLoading(false);
      return;
    }
    
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  // New vertical layout implemented below
  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* MODIFIED: Changed max-w for a better vertical layout and added custom-scrollbar class */}
          <div className="bg-dark-200/90 backdrop-blur-md rounded-2xl p-6 w-[95%] max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-card-border relative custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text-base">
                {step === 'upload' && 'Upload Meal Image'}
                {step === 'select' && 'Confirm Your Meal'}
                {step === 'manual' && 'Add Food Manually'}
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
                        className="absolute top-2 right-2 bg-dark-300/80 p-1 rounded-full text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewUrl(null);
                          setSelectedFile(null);
                        }}
                      >
                        <X size={16} />
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
                  className={`w-full py-3 px-4 rounded-xl text-white font-semibold transition-colors ${
                    loading || !selectedFile 
                      ? 'bg-dark-300/70 cursor-not-allowed' 
                      : 'bg-primary-DEFAULT hover:bg-primary-600'
                  }`}
                >
                  {loading ? (
                    <span className="flex justify-center items-center h-full">
                      <LoadingSpinner size="small" text={loadingText} />
                    </span>
                  ) : 'Recognize Food Items'}
                </button>
              </div>
            )}

            {/* MODIFIED: This whole section is now a single vertical flex column */}
            {step === 'select' && predictions.length > 0 && (
              <div className="flex flex-col gap-6">
                {/* MODIFIED: Image is now a banner at the top */}
                <div className="relative rounded-xl overflow-hidden border border-card-border">
                  <img 
                    src={previewUrl} 
                    alt="Meal preview" 
                    className="w-full h-auto max-h-72 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <p className="absolute bottom-0 left-0 right-0 p-4 text-sm text-white font-semibold text-center">
                    We detected {predictions.length} item(s). Please confirm or correct the selections below.
                  </p>
                </div>

                {/* MODIFIED: Item list now flows vertically */}
                <div className="space-y-3">
                  {predictions.map((item, itemIndex) => {
                    const position = itemIndex + 1;
                    const selectedDish = selectedDishes[position];

                    return (
                      <div key={position} className="bg-dark-100/50 p-4 rounded-xl border border-card-border transition-all">
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleDetails(itemIndex)}>
                          <p className="font-semibold text-text-base">
                            Item {itemIndex + 1}:{' '}
                            <span className="font-normal text-primary-400">
                              {selectedDish ? selectedDish.name : 'Not selected'}
                            </span>
                          </p>
                          <button className="p-1 text-text-muted hover:text-text-base">
                            {expandedItems[itemIndex] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </button>
                        </div>
                        
                        {expandedItems[itemIndex] && (
                          <div className="mt-4 flex flex-col gap-2">
                            {item.recognition_results.slice(0, 5).map((pred, predIndex) => (
                              <div key={pred.id}>
                                <div className="flex items-stretch gap-2">
                                  {/* MODIFIED: Redesigned selection button */}
                                  <button
                                    onClick={() => handleDishSelect(itemIndex, predIndex)}
                                    className={`group flex-grow text-left p-3 rounded-lg transition-all text-sm flex justify-between items-center ${
                                      selectedDish?.predIndex === predIndex && selectedDish?.subclassIndex === null
                                        ? 'bg-primary-DEFAULT/20 ring-2 ring-primary-DEFAULT'
                                        : 'bg-dark-200 hover:bg-dark-300'
                                    }`}
                                  >
                                    <div>
                                      <span className="font-semibold text-text-base">{pred.name}</span>
                                      {/* MODIFIED: De-emphasized percentage */}
                                      <span className="ml-2 text-xs text-text-muted">
                                        {(pred.prob * 100).toFixed(1)}%
                                      </span>
                                    </div>
                                    {/* MODIFIED: Added a checkmark for clear visual feedback */}
                                    <CheckCircle2 size={20} className={`text-primary-DEFAULT transition-opacity ${selectedDish?.predIndex === predIndex && selectedDish?.subclassIndex === null ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                                  </button>
                                  
                                  {pred.subclasses?.length > 0 && (
                                    <button 
                                      onClick={(e) => toggleSubclasses(`${itemIndex}-${predIndex}`, e)}
                                      className="p-3 rounded-lg bg-dark-200 hover:bg-dark-300 text-text-muted hover:text-text-base transition-colors flex items-center"
                                    >
                                      <ChevronDown size={16} className={`transition-transform transform ${subclassesExpanded[`${itemIndex}-${predIndex}`] ? 'rotate-180' : ''}`} />
                                    </button>
                                  )}
                                </div>
                                
                                {pred.subclasses?.length > 0 && subclassesExpanded[`${itemIndex}-${predIndex}`] && (
                                  <div className="pl-6 mt-2 space-y-2 border-l-2 border-dark-300 ml-3">
                                    {pred.subclasses.map((subclass, subIndex) => (
                                      <button
                                        key={subclass.id || subIndex}
                                        onClick={() => handleDishSelect(itemIndex, predIndex, subIndex)}
                                        className={`w-full text-left p-2 pl-4 rounded-lg transition-colors text-xs flex justify-between items-center ${
                                          selectedDish?.predIndex === predIndex && selectedDish?.subclassIndex === subIndex
                                          ? 'bg-primary-DEFAULT/20 text-text-base font-semibold'
                                          : 'bg-dark-300/50 hover:bg-dark-300 text-text-muted hover:text-text-base'
                                        }`}
                                      >
                                        <span>{subclass.name}</span>
                                        {selectedDish?.predIndex === predIndex && selectedDish?.subclassIndex === subIndex && <CheckCircle2 size={16} className="text-primary-DEFAULT" />}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                            {/* MODIFIED: Redesigned clear button */}
                            {selectedDish && (
                                <button
                                  onClick={() => clearItemSelection(itemIndex)}
                                  className="self-end text-sm mt-2 px-3 py-1 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium transition-colors"
                                >
                                  Clear Selection
                                </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* MODIFIED: Actions are grouped at the bottom of the modal */}
                <div className="space-y-3 mt-4 pt-4 border-t border-card-border">
                  <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-xl text-white font-semibold transition-colors ${
                      loading
                        ? 'bg-dark-300/70 cursor-not-allowed'
                        : 'bg-primary-DEFAULT hover:bg-primary-600'
                    }`}
                  >
                    {loading ? (
                      <span className="flex justify-center items-center h-full">
                        <LoadingSpinner size="small" text={loadingText} />
                      </span>
                    ) : 'Confirm & Log Meal'}
                  </button>
                  <button 
                    onClick={() => setStep('manual')}
                    className="w-full text-center py-3 px-4 rounded-xl text-text-muted font-medium border border-card-border hover:bg-dark-100 hover:text-text-base transition-colors"
                  >
                    Can't find your dish? Add it manually
                  </button>
                </div>
              </div>
            )}

            {step === 'select' && predictions.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-text-muted">No food items were detected in the image.</p>
                <p className="text-text-muted text-sm">Please try a different image or upload again.</p>
                <button
                  onClick={resetState}
                  className="mt-4 py-2 px-4 rounded-xl bg-primary-DEFAULT hover:bg-primary-600 text-white font-medium transition-colors"
                >
                  Upload New Image
                </button>
              </div>
            )}

            {step === 'manual' && (
              <div className="w-full h-full">
                <FoodSearch
                  onClose={() => setStep('select')}
                  onSelect={handleManualSelect}
                  fullWidth={true}
                  className="max-h-[60vh] overflow-y-auto"
                />
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 bg-dark-200/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <LoadingSpinner text={loadingText} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}