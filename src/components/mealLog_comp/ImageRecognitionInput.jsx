// src/components/mealLog_comp/ImageRecognitionInput.jsx
import React, { useState, useRef } from 'react';
import { recognizePlateWithErrorHandling } from '../../services/foodRecognitionApi';

const ImageRecognitionInput = ({ onFoodsDetected, disabled = false }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetectFoods = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsDetecting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const result = await recognizePlateWithErrorHandling(formData);

      if (result.success) {
        onFoodsDetected(result.data);
        // Reset the component after successful detection
        setSelectedImage(null);
        setImagePreview(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An unexpected error occurred while detecting foods');
    } finally {
      setIsDetecting(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="image-recognition-input">
      <div className="upload-section">
        <div className="button-group">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={disabled}
            className="btn btn-primary"
          >
            📷 Take a Photo
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="btn btn-secondary"
          >
            📁 Upload Image
          </button>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="image-preview">
          <div className="preview-container">
            <img 
              src={imagePreview} 
              alt="Selected food" 
              className="preview-image"
            />
            <button
              type="button"
              onClick={clearImage}
              className="clear-button"
              aria-label="Clear image"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Detect Foods Button */}
      {selectedImage && (
        <div className="detect-section">
          <button
            type="button"
            onClick={handleDetectFoods}
            disabled={disabled || isDetecting}
            className="btn btn-success detect-button"
          >
            {isDetecting ? '🔍 Detecting Foods...' : '🔍 Detect Foods'}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Drag and Drop Area (Optional Enhancement) */}
      <div 
        className="drag-drop-area"
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => e.preventDefault()}
      >
        <p>Or drag and drop an image here</p>
      </div>

      <style jsx>{`
        .image-recognition-input {
          margin: 20px 0;
          padding: 20px;
          border: 2px dashed #ddd;
          border-radius: 8px;
          text-align: center;
        }

        .button-group {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 15px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background-color: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #545b62;
        }

        .btn-success {
          background-color: #28a745;
          color: white;
        }

        .btn-success:hover:not(:disabled) {
          background-color: #1e7e34;
        }

        .image-preview {
          margin: 15px 0;
        }

        .preview-container {
          position: relative;
          display: inline-block;
          max-width: 300px;
        }

        .preview-image {
          max-width: 100%;
          max-height: 200px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .clear-button {
          position: absolute;
          top: -10px;
          right: -10px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 50%;
          width: 25px;
          height: 25px;
          cursor: pointer;
          font-size: 12px;
        }

        .detect-button {
          width: 200px;
          margin: 10px 0;
        }

        .error-message {
          color: #dc3545;
          margin: 10px 0;
          padding: 10px;
          background-color: #f8d7da;
          border-radius: 5px;
        }

        .drag-drop-area {
          margin-top: 15px;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 5px;
          color: #6c757d;
        }

        .drag-drop-area:hover {
          background-color: #e9ecef;
        }
      `}</style>
    </div>
  );
};

export default ImageRecognitionInput;