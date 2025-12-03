import axios from 'axios';
import type {
  JournalistListParams,
  JournalistCreateData,
  JournalistUpdateData,
  PitchListParams,
  PitchCreateData,
  PitchUpdateData,
  EmailSendData,
  EmailInteractionsParams,
  NewsroomUpdateData,
  ChatbotCompleteEvent,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apis.scraponwheels.com/ecom/';

// Use proxy in production to avoid CORS issues
// In development (localhost), we can call the API directly
// In production, we use Next.js API routes as a proxy
const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === 'true' || 
                  (typeof window !== 'undefined' && !window.location.hostname.includes('localhost'));

const getBaseURL = () => {
  if (USE_PROXY) {
    // Use Next.js API proxy route
    return '/api/proxy';
  }
  return API_BASE_URL;
};

// Create axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔐 Adding token to ${config.url}:`, token.substring(0, 20) + '...');
    } else {
      console.log(`❌ No token found for ${config.url}`);
    }
  }
  
  return config;
});

// Response interceptor for error handling
// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`, error.response?.data);
    
    // Handle both 401 and 403 as auth failures
    if ((error.response?.status === 401 || error.response?.status === 403) && typeof window !== 'undefined') {
      console.log('🚪 Auth failed - clearing tokens and redirecting');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      sessionStorage.clear();
      
      // Only redirect if not on auth pages
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register') && currentPath !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { api };

// API endpoints
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/api/v1/auth/login', credentials),
  register: (data: { email: string; password: string; first_name: string; last_name: string; company_name: string }) =>
    api.post('/api/v1/auth/register', data),
  profile: () => api.get('/api/v1/auth/profile'),
  
};

export const profileApi = {
  updateProfile: (data: { first_name: string; last_name: string; company_name: string }) =>
    api.put('/api/v1/profile/update', data),
  updatePreferences: (data: { default_tone: string; email_signature?: string }) =>
    api.put('/api/v1/profile/preferences', data),
  sendVerification: (data: { email: string }) =>
    api.post('/api/v1/profile/send-verification', data),
  verifyEmail: (data: { email: string; otp: string }) =>
    api.post('/api/v1/profile/verify-email', data),
  forgotPassword: (data: { email: string }) =>
    api.post('/api/v1/profile/forgot-password', data),
  resetPassword: (data: { email: string; reset_code: string; new_password: string }) =>
    api.post('/api/v1/profile/reset-password', data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post('/api/v1/profile/change-password', data),
};

export const journalistApi = {
  list: (params?: JournalistListParams) => api.get('/api/v1/journalists', { params }),
  create: (data: JournalistCreateData) => api.post('/api/v1/journalists', data),
  get: (id: string) => api.get(`/api/v1/journalists/${id}`),
  update: (id: string, data: JournalistUpdateData) => api.put(`/api/v1/journalists/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/journalists/${id}`),
  stats: () => api.get('/api/v1/journalists/stats/overview'),
};

export const pitchApi = {
  list: (params?: PitchListParams) => api.get('/api/v1/pitches', { params }),
  create: (data: PitchCreateData) => api.post('/api/v1/pitches', data),
  get: (id: string) => api.get(`/api/v1/pitches/${id}`),
  update: (id: string, data: PitchUpdateData) => api.put(`/api/v1/pitches/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/pitches/${id}`),
  regenerate: (id: string) => api.post(`/api/v1/pitches/${id}/regenerate`),
  stats: () => api.get('/api/v1/pitches/stats/overview'),

  rewriteContent: (pitchId: string, settings: {
    content_type: 'email' | 'press_release';
    mood: 'professional' | 'empathetic' | 'enthusiastic' | 'formal' | 'casual';
    length: 'concise' | 'detailed' | 'shorter' | 'longer';
    style: 'grammatical' | 'creative' | 'technical' | 'conversational';
  }) => api.post(`/api/v1/pitches/${pitchId}/rewrite`, settings),

};

export const emailApi = {
  send: (data: EmailSendData) => api.post('/api/v1/emails/send-pitch', data),
  interactions: (params?: EmailInteractionsParams) => api.get('/api/v1/emails/interactions', { params }),
  stats: () => api.get('/api/v1/emails/stats'),
};


export const importApi = {
  preview: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/v1/import/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  execute: (file: File, options: { skip_duplicates?: boolean; update_existing?: boolean } = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('skip_duplicates', String(options.skip_duplicates ?? true));
    formData.append('update_existing', String(options.update_existing ?? false));
    return api.post('/api/v1/import/execute', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  supportedFields: () => api.get('/api/v1/import/supported-fields'),
  template: () => api.get('/api/v1/import/template'),
};


// Add this to your existing lib/api.ts file

export const newsroomApi = {
  // Create newsroom
  create: (data: {
    company_info: {
      name: string;
      description?: string;
      website?: string;
      email?: string;
      phone?: string;
      address?: string;
      logo_url?: string;
      founded_year?: number;
      industry?: string;
      employee_count?: string;
    };
    brand_colors?: {
      primary: string;
      secondary: string;
      accent: string;
    };
    is_public?: boolean;
  }) => api.post('/api/v1/newsroom/', data),

  // Get my newsroom
  getMy: () => api.get('/api/v1/newsroom/my'),

  // Update newsroom
  update: (data: NewsroomUpdateData) => api.put('/api/v1/newsroom/', data),

  // Get newsroom stats
  getStats: () => api.get('/api/v1/newsroom/stats'),

  // Media assets
  uploadMedia: (file: File, title: string, description: string = '') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    return api.post('/api/v1/newsroom/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteMedia: (assetIndex: number) => 
    api.delete(`/api/v1/newsroom/media/${assetIndex}`),

  listMedia: () => api.get('/api/v1/newsroom/media'),

  // Press releases
  addPressRelease: (pitchId: string) => 
    api.post('/api/v1/newsroom/press-release', { pitch_id: pitchId }),

  deletePressRelease: (releaseIndex: number) => 
    api.delete(`/api/v1/newsroom/press-release/${releaseIndex}`),

  listPressReleases: () => api.get('/api/v1/newsroom/press-releases'),

  // Public newsroom
  getPublic: (newsroomId: string) => 
    api.get(`/api/v1/newsroom/${newsroomId}/public`),

  // Toggle public status
  togglePublic: () => api.post('/api/v1/newsroom/toggle-public'),
};

export const chatbotApi = {
  sendMessage: async (data: {
    message: string;
    session_id?: string | null;
    conversation_history?: Array<{
      role: string;
      content: string;
      timestamp: string;
    }>;
  }): Promise<{ data: ChatbotCompleteEvent }> => {
    // Use fetch because axios doesn't handle SSE streaming well
    const url = USE_PROXY 
      ? `/api/proxy/api/v1/chatbot/message`
      : `${API_BASE_URL}/api/v1/chatbot/message`;

    // Attach auth token manually (to match your axios interceptor behavior)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errBody: { detail?: string } | null = null;
      try {
        errBody = await res.json();
      } catch {
        // ignore parse error
      }
      throw { response: { data: errBody || { detail: 'Chatbot request failed' }, status: res.status } };
    }

    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error('No response body from chatbot stream');
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let completeEvent: ChatbotCompleteEvent | null = null;
    let sessionIdFromStream: string | null = null;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith('data:')) continue;

        const jsonStr = line.slice(5).trim();
        if (!jsonStr) continue;

        let eventObj: { type?: string; session_id?: string; [key: string]: unknown };
        try {
          eventObj = JSON.parse(jsonStr) as { type?: string; session_id?: string; [key: string]: unknown };
        } catch {
          continue;
        }

        if (eventObj.type === 'session_id') {
          sessionIdFromStream = eventObj.session_id || null;
        } else if (eventObj.type === 'complete') {
          completeEvent = {
            ...eventObj,
            session_id: eventObj.session_id || sessionIdFromStream || undefined,
          } as ChatbotCompleteEvent;
        }
      }
    }

    if (!completeEvent) {
      throw new Error('No complete event received from chatbot stream');
    }

    return { data: completeEvent };
  },

  getSessions: () => api.get('/api/v1/chatbot/sessions'),
  getSession: (sessionId: string) =>
    api.get(`/api/v1/chatbot/sessions/${sessionId}`),
  deleteSession: (sessionId: string) =>
    api.delete(`/api/v1/chatbot/sessions/${sessionId}`),
  getHealth: () => api.get('/api/v1/chatbot/health'),
};
