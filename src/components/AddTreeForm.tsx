import { useState, useContext } from 'react';
import { createTree, TreeStatus } from '../services/treeService';
import { AuthContext } from '../contexts/AuthContext';

interface AddTreeFormProps {
  latitude: number;
  longitude: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const AddTreeForm: React.FC<AddTreeFormProps> = ({ latitude, longitude, onSuccess, onCancel }) => {
  const [scientificName, setScientificName] = useState<string>('');
  const [status, setStatus] = useState<TreeStatus>('ALIVE');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Get the current user from AuthContext
  const { user } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scientificName.trim()) {
      setError('Scientific name is required');
      return;
    }
    
    // Check if user is authenticated and has an ID
    if (!user || !user.id) {
      setError('You must be logged in to add a tree');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Call the API to create a new tree
      await createTree({
        scientificName,
        latitude,
        longitude,
        status,
        responsibleUserId: user.id // Include the current user's ID
      });
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500); // Show success message for 1.5 seconds before closing
    } catch (err: any) {
      console.error('Error adding tree:', err);
      // Provide more specific error messages if available
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to add tree. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#333333' }}>Add New Tree</h2>
      
      {success ? (
        <div style={{ padding: '15px', backgroundColor: '#d1fae5', borderRadius: '4px', marginBottom: '15px' }}>
          <p style={{ color: '#333333', fontWeight: 'bold' }}>Tree added successfully!</p>
          <p style={{ fontSize: '14px', marginTop: '5px', color: '#333333' }}>The tree has been added to the map.</p>
        </div>
      ) : (
        <>
          <p style={{ marginBottom: '15px', color: '#333333' }}>
            No tree was found at your location. You can add a new tree with the details below:
          </p>
          
          <div style={{ padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '15px' }}>
            <p style={{ fontSize: '14px', marginBottom: '5px', color: '#333333' }}>
              <strong>Latitude:</strong> {latitude.toFixed(6)}
            </p>
            <p style={{ fontSize: '14px', color: '#333333' }}>
              <strong>Longitude:</strong> {longitude.toFixed(6)}
            </p>
          </div>
          
          {error && (
            <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', marginBottom: '15px' }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333333' }}>Scientific Name:</label>
              <input 
                type="text" 
                value={scientificName}
                onChange={(e) => setScientificName(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
                placeholder="e.g., Quercus robur"
              />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                Enter the scientific name of the tree species
              </p>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333333' }}>Tree Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TreeStatus)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <option value="ALIVE">Alive</option>
                <option value="DEAD">Dead</option>
              </select>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                Select the current status of the tree
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  flex: '1', 
                  padding: '10px', 
                  backgroundColor: loading ? '#9ca3af' : '#15803d', 
                  color: '#f3f4f6', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: loading ? 'default' : 'pointer' 
                }}
              >
                {loading ? 'Adding...' : 'Add Tree'}
              </button>
              
              <button 
                type="button" 
                onClick={onCancel}
                style={{ 
                  flex: '1', 
                  padding: '10px', 
                  backgroundColor: '#f3f4f6', 
                  color: '#333333', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '4px', 
                  cursor: 'pointer' 
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default AddTreeForm;
