import api from '../api';

export interface Tree {
  id: number;
  latitude: number;
  longitude: number;
  scientificName: string;
  lastWateredAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastWateredBy: {
    id: number;
    name: string;
    email: string;
  } | null;
  responsibleUser: {
    id: number;
    name: string;
    email: string;
  };
}

export const fetchTrees = async (): Promise<Tree[]> => {
  try {
    const response = await api.get('/trees/public');
    return response.data;
  } catch (error) {
    console.error('Error fetching trees:', error);
    throw error;
  }
};

export const createTree = async (treeData: {
  latitude: number;
  longitude: number;
  scientificName: string;
  responsibleUserId?: number;
}): Promise<Tree> => {
  try {
    const response = await api.post('/trees', treeData);
    return response.data;
  } catch (error) {
    console.error('Error creating tree:', error);
    throw error;
  }
};

export const waterTree = async (coordinates: {
  latitude: number;
  longitude: number;
}): Promise<Tree> => {
  try {
    const response = await api.put('/trees/water', coordinates);
    return response.data;
  } catch (error) {
    console.error('Error watering tree:', error);
    throw error;
  }
};
