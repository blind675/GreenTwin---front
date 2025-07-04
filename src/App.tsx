import { useEffect, useRef, useState, useContext } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AuthContext } from './contexts/AuthContext';
import RegisterForm from './components/RegisterForm';
import WaterTreeForm from './components/WaterTreeForm';
import { fetchTrees as fetchTreesService } from './services/treeService';

// Define the tree data interface
interface Tree {
  id: number;
  scientificName: string;
  latitude: number;
  longitude: number;
  lastWatered: string | null;
  responsibleUserId: number | null;
  responsibleUser?: {
    name: string;
    email: string;
  };
}

function App() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [showRegisterForm, setShowRegisterForm] = useState<boolean>(false);
  const [showWaterTreeForm, setShowWaterTreeForm] = useState<boolean>(false);

  // Get auth context
  const { user, isAuthenticated, login, logout } = useContext(AuthContext);

  // Timisoara, Romania coordinates
  const timisoaraCoordinates = [45.760696, 21.226788] as [number, number];

  // Define fetchTrees function for reuse
  const fetchTrees = async () => {
    try {
      setLoading(true);
      try {
        // Try to fetch from API using treeService
        const serviceTrees = await fetchTreesService();
        
        // Map service trees to the App's Tree interface
        const mappedTrees: Tree[] = serviceTrees.map(serviceTree => ({
          id: serviceTree.id,
          scientificName: serviceTree.scientificName,
          latitude: serviceTree.latitude,
          longitude: serviceTree.longitude,
          lastWatered: serviceTree.lastWateredAt,
          responsibleUserId: serviceTree.responsibleUser?.id || null,
          responsibleUser: serviceTree.responsibleUser ? {
            name: serviceTree.responsibleUser.name,
            email: serviceTree.responsibleUser.email
          } : undefined
        }));
        
        setTrees(mappedTrees);
        setError(null);
      } catch (apiError) {
        // If API fails, use sample data
        console.log('API not available, using sample data');
        setError('API not available, using sample data');
      }
    } catch (err) {
      console.error('Error setting up tree data:', err);
      setError('Failed to load trees. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch trees when component mounts
  useEffect(() => {
    fetchTrees();
  }, []);

  // Initialize map only once when component mounts
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Create map instance centered on Timisoara, Romania
      const map = L.map(mapRef.current).setView(timisoaraCoordinates, 13);
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);
    }

    // Cleanup function to remove map when component unmounts
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [timisoaraCoordinates]);

  // Update markers when tree data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Custom tree icon
    const treeIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/490/490091.png',
      iconSize: [25, 25],
      iconAnchor: [12, 25],
      popupAnchor: [0, -25]
    });

    // Add markers for each tree when data is loaded
    if (!loading && trees.length > 0) {
      trees.forEach(tree => {
        L.marker([tree.latitude, tree.longitude], { icon: treeIcon })
          .addTo(map)
          .bindPopup(`
            <div>
              <h3 style="font-weight: bold;">${tree.scientificName}</h3>
              <p>Last watered: ${tree.lastWatered ? new Date(tree.lastWatered).toLocaleDateString() : 'Never'}</p>
              ${tree.responsibleUser ? `<p>Responsible: ${tree.responsibleUser.name}</p>` : ''}
            </div>
          `);
      });
    } else if (!loading && error) {
      // Show error message on the map if trees couldn't be loaded
      L.popup()
        .setLatLng(timisoaraCoordinates)
        .setContent(`<p style="color: red;">${error}</p>`)
        .openOn(map);
    } else if (loading) {
      // Show loading message
      L.popup()
        .setLatLng(timisoaraCoordinates)
        .setContent('<p>Loading trees...</p>')
        .openOn(map);
    }
  }, [trees, loading, error, timisoaraCoordinates]);

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError('Please enter both email and password');
      return;
    }

    try {
      setLoginLoading(true);
      setLoginError(null);
      await login(email, password);
    } catch (err) {
      console.error('Login failed:', err);
      setLoginError('Invalid email or password');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: window.innerWidth < 768 ? 'column' : 'row',
      height: '100vh',
      width: '100vw'
    }}>
      <div style={{
        flex: window.innerWidth < 768 ? '1 0 auto' : '0 0 300px',
        maxHeight: window.innerWidth < 768 ? '75vh' : '100vh',
        padding: '20px',
        backgroundColor: 'white',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        overflowY: 'auto',
        zIndex: 1000
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d', marginBottom: '18px' }}>GreenTwin</h1>
        <p style={{ marginBottom: '18px', color: '#333333' }}>Tree Management System</p>

        {/* Tree Data Status */}
        <div style={{ marginBottom: '18px', padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#333333' }}>Tree Data</h2>
          {loading ? (
            <p style={{ color: '#6b7280' }}>Loading tree data...</p>
          ) : error ? (
            <p style={{ color: '#dc2626' }}>{error}</p>
          ) : (
            <div>
              <p style={{ marginBottom: '5px', color: '#333333' }}><strong>{trees.length}</strong> trees found in Timisoara</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                {trees.filter(t => t.responsibleUserId).length} trees assigned to users
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                {trees.filter(t => t.lastWatered).length} trees watered recently
              </p>
            </div>
          )}
        </div>

        {isAuthenticated ? (
          // User profile when logged in
          <div style={{ marginBottom: '18px' }}>
            {showWaterTreeForm ? (
              // Water tree form when button is clicked
              <WaterTreeForm
                onSuccess={() => {
                  setShowWaterTreeForm(false);
                  // Refresh tree data after watering
                  fetchTrees();
                }}
                onCancel={() => setShowWaterTreeForm(false)}
              />
            ) : (
              // Regular user profile
              <>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#333333' }}>User Profile</h2>
                <div style={{ padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '15px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333333' }}>{user?.name}</p>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '10px' }}>{user?.email}</p>
                  <p style={{ fontSize: '14px', marginBottom: '10px', color: '#333333' }}>
                    <strong>My Trees:</strong> {trees.filter(t => t.responsibleUserId === user?.id).length}
                  </p>
                  <button
                    onClick={handleLogout}
                    style={{ width: '100%', padding: '8px', backgroundColor: '#dc2626', color: '#333333', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
                  >
                    Logout
                  </button>
                </div>

                {/* Tree actions for logged in users */}
                <div style={{ marginTop: '18px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#333333' }}>Tree Actions</h3>
                  <button
                    onClick={() => setShowWaterTreeForm(true)}
                    style={{ width: '100%', padding: '8px', backgroundColor: '#047857', color: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Water Tree
                  </button>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', textAlign: 'center' }}>
                    If no tree is found at your location, you'll be able to add a new one.
                  </p>
                </div>
              </>
            )}
          </div>
        ) : showRegisterForm ? (
          // Registration form
          <div style={{ marginBottom: '20px' }}>
            <RegisterForm
              onSuccess={() => setShowRegisterForm(false)}
              onCancel={() => setShowRegisterForm(false)}
            />
          </div>
        ) : (
          // Login form when not authenticated
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#333333' }}>Login</h2>
            {loginError && (
              <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', marginBottom: '15px' }}>
                {loginError}
              </div>
            )}
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333333' }}>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  placeholder="Enter your email"
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333333' }}>Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: loginLoading ? '#9ca3af' : '#15803d',
                  color: '#f3f4f6',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loginLoading ? 'default' : 'pointer'
                }}
              >
                {loginLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            {/* Registration link */}
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Don't have an account?</p>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowRegisterForm(true);
                }}
                style={{ color: '#15803d', textDecoration: 'none', fontWeight: 'bold' }}
              >
                Register
              </a>
            </div>
          </div>
        )}
      </div>

      <div style={{
        flex: '1',
        position: 'relative',
        minHeight: window.innerWidth < 768 ? '25vh' : '100vh'
      }}>
        <div
          ref={mapRef}
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    </div>
  );
}

export default App;
