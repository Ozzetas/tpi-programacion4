export interface RegisterPayload {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}