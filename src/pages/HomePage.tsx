// React component for the home page with map and sidebar
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

const HomePage = () => {
  const position = [51.505, -0.09] as [number, number];

  // Custom icon for tree markers
  const treeIcon = new Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/490/490091.png',
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25],
  });

  return (
    <div className="flex h-screen">
      <div className="sidebar h-screen w-80 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-green-700">GreenTwin</h1>
          <p className="text-sm text-gray-600">Tree Management System</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Login</h2>
          <form>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your email"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your password"
              />
            </div>
            
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Login
            </button>
            
            <div className="text-center mt-4">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <a href="#" className="text-green-500 hover:text-green-700">
                  Create one
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <MapContainer center={position} zoom={13} className="map-container h-screen w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={treeIcon}>
            <Popup>
              <div>
                <h3 className="font-bold">Sample Tree</h3>
                <p>This is a sample tree marker</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default HomePage;
