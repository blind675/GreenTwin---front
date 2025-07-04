import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Tree, waterTree } from '../services/treeService';

interface SidebarProps {
  selectedTree: Tree | null;
  onAddTree: () => void;
  onRefresh: () => void;
}

const Sidebar = ({ selectedTree, onAddTree, onRefresh }: SidebarProps) => {
  const { user, logout } = useAuth();
  const [isWatering, setIsWatering] = useState(false);
  const [wateringError, setWateringError] = useState<string | null>(null);
  const [wateringSuccess, setWateringSuccess] = useState<string | null>(null);

  const handleWaterTree = async () => {
    if (!selectedTree) return;
    
    setIsWatering(true);
    setWateringError(null);
    setWateringSuccess(null);
    
    try {
      await waterTree({
        latitude: selectedTree.latitude,
        longitude: selectedTree.longitude,
      });
      setWateringSuccess('Tree watered successfully!');
      onRefresh();
    } catch (error) {
      console.error('Error watering tree:', error);
      setWateringError('Failed to water tree. Please try again.');
    } finally {
      setIsWatering(false);
    }
  };

  return (
    <div className="sidebar h-screen w-80 p-6 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-700">GreenTwin</h1>
        <p className="text-sm text-gray-600">Tree Management System</p>
      </div>
      
      {user && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <p className="font-medium">Welcome, {user.name}</p>
          <p className="text-sm text-gray-600">{user.email}</p>
          <button
            onClick={logout}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
      )}
      
      <div className="mb-6">
        <button
          onClick={onAddTree}
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
        >
          Add New Tree
        </button>
      </div>
      
      {selectedTree ? (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">{selectedTree.scientificName}</h2>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Location:</span> {selectedTree.latitude.toFixed(6)}, {selectedTree.longitude.toFixed(6)}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Last Watered:</span>{' '}
              {selectedTree.lastWateredAt
                ? new Date(selectedTree.lastWateredAt).toLocaleDateString()
                : 'Never'}
            </p>
            {selectedTree.lastWateredBy && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Watered By:</span> {selectedTree.lastWateredBy.name}
              </p>
            )}
            <p className="text-sm text-gray-600">
              <span className="font-medium">Responsible:</span> {selectedTree.responsibleUser.name}
            </p>
          </div>
          
          {wateringError && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
              {wateringError}
            </div>
          )}
          
          {wateringSuccess && (
            <div className="mb-4 p-2 bg-green-100 text-green-700 text-sm rounded">
              {wateringSuccess}
            </div>
          )}
          
          <button
            onClick={handleWaterTree}
            disabled={isWatering}
            className={`w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition ${
              isWatering ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isWatering ? 'Watering...' : 'Water This Tree'}
          </button>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-600">Select a tree on the map to see details</p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
