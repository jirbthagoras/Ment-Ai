import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import PropTypes from 'prop-types';

const ImageUploader = ({ onImageUrlChange }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);

      // Compress the image
      const options = {
        maxSizeMB: 0.7, // Maximum size in MB
        maxWidthOrHeight: 1920, // Max width or height
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);

      // Convert to base64
      const base64 = await convertToBase64(compressedFile);
      
      // Set preview
      setPreviewUrl(base64);
      
      // Send base64 string to parent component
      onImageUrlChange(base64);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-full"
          />
        )}
      </div>
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload"
          disabled={uploading}
        />
        <label
          htmlFor="image-upload"
          className={`w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {uploading ? 'Processing...' : 'Pilih Foto Profil'}
        </label>
      </div>
      <p className="text-xs text-white text-center">
        Maximum file size: 700KB
      </p>
    </div>
  );
};

ImageUploader.propTypes = {
  onImageUrlChange: PropTypes.func.isRequired
};

export default ImageUploader; 