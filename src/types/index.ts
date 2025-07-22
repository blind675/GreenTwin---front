// Tree-related types
export interface TreeData {
  id: number;
  lat: number;
  lng: number;
  type: string;
  status: 'Healthy' | 'Needs Attention' | 'Critical';
  lastUpdated?: string;
  species?: string;
  height?: number;
  diameter?: number;
  plantedDate?: string;
}

// User-related types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

// Authentication types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// Map filter options
export interface MapFilters {
  status?: string[];
  treeTypes?: string[];
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
}
