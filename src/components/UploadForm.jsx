// frontend/src/components/UploadForm.jsx
import React, { useState } from 'react';
import { uploadImage } from '../api/mealApi';

export default function UploadForm({ onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = e => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await uploadImage(file);
      // data is segmentation response
      onResult({ data, file });
    } catch (err) {
      console.error(err);
      setError('Upload or segmentation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Upload & Analyze'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
