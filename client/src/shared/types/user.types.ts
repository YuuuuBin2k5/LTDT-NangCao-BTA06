import { AvatarFrame } from './avatar-frame.types';

export interface User {
  id: string;
  username: string;
  email: string;
  nickName: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  selectedFrame?: AvatarFrame;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  nickName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
