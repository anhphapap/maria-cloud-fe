/**
 * Mock data để test frontend khi backend chưa sẵn sàng
 * Sử dụng khi API chưa ready hoặc muốn test UI
 */

export const mockProjects = [
  {
    id: 1,
    name: 'E-commerce API',
    databaseType: 'PostgreSQL',
    status: 'Active',
    region: 'US-East-1',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    name: 'Analytics Dashboard',
    databaseType: 'MySQL',
    status: 'Active',
    region: 'EU-West-2',
    createdAt: '2024-02-20'
  },
  {
    id: 3,
    name: 'Mobile App Backend',
    databaseType: 'PostgreSQL',
    status: 'Sleeping',
    region: 'AP-South-1',
    createdAt: '2024-03-10'
  }
]

export const mockDatabases = [
  {
    id: 1,
    name: 'prod-db-001',
    type: 'PostgreSQL',
    status: 'active',
    size: '2.5 GB',
    connections: 45
  },
  {
    id: 2,
    name: 'analytics-db',
    type: 'MySQL',
    status: 'active',
    size: '1.2 GB',
    connections: 23
  },
  {
    id: 3,
    name: 'staging-db',
    type: 'MariaDB',
    status: 'sleeping',
    size: '500 MB',
    connections: 0
  }
]

export const mockStats = {
  totalProjects: 12,
  activeDatabases: 8,
  recentBackups: 3,
  allSystemsOperational: true,
  accessData: [
    { day: 'Mon', value: 40 },
    { day: 'Tue', value: 52 },
    { day: 'Wed', value: 48 },
    { day: 'Thu', value: 65 },
    { day: 'Fri', value: 72 },
    { day: 'Sat', value: 68 },
    { day: 'Sun', value: 80 }
  ]
}

export const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  avatar: null
}

// Helper để simulate API delay
export const delay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API functions
export const mockApi = {
  login: async (email, password) => {
    await delay(1000)
    if (email && password) {
      return {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: mockUser
      }
    }
    throw new Error('Invalid credentials')
  },

  getProjects: async () => {
    await delay(500)
    return mockProjects
  },

  getDatabases: async () => {
    await delay(500)
    return mockDatabases
  },

  getStats: async () => {
    await delay(300)
    return mockStats
  }
}

