import axios from 'axios';

const AUTH_API_URL = 'http://localhost:8081/api/auth';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  roles: string[];
}

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${AUTH_API_URL}/login`, credentials);
      const { token } = response.data;
      
      if (token) {
        localStorage.setItem('auth_token', token);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  }

  logout(): void {
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export default new AuthService();
