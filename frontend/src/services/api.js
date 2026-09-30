const API_BASE = '/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('supportmind_token') || '';
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('supportmind_token', token);
    } else {
      localStorage.removeItem('supportmind_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async handleResponse(res) {
    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      try {
        const data = await res.json();
        errorMsg = data.detail || data.message || errorMsg;
      } catch (e) {
        // ignore json parse error
      }
      throw new Error(errorMsg);
    }
    return res.json();
  }

  async login(email, password, role = null) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    const data = await this.handleResponse(res);
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async register(name, email, password, device = 'Laptop', company = 'Personal') {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, device, company })
    });
    const data = await this.handleResponse(res);
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async getHealth() {
    const res = await fetch(`${API_BASE}/health`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async getCustomers() {
    const res = await fetch(`${API_BASE}/customers`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async getAllAdminConversations() {
    const res = await fetch(`${API_BASE}/customers/admin/conversations`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async seedDemoCustomer() {
    const res = await fetch(`${API_BASE}/customers/seed-demo`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async getCustomer(customerId) {
    const res = await fetch(`${API_BASE}/customers/${customerId}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async getCustomerMemories(customerId) {
    const res = await fetch(`${API_BASE}/customers/${customerId}/memories`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async getCustomerConversations(customerId) {
    const res = await fetch(`${API_BASE}/customers/${customerId}/conversations`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async createNewConversation(customerId) {
    const res = await fetch(`${API_BASE}/customers/${customerId}/conversations/new`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async createConversation(customerId = null, title = "New Support Session") {
    const res = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ customer_id: customerId, title })
    });
    return this.handleResponse(res);
  }

  async getConversations() {
    const res = await fetch(`${API_BASE}/conversations`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async getConversation(conversationId) {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async getTickets() {
    const res = await fetch(`${API_BASE}/tickets`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async createTicket(subject, priority = "Medium", context = "") {
    const res = await fetch(`${API_BASE}/tickets`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ subject, priority, context })
    });
    return this.handleResponse(res);
  }

  async getProfile() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async updateProfile(updates) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    });
    return this.handleResponse(res);
  }

  async sendChatMessage(customerId, message, conversationId = null) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        customer_id: customerId,
        message,
        conversation_id: conversationId
      })
    });
    return this.handleResponse(res);
  }

  async updateConversationStatus(conversationId, status) {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status })
    });
    return this.handleResponse(res);
  }

  async updateTicketStatus(ticketId, status) {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status })
    });
    return this.handleResponse(res);
  }

  async forgotPassword(email) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return this.handleResponse(res);
  }

  async resetPassword(email, newPassword) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, new_password: newPassword })
    });
    return this.handleResponse(res);
  }
}

export const api = new ApiService();

