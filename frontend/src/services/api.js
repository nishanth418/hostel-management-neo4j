/**
 * Resolves the API base URL:
 * 1. If VITE_API_URL is configured in environment, use it.
 * 2. Defaults to '/api' for local development proxy or relative routing.
 */
function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const cleanUrl = envUrl.trim().replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }

  return '/api';
}

const API_BASE = getApiBaseUrl();

async function request(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.securityBlocked = data.securityBlocked;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),

  // Students
  getStudents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/students${query ? `?${query}` : ''}`);
  },
  getStudent: (id) => request(`/students/${id}`),
  createStudent: (data) => request('/students', { method: 'POST', body: data }),
  updateStudent: (id, data) => request(`/students/${id}`, { method: 'PUT', body: data }),
  deleteStudent: (id) => request(`/students/${id}`, { method: 'DELETE' }),

  // Hostels
  getHostels: () => request('/hostels'),
  getHostel: (id) => request(`/hostels/${id}`),
  createHostel: (data) => request('/hostels', { method: 'POST', body: data }),
  updateHostel: (id, data) => request(`/hostels/${id}`, { method: 'PUT', body: data }),
  deleteHostel: (id) => request(`/hostels/${id}`, { method: 'DELETE' }),

  // Rooms
  getRooms: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/rooms${query ? `?${query}` : ''}`);
  },
  getRoom: (id) => request(`/rooms/${id}`),
  createRoom: (data) => request('/rooms', { method: 'POST', body: data }),
  updateRoom: (id, data) => request(`/rooms/${id}`, { method: 'PUT', body: data }),
  deleteRoom: (id) => request(`/rooms/${id}`, { method: 'DELETE' }),

  // Room Types
  getRoomTypes: () => request('/room-types'),
  createRoomType: (data) => request('/room-types', { method: 'POST', body: data }),
  updateRoomType: (id, data) => request(`/room-types/${id}`, { method: 'PUT', body: data }),
  deleteRoomType: (id) => request(`/room-types/${id}`, { method: 'DELETE' }),

  // Wardens
  getWardens: () => request('/wardens'),
  getWarden: (id) => request(`/wardens/${id}`),
  createWarden: (data) => request('/wardens', { method: 'POST', body: data }),
  updateWarden: (id, data) => request(`/wardens/${id}`, { method: 'PUT', body: data }),
  deleteWarden: (id) => request(`/wardens/${id}`, { method: 'DELETE' }),

  // Mess
  getMess: () => request('/mess'),
  getMessById: (id) => request(`/mess/${id}`),
  createMess: (data) => request('/mess', { method: 'POST', body: data }),
  updateMess: (id, data) => request(`/mess/${id}`, { method: 'PUT', body: data }),
  deleteMess: (id) => request(`/mess/${id}`, { method: 'DELETE' }),

  // Meals
  getMeals: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/meals${query ? `?${query}` : ''}`);
  },
  createMeal: (data) => request('/meals', { method: 'POST', body: data }),
  updateMeal: (id, data) => request(`/meals/${id}`, { method: 'PUT', body: data }),
  deleteMeal: (id) => request(`/meals/${id}`, { method: 'DELETE' }),

  // Staff
  getStaff: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/staff${query ? `?${query}` : ''}`);
  },
  getStaffById: (id) => request(`/staff/${id}`),
  createStaff: (data) => request('/staff', { method: 'POST', body: data }),
  updateStaff: (id, data) => request(`/staff/${id}`, { method: 'PUT', body: data }),
  deleteStaff: (id) => request(`/staff/${id}`, { method: 'DELETE' }),

  // Suppliers
  getSuppliers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/suppliers${query ? `?${query}` : ''}`);
  },
  getSupplier: (id) => request(`/suppliers/${id}`),
  createSupplier: (data) => request('/suppliers', { method: 'POST', body: data }),
  updateSupplier: (id, data) => request(`/suppliers/${id}`, { method: 'PUT', body: data }),
  deleteSupplier: (id) => request(`/suppliers/${id}`, { method: 'DELETE' }),

  // Inventory
  getInventory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/inventory${query ? `?${query}` : ''}`);
  },
  createInventoryItem: (data) => request('/inventory', { method: 'POST', body: data }),
  updateInventoryItem: (id, data) => request(`/inventory/${id}`, { method: 'PUT', body: data }),
  deleteInventoryItem: (id) => request(`/inventory/${id}`, { method: 'DELETE' }),

  // Procurements
  getProcurements: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/procurements${query ? `?${query}` : ''}`);
  },
  createProcurement: (data) => request('/procurements', { method: 'POST', body: data }),
  updateProcurement: (id, data) => request(`/procurements/${id}`, { method: 'PUT', body: data }),
  deleteProcurement: (id) => request(`/procurements/${id}`, { method: 'DELETE' }),

  // Payments
  getPayments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/payments${query ? `?${query}` : ''}`);
  },
  getPayment: (id) => request(`/payments/${id}`),
  createPayment: (data) => request('/payments', { method: 'POST', body: data }),
  updatePayment: (id, data) => request(`/payments/${id}`, { method: 'PUT', body: data }),
  deletePayment: (id) => request(`/payments/${id}`, { method: 'DELETE' }),

  // Reports
  getReportsList: () => request('/reports'),
  getReportData: (reportKey) => request(`/reports/${reportKey}`),

  // SQL Runner
  executeSqlQuery: (sql) => request('/query', { method: 'POST', body: { sql } }),
  getSqlSchema: () => request('/query/schema'),

  // 18 Database Tables API
  getTableInfo: (tableName, search = '') => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/tables/${tableName}${q}`);
  },
  insertTableRow: (tableName, data) => request(`/tables/${tableName}`, { method: 'POST', body: data }),
  updateTableRow: (tableName, keyCriteria, values) => request(`/tables/${tableName}`, { method: 'PUT', body: { keyCriteria, values } }),
  deleteTableRow: (tableName, keyCriteria) => {
    const params = new URLSearchParams(keyCriteria).toString();
    return request(`/tables/${tableName}?${params}`, { method: 'DELETE' });
  }
};
