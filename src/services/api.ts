// Tipuri pentru datele despre copaci
export interface Tree {
  id: number;
  lat: number;
  lng: number;
  type: string;
  status: string;
  lastWateredAt: string;
  responsibleUser?: {
    id: number;
    name: string;
    email: string;
  };
  lastWateredBy?: {
    id: number;
    name: string;
    email: string;
  };
}

// Tipuri pentru datele despre copaci
export interface TreeResponse {
  id: number;
  latitude: number;
  longitude: number;
  scientificName: string;
  status: string;
  lastWateredAt: string;
  responsibleUser?: {
    id: number;
    name: string;
    email: string;
  };
  lastWateredBy?: {
    id: number;
    name: string;
    email: string;
  };
}

// Tipuri pentru datele despre utilizatori
export interface User {
  id: number;
  name: string;
  email: string;
  imageUrl?: string;
  role: 'USER' | 'ADMIN';
  totalScore: number;
  currentMonthScore?: number;
  createdAt: string;
  updatedAt: string;
  monthlyScores?: Array<{
    id: number;
    score: number;
    month: string;
  }>;
}

// URL-ul de bază pentru backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Funcție pentru a prelua toți copacii din backend
export async function fetchTrees(): Promise<Tree[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/trees/public`);
    if (!response.ok) throw new Error('Nu s-au putut prelua copacii');

    const trees = await response.json();

    // Transformă datele pentru a se potrivi cu modelul frontend
    return trees.map((tree: TreeResponse) => ({
      id: tree.id,
      lat: tree.latitude,
      lng: tree.longitude,
      type: tree.scientificName,
      status: getTreeStatus(tree.lastWateredAt),
      lastWateredAt: tree.lastWateredAt,
      responsibleUser: tree.responsibleUser,
      lastWateredBy: tree.lastWateredBy
    }));
  } catch (error) {
    console.error('Eroare la preluarea copacilor:', error);
    throw error; // Aruncă din nou eroarea pentru a fi gestionată de componentă
  }
}

// Funcție pentru a determina starea copacului în funcție de data ultimei udări
export function getTreeStatus(lastWateredAt: string): string {
  const now = new Date();
  const lastWatered = new Date(lastWateredAt);
  const diffDays = Math.floor((now.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 2) {
    return 'Sănătos';
  } else if (diffDays <= 4) {
    return 'Necesită atenție';
  } else {
    return 'Critic';
  }
}

// Funcție pentru a prelua un singur copac după ID
export async function fetchTreeById(id: number): Promise<Tree | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/trees/${id}`);
    if (!response.ok) throw new Error(`Nu s-a putut prelua copacul ${id}`);

    const tree = await response.json();

    // Transformă datele pentru a se potrivi cu modelul frontend
    return {
      id: tree.id,
      lat: tree.latitude,
      lng: tree.longitude,
      type: tree.scientificName,
      status: getTreeStatus(tree.lastWateredAt),
      lastWateredAt: tree.lastWateredAt,
      responsibleUser: tree.responsibleUser,
      lastWateredBy: tree.lastWateredBy
    };
  } catch (error) {
    console.error(`Eroare la preluarea copacului ${id}:`, error);
    throw error; // Aruncă din nou eroarea pentru a fi gestionată de componentă
  }
}

// Funcție pentru a prelua toți utilizatorii (doar pentru admin)
export async function fetchUsers(): Promise<User[]> {
  try {
    const token = localStorage.getItem('greentwin_token');
    if (!token) {
      throw new Error('Nu sunteți autentificat');
    }

    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Nu aveți permisiunea de a accesa această resursă');
      }
      throw new Error('Nu s-au putut prelua utilizatorii');
    }

    return await response.json();
  } catch (error) {
    console.error('Eroare la preluarea utilizatorilor:', error);
    throw error; // Aruncă din nou eroarea pentru a fi gestionată de componentă
  }
}
