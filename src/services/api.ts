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

// Tipuri pentru datele despre copaci - actualizare
export interface UpdateTreeInput {
  scientificName?: string;
  responsibleUserId?: number;
}

// Tipuri pentru datele despre utilizatori
// Tipuri pentru schimbarea parolei
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// Tipuri pentru resetarea parolei (admin)
export interface ResetPasswordResponse {
  message: string;
  userId: number;
  userName: string;
  newPassword: string;
}

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

// Funcție pentru a actualiza un copac (doar pentru admin)
export async function updateTree(id: number, data: UpdateTreeInput): Promise<TreeResponse> {
  try {
    const token = localStorage.getItem('greentwin_token');
    if (!token) {
      throw new Error('Nu sunteți autentificat');
    }

    const response = await fetch(`${API_BASE_URL}/trees/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Nu aveți permisiunea de a actualiza acest copac');
      }
      throw new Error(`Nu s-a putut actualiza copacul ${id}`);
    }

    const result = await response.json();
    return result.tree;
  } catch (error) {
    console.error(`Eroare la actualizarea copacului ${id}:`, error);
    throw error;
  }
}

// Funcție pentru a șterge un copac (doar pentru admin)
export async function deleteTree(id: number): Promise<{ message: string, deletedTreeId: number }> {
  try {
    const token = localStorage.getItem('greentwin_token');
    if (!token) {
      throw new Error('Nu sunteți autentificat');
    }

    const response = await fetch(`${API_BASE_URL}/trees/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Nu aveți permisiunea de a șterge acest copac');
      }
      throw new Error(`Nu s-a putut șterge copacul ${id}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Eroare la ștergerea copacului ${id}:`, error);
    throw error;
  }
}

// Funcție pentru a uda toți copacii deodată (doar pentru admin)
export async function waterAllTrees(): Promise<{ message: string, count: number }> {
  try {
    const token = localStorage.getItem('greentwin_token');
    if (!token) {
      throw new Error('Nu sunteți autentificat');
    }

    const response = await fetch(`${API_BASE_URL}/trees/water-all`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Nu aveți permisiunea de a uda toți copacii');
      }
      throw new Error('Nu s-au putut uda toți copacii');
    }

    return await response.json();
  } catch (error) {
    console.error('Eroare la udarea tuturor copacilor:', error);
    throw error;
  }
}

// Funcție pentru a schimba parola utilizatorului curent
export async function changePassword(data: ChangePasswordInput): Promise<{ message: string }> {
  try {
    const token = localStorage.getItem('greentwin_token');
    if (!token) {
      throw new Error('Nu sunteți autentificat');
    }

    const response = await fetch(`${API_BASE_URL}/users/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eroare la schimbarea parolei');
      }
      throw new Error('Nu s-a putut schimba parola');
    }

    return await response.json();
  } catch (error) {
    console.error('Eroare la schimbarea parolei:', error);
    throw error;
  }
}

// Funcție pentru a șterge contul utilizatorului curent
export async function deleteAccount(): Promise<{ message: string }> {
  try {
    const token = localStorage.getItem('greentwin_token');
    if (!token) {
      throw new Error('Nu sunteți autentificat');
    }

    const response = await fetch(`${API_BASE_URL}/users/account`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Nu s-a putut șterge contul');
    }

    // Șterge token-ul din localStorage după ștergerea contului
    localStorage.removeItem('greentwin_token');
    localStorage.removeItem('greentwin_user');

    return await response.json();
  } catch (error) {
    console.error('Eroare la ștergerea contului:', error);
    throw error;
  }
}

// Funcție pentru resetarea parolei unui utilizator (doar pentru admin)
export async function resetUserPassword(userId: number): Promise<ResetPasswordResponse> {
  try {
    const token = localStorage.getItem('greentwin_token');
    if (!token) {
      throw new Error('Nu sunteți autentificat');
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}/reset-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Nu aveți permisiunea de a reseta parola');
      }
      throw new Error('Nu s-a putut reseta parola');
    }

    return await response.json();
  } catch (error) {
    console.error(`Eroare la resetarea parolei pentru utilizatorul ${userId}:`, error);
    throw error;
  }
}
