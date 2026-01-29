// API utility functions

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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
      const errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check if the backend server is running.');
    }
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
};
