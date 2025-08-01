import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchTrees } from '../services/api';
import type { Tree } from '../services/api';
import TreeFilter from './TreeFilter';

// Fix for default marker icons in Leaflet
const DefaultIcon = L.icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Culori personalizate pentru markeri în funcție de starea copacului
const getMarkerColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'sănătos':
      return 'green';
    case 'necesită atenție':
      return 'orange';
    case 'critic':
      return 'red';
    default:
      return 'blue';
  }
};

interface TreeMarkerProps {
  tree: Tree;
  onSelectTree: (tree: Tree) => void;
}

const TreeMarker: React.FC<TreeMarkerProps> = ({ tree, onSelectTree }) => {
  const markerColor = getMarkerColor(tree.status);

  const customIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  // Formatează data ultimei udări
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Marker
      position={[tree.lat, tree.lng]}
      icon={customIcon}
      eventHandlers={{
        click: () => {
          onSelectTree(tree);
        }
      }}
    >
      <Popup>
        <div className="tree-popup">
          <h3 className="font-bold">{tree.name ? tree.name : `Copac ${tree.id}`}</h3>
          <p className="text-sm text-gray-600 mb-2">{tree.type}</p>
          <p className={`status-${tree.status.toLowerCase().replace(' ', '-')}`}>
            Stare: <span className="font-semibold">{tree.status}</span>
          </p>
          <p>Ultima udare: {formatDate(tree.lastWateredAt)}</p>

          {tree.responsibleUser && (
            <p>Responsabil: <span className="font-semibold">{tree.responsibleUser.name}</span></p>
          )}

          {tree.lastWateredBy && (
            <p>Udat de: <span className="font-semibold">{tree.lastWateredBy.name}</span></p>
          )}

          <p className="text-xs mt-2">ID: {tree.id}</p>
        </div>
      </Popup>
    </Marker>
  );
};

const Map: React.FC = () => {
  // Centrat pe Timișoara
  const position: [number, number] = [45.7489, 21.2087];
  const [trees, setTrees] = useState<Tree[]>([]);
  const [filteredTrees, setFilteredTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // State for selected tree - used in marker click handler
  const [, setSelectedTree] = useState<Tree | null>(null);
  const [filters, setFilters] = useState<{
    status: string[];
    types: string[];
  }>({
    status: [],
    types: []
  });
  const [treeStats, setTreeStats] = useState({
    total: 0,
    healthy: 0,
    needsAttention: 0,
    critical: 0
  });
  // Store  // Tree types for filtering - will be populated from API data
  const [, setTreeTypes] = useState<string[]>([]);

  const updateTreeStats = (treeData: Tree[]) => {
    const stats = {
      total: treeData.length,
      healthy: treeData.filter(tree => tree.status.toLowerCase() === 'sănătos').length,
      needsAttention: treeData.filter(tree => tree.status.toLowerCase() === 'necesită atenție').length,
      critical: treeData.filter(tree => tree.status.toLowerCase() === 'critic').length
    };
    setTreeStats(stats);
  };

  useEffect(() => {
    const loadTrees = async () => {
      try {
        setLoading(true);
        const treeData = await fetchTrees();
        setTrees(treeData);
        setFilteredTrees(treeData);
        updateTreeStats(treeData);

        // Extract unique tree types
        const types = Array.from(new Set(treeData.map(tree => tree.type)));
        setTreeTypes(types);

        setLoading(false);
      } catch (err) {
        setError('Failed to load trees');
        setLoading(false);
        console.error('Error loading trees:', err);
      }
    };

    loadTrees();
  }, []);

  // Apply filters whenever filters state changes
  useEffect(() => {
    let filtered = [...trees];

    // Apply status filters
    if (filters.status.length > 0) {
      filtered = filtered.filter(tree => filters.status.includes(tree.status));
    }

    // Apply type filters
    if (filters.types.length > 0) {
      filtered = filtered.filter(tree => filters.types.includes(tree.type));
    }

    setFilteredTrees(filtered);
    updateTreeStats(filtered);
  }, [filters, trees]);

  const handleSelectTree = (tree: Tree) => {
    setSelectedTree(tree);
  };

  const handleFilterChange = (newFilters: { status: string[], types: string[] }) => {
    setFilters(newFilters);
  };

  return (
    <div className="relative h-full w-full">

      {/* Indicator de încărcare */}
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-30 bg-white bg-opacity-70">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent align-[-0.125em]"></div>
            <p className="mt-2">Se încarcă copacii...</p>
          </div>
        </div>
      )}

      {/* Mesaj de eroare */}
      {error && (
        <div className="absolute top-4 right-4 z-30 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Eroare!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Panou de filtrare fix */}
      <div
        className={`absolute top-0 left-0 z-20 transform`}
      >
        <div className="mt-16 ml-4 w-72">
          <TreeFilter
            onFilterChange={handleFilterChange}
            selectedFilters={filters}
          />
        </div>
      </div>

      {/* Rezumat stare copaci */}
      <div className="absolute top-4 right-4 z-20 bg-white p-3 rounded shadow-md">
        <h3 className="font-bold mb-1">Starea Copacilor</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div className="text-green-600">Sănătoși: {treeStats.healthy}</div>
          <div className="text-orange-500">Necesită atenție: {treeStats.needsAttention}</div>
          <div className="text-red-600">Critici: {treeStats.critical}</div>
          <div>Total: {treeStats.total}</div>
        </div>
      </div>

      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredTrees.map(tree => (
          <TreeMarker
            key={tree.id}
            tree={tree}
            onSelectTree={handleSelectTree}
          />
        ))}
      </MapContainer>

      {/* CSS for the tree popup styling */}
      <style>{`
        .tree-popup .status-healthy { color: green; }
        .tree-popup .status-needs-attention { color: orange; }
        .tree-popup .status-critical { color: red; }
      `}</style>
    </div>
  );
};

export default Map;
