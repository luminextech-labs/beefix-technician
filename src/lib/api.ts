const TECH_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://beefix-web.vercel.app'

class ApiClient {
  setToken(token: string | null) {
    this.token = token
    if (token) localStorage.setItem('tech_token', token)
    else localStorage.removeItem('tech_token')
  }
  private token: string | null = null

  getToken() {
    if (this.token) return this.token
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('tech_token')
      return this.token
    }
    return null
  }

  private request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }
    if (token) headers['Authorization'] = `Bearer ${token}`
    // Use relative URL for /api/ paths (local proxy routes), full URL for external
    const url = path.startsWith('/api/') ? path : `${TECH_API_URL}${path}`
    return fetch(url, { ...options, headers }).then(async r => {
      let data: any
      try { data = await r.json() } catch { data = {} }
      if (!r.ok) {
        const msg = data?.message || data?.error || `Server error (${r.status})`
        throw new Error(msg)
      }
      return data as T
    })
  }

  get<T>(path: string) { return this.request<T>(path) }
  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) })
  }
  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
  }
  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' })
  }
  upload<T>(path: string, formData: FormData): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const url = path.startsWith('/api/') ? path : `${TECH_API_URL}${path}`
    return fetch(url, { method: 'POST', headers, body: formData } as any).then(async r => {
      let data: any
      try { data = await r.json() } catch { data = {} }
      if (!r.ok) throw new Error(data?.message || `Server error (${r.status})`)
      return data as T
    })
  }
}

export const api = new ApiClient()

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<{ success: boolean; user: any; token: string }>('/api/auth/login', data),
  me: () => api.get<{ success: boolean; user: any }>('/api/auth/me'),
  logout: () => { api.setToken(null) },
  setToken: (token: string | null) => api.setToken(token),
}

// Orders (for technician)
export const ordersApi = {
  getAll: (params?: { status?: string }) => {
    const query = params?.status ? `?status=${params.status}` : ''
    return api.get<{ success: boolean; orders: any[] }>(`/api/orders${query}`)
  },
  getOne: (id: string) => api.get<{ success: boolean; order: any }>(`/api/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch<{ success: boolean; order: any }>(`/api/orders/${id}`, { status }),
}

// Wallet
export const walletApi = {
  get: () => api.get<{ success: boolean; wallet: any; transactions: any[] }>('/api/wallets'),
}

// Chat
export const chatApi = {
  getRooms: () => api.get<{ success: boolean; rooms: any[] }>('/api/chat/rooms'),
  createRoom: (orderId: string) =>
    api.post<{ success: boolean; room: any }>('/api/chat/rooms', { orderId }),
  getMessages: (roomId: string) =>
    api.get<{ success: boolean; messages: any[] }>(`/api/chat/rooms/${roomId}/messages`),
  sendMessage: (roomId: string, message: string, messageType = 'text') =>
    api.post<{ success: boolean; message: any }>(`/api/chat/rooms/${roomId}/messages`, { message, messageType }),
}

// Notifications
export const notificationsApi = {
  get: () => api.get<{ success: boolean; notifications: any[]; unreadCount: number }>('/api/notifications'),
  markRead: (id: string) => api.patch<{ success: boolean }>('/api/notifications', { id }),
  markAllRead: () => api.patch<{ success: boolean }>('/api/notifications', { markAllRead: true }),
}

// Technicians (profile)
export const techniciansApi = {
  me: () => api.get<{ success: boolean; technician: any; stats: any }>('/api/technicians/me'),
  updateProfile: (data: any) => api.patch<{ success: boolean; technician: any }>('/api/technicians/me', data),
  getPublicProfile: (techId: string) => api.get<{ success: boolean; technician: any }>(`/api/technicians/${techId}/public`),
}

// Services
export const servicesApi = {
  getAll: () => api.get<{ success: boolean; services: any[] }>('/api/technicians/services'),
  add: (data: any) => api.post<{ success: boolean; service: any }>('/api/technicians/services', data),
  remove: (serviceId: string) => api.delete<{ success: boolean }>(`/api/technicians/services?id=${serviceId}`),
}

// Reviews
export const reviewsApi = {
  getByTechnician: (technicianId: string) =>
    api.get<{ success: boolean; reviews: any[]; pagination: any }>(`/api/reviews?technicianId=${technicianId}`),
}

// Categories (public, no auth needed)
export const categoriesApi = {
  getAll: () => api.get<{ success: boolean; categories: any[] }>('/api/categories'),
}

// Upload
  image: (file: File, folder = 'avatars') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    return api.upload<{ success: boolean; url: string }>('/api/upload', formData)
  },
}
