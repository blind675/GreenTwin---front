import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { fetchTrees, Tree } from '../services/treeService';
import { useAuth } from '../hooks/useAuth';
import 'leaflet/dist/leaflet.css';

interface TreeMapProps {
  onTreeSelect?: (tree: Tree) => void;
  onLocationSelect?: (lat: number, lng: number) => void;
}

const TreeMap = ({ onTreeSelect, onLocationSelect }: TreeMapProps) => {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [center] = useState<LatLngExpression>([51.505, -0.09]); // Default center (London)
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadTrees();
    }
  }, [isAuthenticated]);

  const loadTrees = async () => {
    try {
      setLoading(true);
      const data = await fetchTrees();
      setTrees(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load trees:', err);
      setError('Failed to load trees. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const treeIcon = new Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/490/490091.png',
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25],
  });

  // Map click handler component
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (onLocationSelect) {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        }
      },
    });
    return null;
  };

  if (loading && trees.length === 0) {
    return <div className="flex justify-center items-center h-full">Loading trees...</div>;
  }

  if (error && trees.length === 0) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        {error}
        <button 
          onClick={loadTrees} 
          className="ml-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="map-container"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {trees.map((tree) => (
        <Marker
          key={tree.id}
          position={[tree.latitude, tree.longitude]}
          icon={treeIcon}
          eventHandlers={{
            click: () => {
              if (onTreeSelect) {
                onTreeSelect(tree);
              }
            },
          }}
        >
          <Popup>
            <div>
              <h3 className="font-bold">{tree.scientificName}</h3>
              <p>Last watered: {tree.lastWateredAt ? new Date(tree.lastWateredAt).toLocaleDateString() : 'Never'}</p>
              <p>Responsible: {tree.responsibleUser.name}</p>
            </div>
          </Popup>
        </Marker>
      ))}
      
      <MapClickHandler />
    </MapContainer>
  );
};

export default TreeMap;
