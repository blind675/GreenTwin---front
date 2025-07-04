import { useState, useEffect } from 'react';
import { waterTree } from '../services/treeService';
import AddTreeForm from './AddTreeForm';

interface WaterTreeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const WaterTreeForm = ({ onSuccess, onCancel }: WaterTreeFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'getting' | 'success' | 'error'>('idle');
  const [showAddTreeForm, setShowAddTreeForm] = useState(false);

  // Get current location when component mounts
  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocationStatus('error');
      return;
    }

    setLocationStatus('getting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationStatus('success');
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to retrieve your location. Please enable location services.');
        setLocationStatus('error');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleWaterTree = async () => {
    if (!coordinates) {
      setError('Location coordinates are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await waterTree(coordinates);

      setSuccess(true);
      setLoading(false);

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000); // Show success message for 2 seconds before calling onSuccess
      }
    } catch (err: any) {
      console.error('Error watering tree:', err);
      setLoading(false);

      // Check if the error is TREE_NOT_FOUND
      if (err.response && err.response.data && err.response.data.code === 'TREE_NOT_FOUND') {
        // Show the add tree form instead of error message
        setShowAddTreeForm(true);
      } else {
        setError(err.message || 'Failed to water tree. Please try again.');
      }
    }
  };

  return (
    <div>
      {showAddTreeForm && coordinates ? (
        <AddTreeForm
          latitude={coordinates.latitude}
          longitude={coordinates.longitude}
          onSuccess={onSuccess || (() => { })}
          onCancel={() => setShowAddTreeForm(false)}
        />
      ) : (
        <>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#333333' }}>Water a Tree</h2>

          {error && (
            <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', marginBottom: '15px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ padding: '10px', backgroundColor: '#dcfce7', color: '#333333', borderRadius: '4px', marginBottom: '15px' }}>
              Tree watered successfully! Thank you for helping the environment.
            </div>
          )}

          <div style={{ marginBottom: '18px', padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#333333' }}>Your Location</h3>

            {locationStatus === 'getting' && (
              <p style={{ color: '#6b7280' }}>Getting your current location...</p>
            )}

            {locationStatus === 'success' && coordinates && (
              <div>
                <p style={{ marginBottom: '5px', color: '#333333' }}>
                  <strong>Latitude:</strong> {coordinates.latitude.toFixed(6)}
                </p>
                <p style={{ marginBottom: '5px', color: '#333333' }}>
                  <strong>Longitude:</strong> {coordinates.longitude.toFixed(6)}
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '10px' }}>
                  These coordinates will be used to find and water the nearest tree.
                </p>
              </div>
            )}

            {locationStatus === 'error' && (
              <div>
                <p style={{ color: '#dc2626', marginBottom: '10px' }}>
                  Unable to get your location. Please enable location services.
                </p>
                <button
                  onClick={getLocation}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#4b5563',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleWaterTree}
              disabled={loading || locationStatus !== 'success' || success}
              style={{
                flex: '1',
                padding: '10px',
                backgroundColor: (loading || locationStatus !== 'success' || success) ? '#9ca3af' : '#15803d',
                color: '#f3f4f6',
                border: 'none',
                borderRadius: '4px',
                cursor: (loading || locationStatus !== 'success' || success) ? 'default' : 'pointer'
              }}
            >
              {loading ? 'Watering...' : success ? 'Watered!' : 'Water Tree'}
            </button>

            {onCancel && (
              <button
                onClick={onCancel}
                disabled={loading}
                style={{
                  flex: '1',
                  padding: '10px',
                  backgroundColor: '#f3f4f6',
                  color: '#333333',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: loading ? 'default' : 'pointer'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WaterTreeForm;
