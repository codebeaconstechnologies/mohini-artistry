import type { AuthResponse, User, RegisterInput, LoginInput } from "@mohini-artistry/shared";
import { apiClient } from "./client";

export const authApi = {
  register: (input: RegisterInput) => apiClient.post<AuthResponse>("/auth/register", input),
  login: (input: LoginInput) => apiClient.post<AuthResponse>("/auth/login", input),
  me: () => apiClient.get<User>("/auth/me"),
};
