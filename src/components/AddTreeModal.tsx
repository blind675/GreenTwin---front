import { useState, useEffect } from 'react';
import { createTree } from '../services/treeService';
import { useAuth } from '../hooks/useAuth';

interface AddTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedLocation: { lat: number; lng: number } | null;
}

const AddTreeModal = ({ isOpen, onClose, onSuccess, selectedLocation }: AddTreeModalProps) => {
  const [scientificName, setScientificName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (selectedLocation) {
      setLatitude(selectedLocation.lat.toString());
      setLongitude(selectedLocation.lng.toString());
    }
  }, [selectedLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scientificName || !latitude || !longitude) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await createTree({
        scientificName,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        responsibleUserId: user?.id || 0,
      });
      
      setScientificName('');
      setLatitude('');
      setLongitude('');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating tree:', err);
      setError(err.response?.data?.message || 'Failed to create tree. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add New Tree</h2>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="scientificName" className="block text-gray-700 text-sm font-bold mb-2">
              Scientific Name
            </label>
            <input
              id="scientificName"
              type="text"
              value={scientificName}
              onChange={(e) => setScientificName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., Quercus robur"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="latitude" className="block text-gray-700 text-sm font-bold mb-2">
              Latitude
            </label>
            <input
              id="latitude"
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., 51.505"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="longitude" className="block text-gray-700 text-sm font-bold mb-2">
              Longitude
            </label>
            <input
              id="longitude"
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., -0.09"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Adding...' : 'Add Tree'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTreeModal;
