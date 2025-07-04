import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

interface RegisterFormProps {
  onSuccess?: () => void;
  onCancel: () => void;
}

const RegisterForm = ({ onSuccess, onCancel }: RegisterFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await register(name, email, password);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Create Account</h2>
      
      {error && (
        <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', marginBottom: '15px' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
            placeholder="Enter your full name"
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
            placeholder="Enter your email"
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
            placeholder="Create a password"
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Confirm Password:</label>
          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
            placeholder="Confirm your password"
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              flex: '1',
              padding: '10px', 
              backgroundColor: loading ? '#9ca3af' : '#15803d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: loading ? 'default' : 'pointer' 
            }}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
          
          <button 
            type="button" 
            onClick={onCancel}
            style={{ 
              flex: '1',
              padding: '10px', 
              backgroundColor: '#f3f4f6', 
              color: '#374151', 
              border: '1px solid #d1d5db', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
