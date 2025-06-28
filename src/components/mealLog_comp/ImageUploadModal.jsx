import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Camera, ChevronDown, ChevronUp, SquareChevronDown, Plus } from 'lucide-react';
import LoadingSpinner from '../general_comp/LoadingSpinner';
import FoodSearch from '../mealLog_comp/FoodSearch';

export default function ImageUploadModal({ isOpen, onClose, onDishesConfirmed }) {
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
    event.stopPropagation(); // Prevent triggering the parent button's onClick
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
    
    // If a subclass is selected, use its details
    if (subclassIndex !== null && prediction.subclasses && prediction.subclasses[subclassIndex]) {
      const subclass = prediction.subclasses[subclassIndex];
      selectedName = subclass.name;
      selectedId = subclass.id || prediction.id; // fallback to parent id if subclass doesn't have one
    }
    
    setSelectedDishes(prev => ({
      ...prev,
      [position]: {
        dishId: selectedId, // Always use the numeric ID
        name: selectedName,
        position: position,
        predIndex: predIndex,
        subclassIndex: subclassIndex,
        source: "logmeal" // Always use logmeal since we're using IDs
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
    const position = Object.keys(selectedDishes).length + 1;
    
    setSelectedDishes(prev => ({
      ...prev,
      [position]: {
        ...food,
        position: position
      },
    }));
  };

  const handleConfirm = async () => {
    if (predictions.length === 0) {
      setError('No food items detected.');
      return;
    }
    if (Object.keys(selectedDishes).length === 0) {
      setError('Please select at least one dish.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dishesArray = Object.values(selectedDishes)
        .sort((a, b) => a.position - b.position);

      // Build arrays in parallel - each index corresponds to the same food item
      const payload = {
        imageId,
        confirmedClass: dishesArray.map(d => d.dishId), // LogMeal IDs
        source: dishesArray.map(() => "logmeal"), // All sources are logmeal
        food_item_position: dishesArray.map(d => d.position) // 1-based positions
      };

      console.log('Sending confirmation payload:', JSON.stringify(payload, null, 2));

      setLoadingText('Confirming dishes...');
      const confirmResponse = await axios.post('/api/meals/confirm', payload);
      console.log('Confirm response:', confirmResponse.data);

      setLoadingText('Getting nutrition...');
      const nutritionRes = await axios.post('/api/meals/nutrition', { imageId });

      onDishesConfirmed(nutritionRes.data);
      onClose();
    } catch (error) {
      console.error('Confirm error:', error.response?.data || error.message);
      setError('Failed to confirm dishes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-dark-200/90 backdrop-blur-md rounded-2xl p-6 w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border border-card-border relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text-base">
                {step === 'upload' && 'Upload Meal Image'}
                {step === 'select' && 'Confirm Food Items'}
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
                    <span className="flex justify-center items-center h-full">
                      <LoadingSpinner size="small" text={loadingText} />
                    </span>
                  ) : 'Recognize Food Items'}
                </button>
              </div>
            )}

            {step === 'select' && predictions.length > 0 && (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-base">Your Meal</h3>
                  <div className="relative rounded-xl overflow-hidden border border-card-border">
                    <img 
                      src={previewUrl} 
                      alt="Meal preview" 
                      className="w-full object-contain"
                    />
                  </div>
                   <p className="text-sm text-text-base font-semibold text-center">
                    We detected {predictions.length} item(s). Select the correct dish.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-base">Confirm Items</h3>
                  <div className="space-y-3 max-h-[60vh] md:max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
                    {predictions.map((item, itemIndex) => {
                      const position = itemIndex + 1;
                      const selectedDish = selectedDishes[position];

                      return (
                        <div key={position} className="bg-dark-100/50 p-4 rounded-xl border border-card-border">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-text-base">
                              Item {itemIndex + 1}:{' '}
                              <span className="font-normal text-primary-400">
                                {selectedDish ? selectedDish.name : 'Not selected'}
                              </span>
                            </p>
                            <button onClick={() => toggleDetails(itemIndex)} className="p-1 text-text-muted hover:text-text-base">
                              {expandedItems[itemIndex] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                          </div>
                          
                          {expandedItems[itemIndex] && (
                            <div className="mt-3 space-y-2">
                              {item.recognition_results.slice(0, 5).map((pred, predIndex) => (
                                <div key={pred.id}>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleDishSelect(itemIndex, predIndex)}
                                      className={`flex-grow text-left p-3 rounded-lg transition-colors text-sm ${
                                        selectedDish?.predIndex === predIndex && selectedDish?.subclassIndex === null
                                          ? 'bg-primary-DEFAULT/50 text-white shadow-lg shadow-primary-DEFAULT/20'
                                          : 'bg-dark-200 hover:bg-dark-100 text-text-base'
                                      }`}
                                    >
                                      <div className="flex justify-between items-center">
                                        <span className="text-text-base font-semibold">{pred.name}</span>
                                        <span className="text-xs text-text-base">
                                          {(pred.prob * 100).toFixed(1)}%
                                        </span>
                                      </div>
                                    </button>
                                    
                                    {pred.subclasses?.length > 0 && (
                                      <button 
                                        onClick={(e) => toggleSubclasses(`${itemIndex}-${predIndex}`, e)}
                                        className="p-3 rounded-lg bg-dark-100 hover:bg-dark-200/30 text-text-muted hover:text-text-base transition-colors"
                                      >
                                        <SquareChevronDown className="text-text-base" size={16} />
                                      </button>
                                    )}
                                  </div>
                                  
                                  {pred.subclasses?.length > 0 && subclassesExpanded[`${itemIndex}-${predIndex}`] && (
                                    <div className="pl-4 mt-2 space-y-2">
                                      {pred.subclasses.map((subclass, subIndex) => (
                                        <button
                                          key={subclass.id || subIndex}
                                          onClick={() => handleDishSelect(itemIndex, predIndex, subIndex)}
                                          className={`w-full text-left p-2 rounded-lg transition-colors text-xs ${
                                            selectedDish?.predIndex === predIndex && selectedDish?.subclassIndex === subIndex
                                            ? 'bg-primary-DEFAULT/50 text-white'
                                            : 'bg-dark-300/50 hover:bg-dark-200/30 text-text-base'
                                          }`}
                                        >
                                          {subclass.name}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                              <button
                                onClick={() => clearItemSelection(itemIndex)}
                                className="w-full text-center p-2 mt-2 rounded-lg bg-red-900/50 text-red-300 hover:bg-red-900/80 text-sm"
                              >
                                Clear Selection
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleConfirm}
                    disabled={loading || Object.keys(selectedDishes).length === 0}
                    className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-colors ${
                      loading || Object.keys(selectedDishes).length === 0
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
                  <div className="flex flex-col justify-center items-center mt-4 bg-dark-100/50 p-4 rounded-xl">
                    <p className="text-text-base text-semibold">
                      Can't find your dish? 
                    </p> 
                    <button 
                    onClick={() => setStep('manual')}
                    className="text-text-base text-semibold flex items-center gap-2 bg-dark-300/50 mt-2 border border-card-border rounded-xl px-4 py-2 hover:bg-red-700/40 transition-colors">
                      <span>Add it manually</span>
                      <Plus size={16} className="text-text-muted" />
                    </button>
                  </div>
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
               <FoodSearch
                onClose={() => setStep('select')}
                onSelect={handleManualSelect}
               />
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