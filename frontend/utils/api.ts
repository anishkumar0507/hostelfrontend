// API utility functions

// Get API base URL from environment variable
// In production, VITE_API_BASE_URL must be set (e.g., https://your-backend.onrender.com/api)
// For local development, use VITE_API_BASE_URL=https://hostelbackend-98mc.onrender.com/api
export const getApiBaseUrl = (): string => {
  // Try to get from import.meta.env (set at build time by Vite)
  let apiUrl = import.meta.env.VITE_API_BASE_URL;
  
  // In production, if not set, check if we can derive from window location
  if (!apiUrl) {
    if (import.meta.env.PROD) {
      // Try to use window.API_BASE_URL if it was injected
      if (typeof window !== 'undefined' && (window as any).API_BASE_URL) {
        apiUrl = (window as any).API_BASE_URL;
      }
      
      // If still not available, throw error
      if (!apiUrl) {
        throw new Error(
          'VITE_API_BASE_URL environment variable is not set. ' +
          'Please set it in your .env or Vercel environment variables. ' +
          'Example: https://hostelbackend-98mc.onrender.com/api'
        );
      }
    } else {
      // Fallback for local development only
      apiUrl = 'https://hostelbackend-98mc.onrender.com/api';
    }
  }
  
  if (!apiUrl) {
    return apiUrl;
  }

  // Normalize base URL to include /api if missing
  if (!apiUrl.endsWith('/api') && !apiUrl.includes('/api/')) {
    apiUrl = apiUrl.replace(/\/+$/, '') + '/api';
  }

  return apiUrl;
};

export const API_BASE_URL = getApiBaseUrl();

export const getSocketBaseUrl = (): string => {
  return API_BASE_URL.replace(/\/api\/?$/, '');
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
  requiresPasswordChange?: boolean;
  forcePasswordChange?: boolean;
  // Some backend endpoints return payload under these keys
  complaints?: any;
  complaint?: any;
  leaves?: any;
  leave?: any;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

// Decode JWT token
export const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('user_token');
};

// API request helper
const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      void text;
      throw new Error('Invalid response from server');
    }

    if (!response.ok) {
      // Handle specific HTTP status codes with clear error messages
      let errorMessage = data.message || data.error;
      
      if (!errorMessage) {
        switch (response.status) {
          case 401:
            errorMessage = 'Invalid email or password. Please check your credentials.';
            break;
          case 403:
            errorMessage = 'Access denied. You do not have permission to perform this action.';
            // If getting 403, user role might be out of sync - suggest logout
            if (getAuthToken()) {
              errorMessage += ' Your session may have expired. Please logout and login again.';
              // Auto-logout on 403 to clear stale tokens
              localStorage.removeItem('user_token');
              localStorage.removeItem('user_role');
            }
            break;
          case 404:
            errorMessage = 'Resource not found.';
            break;
          case 400:
            errorMessage = 'Invalid request. Please check your input.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Request failed with status ${response.status}`;
        }
      }
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).data = data;
      throw error;
    }

    return data;
  } catch (error: any) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check if the backend server is running.');
    }
    // Re-throw API errors with status codes
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiRequest<{ token: string; user: any; requiresPasswordChange?: boolean }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  wardenSignup: async (name: string, email: string, password: string) => {
    return apiRequest<{ token: string; user: any }>('/auth/warden-signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// Students API
export const studentsAPI = {
  getProfile: () => apiRequest('/students/profile'),
  getAll: () => apiRequest('/students'),
  getAllWithLocations: () => apiRequest('/students/locations/all'),
  getById: (id: string) => apiRequest(`/students/${id}`),
  create: (data: any) =>
    apiRequest('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/students/${id}`, {
      method: 'DELETE',
    }),
};

// Entry-Exit API
export const entryExitAPI = {
  markEntry: (data: { studentId?: string; method?: string }) =>
    apiRequest('/entry-exit/entry', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  markExit: (data: { studentId?: string; method?: string }) =>
    apiRequest('/entry-exit/exit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getLogs: (params?: { studentId?: string; startDate?: string; endDate?: string; status?: string; method?: string }) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest(`/entry-exit/logs${queryString}`);
  },
  getMyLogs: () => apiRequest('/entry-exit/my-logs'),
};

// Fees API
export const feesAPI = {
  getAll: (params?: { studentId?: string; status?: string; term?: string }) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest(`/fees${queryString}`);
  },
  getById: (id: string) => apiRequest(`/fees/${id}`),
  create: (data: any) =>
    apiRequest('/fees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest(`/fees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  markPaid: (id: string, receiptNumber?: string) =>
    apiRequest(`/fees/${id}/mark-paid`, {
      method: 'PUT',
      body: JSON.stringify({ receiptNumber }),
    }),
  delete: (id: string) =>
    apiRequest(`/fees/${id}`, {
      method: 'DELETE',
    }),
};

// Payments API (warden only - payment summary)
export const paymentsAPI = {
  getSummary: () => apiRequest('/payments'),
  // Student payment endpoint (temporary deployment: records payment against pending fees)
  pay: (data: { amount: number }) =>
    apiRequest('/payments/pay', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Complaints API
export const complaintsAPI = {
  create: async (data: { title: string; description: string; category: string; priority?: string }) => {
    const res = await apiRequest('/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { ...res, data: (res as any).complaint ?? res.data };
  },
  getAll: async () => {
    const res = await apiRequest('/complaints');
    return { ...res, data: (res as any).complaints ?? res.data };
  },
  getMy: async () => {
    const res = await apiRequest('/complaints/my');
    return { ...res, data: (res as any).complaints ?? res.data };
  },
  updateStatus: async (id: string, data: { status: string; resolution?: string }) => {
    const res = await apiRequest(`/complaints/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { ...res, data: (res as any).complaint ?? res.data };
  },
};

// Leaves API
export const leavesAPI = {
  create: async (data: { reason: string; type: string; outDate: string; inDate: string; outTime?: string; inTime?: string }) => {
    const res = await apiRequest('/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { ...res, data: (res as any).leave ?? res.data };
  },
  cancel: async (id: string) => {
    const res = await apiRequest(`/leaves/${id}/cancel`, { method: 'PUT' });
    return { ...res, data: (res as any).leave ?? res.data };
  },
  getAll: async (params?: { status?: string }) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const res = await apiRequest(`/leaves${queryString}`);
    return { ...res, data: (res as any).leaves ?? res.data };
  },
  getMy: async () => {
    const res = await apiRequest('/leaves/my');
    return { ...res, data: (res as any).leaves ?? res.data };
  },
  updateStatus: async (id: string, data: { status: string; rejectionReason?: string }) => {
    const res = await apiRequest(`/leaves/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { ...res, data: (res as any).leave ?? res.data };
  },
  parentApproval: async (id: string, data: { status: string; rejectionReason?: string }) => {
    const res = await apiRequest(`/leaves/${id}/parent-approval`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { ...res, data: (res as any).leave ?? res.data };
  },
  exportOutingReport: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/warden/outing/export`, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to export outing report');
      }
      throw new Error('Failed to export outing report');
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition');
    const fileNameMatch = contentDisposition?.match(/filename="?([^";]+)"?/i);
    const fileName = fileNameMatch?.[1] || 'outing-report.xlsx';

    return { blob, fileName };
  },
};

// Parent API
export const parentAPI = {
  getChild: () => apiRequest('/parent/child'),
  getChildRoom: () => apiRequest('/parent/child/room'),
  getChildFees: () => apiRequest('/parent/child/fees'),
  getChildEntryExit: (params?: { month?: string; year?: string }) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest(`/parent/child/entry-exit${queryString}`);
  },
  getChildLeaves: () => apiRequest('/parent/child/leaves'),
  getChildStatus: () => apiRequest('/parent/child/status'),
  getChildLocation: () => apiRequest('/parent/child/location'),
  register: (data: { studentId: string; name: string; email: string; relationship?: string }) =>
    apiRequest('/parent/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Location API
export const locationAPI = {
  update: (data: { lat: number; lng: number; accuracy?: number }) =>
    apiRequest('/location/update', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyStatus: () => apiRequest('/location/me'),
  getStudent: (studentId: string) => apiRequest(`/location/latest/${studentId}`),
  getStudentHistory: (studentId: string, since?: string) => apiRequest(`/location/history/${studentId}${since ? '?since=' + encodeURIComponent(since) : ''}`),
  // Student: report permission status
  reportPermission: (permissionGranted: boolean) => apiRequest('/location/permission', { method: 'POST', body: JSON.stringify({ permissionGranted }) }),
  // Warden: enable/disable tracking for a student
  setTrackingForStudent: (studentId: string, enabled: boolean) =>
    apiRequest(`/location/${studentId}/tracking`, {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    }),
};

// Chat API
export const chatAPI = {
  getMyChat: () => apiRequest('/chat'),
  sendMessage: (text: string) =>
    apiRequest('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
  getWardenChats: () => apiRequest('/chat/warden'),
  getWardenChatById: (chatId: string) => apiRequest(`/chat/warden/${chatId}`),
  wardenSendMessage: (chatId: string, text: string) =>
    apiRequest(`/chat/warden/${chatId}/message`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
};

