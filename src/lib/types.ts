// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string;
  role: 'user' | 'admin';
  plan: 'free' | 'pro';
  credits_remaining: number;
  preferences: {
    default_tone: string;
    email_signature: string;
  };
  created_at: string;
  last_login?: string;
  status: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company_name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

// Journalist types
export interface Journalist {
  id: string;
  name: string;
  email: string;
  publication: string;
  category: 'technology' | 'business' | 'healthcare' | 'finance' | 'lifestyle' | 'entertainment' | 'sports' | 'other';
  topics: string[];
  country: string;
  timezone: string;
  stats: {
    emails_received: number;
    responses_sent: number;
    articles_published: number;
    last_contacted?: string;
    response_rate: number;
  };
  contact_info: {
    best_time: 'morning' | 'afternoon' | 'evening';
    preferred_day: 'weekday' | 'weekend' | 'any';
    response_time_avg_hours?: number;
  };
  source: string;
  verified: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'bounced';
}

// Pitch types
export interface Pitch {
  id: string;
  headline: string;
  company_name: string;
  key_points: string[];
  industry: string;
  announcement_type: 'product_launch' | 'funding' | 'partnership' | 'executive_hire' | 'award' | 'research' | 'other';
  content: {
    press_release: {
      headline: string;
      body: string;
      word_count: number;
    };
    email_pitch: {
      subject: string;
      body: string;
      word_count: number;
    };
  };
  generation_info: {
    ai_model: string;
    generation_time_ms: number;
    quality_score: number;
  };
  performance: {
    emails_sent: number;
    emails_opened: number;
    responses_received: number;
    articles_published: number;
  };
  status: 'draft' | 'active' | 'sent' | 'archived';
  created_at: string;
  updated_at: string;
}


// 🆕 Content Rewriting types
export interface RewriteSettings {
  content_type: 'email' | 'press_release';
  mood: 'professional' | 'empathetic' | 'enthusiastic' | 'formal' | 'casual';
  length: 'concise' | 'detailed' | 'shorter' | 'longer';
  style: 'grammatical' | 'creative' | 'technical' | 'conversational';
}

export interface RewriteResponse {
  pitch_id: string;
  content_type: 'email' | 'press_release';
  original_content: string;
  rewritten_content: string;
  settings: RewriteSettings;
}

// 🆕 Enhanced Email sending types
export interface SendPitchRequest {
  pitch_id: string;
  journalist_ids: string[];
  custom_subject?: string;
  custom_message?: string;
}

export interface SendPitchResponse {
  message: string;
  sent: Array<{
    journalist_id: string;
    journalist_name: string;
    journalist_email: string;
  }>;
  failed: Array<{
    journalist_id: string;
    error: string;
  }>;
  total_sent: number;
  total_failed: number;
}

// 🆕 Rewrite preset types for UI
export interface RewritePreset {
  name: string;
  mood: RewriteSettings['mood'];
  length: RewriteSettings['length'];
  style: RewriteSettings['style'];
  className: string;
  description?: string;
}


// 🆕 Rewrite option types for UI components
export interface RewriteOption {
  value: string;
  label: string;
  desc: string;
}

export interface RewriteOptions {
  mood: RewriteOption[];
  length: RewriteOption[];
  style: RewriteOption[];
}

// Dashboard stats
export interface DashboardStats {
  journalists: {
    total: number;
    active: number;
    verified: number;
  };
  pitches: {
    total: number;
    draft: number;
    sent: number;
  };
  emails: {
    sent: number;
    opened: number;
    replied: number;
    response_rate: number;
  };
  credits_remaining: number;
}


// 🆕 Predefined rewrite presets
export const REWRITE_PRESETS: RewritePreset[] = [
  {
    name: "Professional & Concise",
    mood: "professional",
    length: "concise",
    style: "grammatical",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    description: "Formal, shorter, perfect grammar"
  },
  {
    name: "Enthusiastic & Creative",
    mood: "enthusiastic", 
    length: "detailed",
    style: "creative",
    className: "bg-green-100 text-green-800 hover:bg-green-200",
    description: "Exciting, detailed, with storytelling"
  },
  {
    name: "Empathetic & Conversational",
    mood: "empathetic",
    length: "shorter", 
    style: "conversational",
    className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    description: "Understanding, shorter, friendly tone"
  }
];

export const REWRITE_OPTIONS: RewriteOptions = {
  mood: [
    { value: 'professional', label: 'Professional', desc: 'Formal business tone' },
    { value: 'empathetic', label: 'Empathetic', desc: 'Understanding & compassionate' },
    { value: 'enthusiastic', label: 'Enthusiastic', desc: 'Exciting & energetic' },
    { value: 'formal', label: 'Formal', desc: 'Academic style' },
    { value: 'casual', label: 'Casual', desc: 'Conversational & friendly' }
  ],
  length: [
    { value: 'concise', label: 'Concise', desc: 'Significantly shorter' },
    { value: 'detailed', label: 'Detailed', desc: 'More comprehensive' },
    { value: 'shorter', label: 'Shorter', desc: '30% reduction' },
    { value: 'longer', label: 'Longer', desc: '50% expansion' }
  ],
  style: [
    { value: 'grammatical', label: 'Grammatical', desc: 'Perfect grammar focus' },
    { value: 'creative', label: 'Creative', desc: 'Metaphors & storytelling' },
    { value: 'technical', label: 'Technical', desc: 'Industry terminology' },
    { value: 'conversational', label: 'Conversational', desc: 'Friendly dialogue' }
  ]
};

// Add these types to your existing lib/types.ts

export interface CompanyInfo {
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
}

export interface MediaAsset {
  type: string;
  title: string;
  description?: string;
  file_url: string;
  file_size: number;
  uploaded_at: string;
}

export interface PressRelease {
  title: string;
  content: string;
  published_date: string;
  pitch_id: string;
  company_name: string;
  industry: string;
}

export interface Newsroom {
  _id: string;
  owner_id: string;
  company_info: CompanyInfo;
  press_releases: PressRelease[];
  media_assets: MediaAsset[];
  brand_colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  is_public: boolean;
  views: number;
  created_at: string;
  last_updated: string;
}

export interface NewsroomStats {
  exists: boolean;
  stats: {
    views: number;
    press_releases: number;
    media_assets: number;
    is_public: boolean;
    last_updated?: string;
    created_at?: string;
  };
}

// lib/types.ts - Add these interfaces

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: Array<{
    type: string;
    status: string;
    result?: any;
    error?: string;
  }>;
  metadata?: {
    suggestions?: Array<{
      title: string;
      description: string;
      action: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    next_steps?: string[];
    tips?: string[];
    credits_used?: number;
    quality_scores?: number[];
  };
}

export interface ChatSession {
  id: string;
  session_name: string;
  created_at: string;
  last_activity: string;
  total_messages: number;
  is_active: boolean;
  preview?: string;
}



export interface ChatbotRequest {
  message: string;
  session_id?: string | null;
  conversation_history?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

export interface ChatbotToolCall {
  tool: string;
  args: Record<string, any>;
}

export interface ChatbotSuggestion {
  title: string;
  description: string;
  action: string;
  priority: string;
}

export interface ChatbotResponse {
  session_id: string;
  message: ChatMessage; // same type you already use in the UI
  actions_executed: ChatbotToolCall[]; // no type/status, just tool+args
  suggestions: ChatbotSuggestion[];
  next_steps: any[];   // backend sends array of objects: { title, description, icon }
  // optional, in case you add later
  tips?: string[];
  performance_info?: {
    credits_used: number;
    quality_scores: number[];
    response_time?: number;
  };
}
