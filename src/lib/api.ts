const API_URLS = {
  auth: 'https://functions.poehali.dev/a6f1aabb-03be-4acd-a418-b2b5854d34d8',
  documents: 'https://functions.poehali.dev/ef8886b1-577a-463b-bf2f-76784d95602b',
  activity: 'https://functions.poehali.dev/48474da9-402f-47ba-bbbd-75ff8c867798'
};

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  region?: string;
}

export interface Document {
  id: number;
  number: string;
  type: string;
  date: string;
  registration_date: string;
  status: string;
  party1_name: string;
  party1_passport: string;
  party2_name?: string;
  party2_passport?: string;
  subject: string;
  notes?: string;
  created_by_name?: string;
}

export interface Activity {
  id: number;
  action_type: string;
  description: string;
  created_at: string;
  document_number?: string;
}

export const auth = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    return response.json();
  },

  async getUser(token: string): Promise<User> {
    const response = await fetch(API_URLS.auth, {
      method: 'GET',
      headers: { 'X-Auth-Token': token }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user');
    }
    
    const data = await response.json();
    return data.user;
  }
};

export const documents = {
  async getAll(params?: { search?: string; type?: string; status?: string }): Promise<Document[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    
    const url = `${API_URLS.documents}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }
    
    const data = await response.json();
    return data.documents;
  },

  async create(token: string, documentData: any): Promise<{ success: boolean; document: any }> {
    const response = await fetch(API_URLS.documents, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token
      },
      body: JSON.stringify(documentData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create document');
    }
    
    return response.json();
  }
};

export const activity = {
  async getHistory(token: string): Promise<Activity[]> {
    const response = await fetch(API_URLS.activity, {
      method: 'GET',
      headers: { 'X-Auth-Token': token }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch activity');
    }
    
    const data = await response.json();
    return data.activities;
  }
};
