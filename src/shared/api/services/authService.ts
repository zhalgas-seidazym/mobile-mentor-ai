import { apiClient } from '../client';
import { setTokens, clearTokens } from '../tokenStorage';
import {
  LoginRequest,
  RegisterRequest,
  OTPRequest,
  OTPVerifyRequest,
  PasswordResetRequest,
  TokenResponse,
  RegisterResponse,
  PasswordResetTokenResponse,
} from '../types';

export const authService = {
  async sendOtp(email: string): Promise<void> {
    // API expects email as plain JSON string, so we need to stringify it
    await apiClient.post('/auth/send-otp', JSON.stringify(email), {
      headers: { 'Content-Type': 'application/json' },
    });
  },

  async verifyOtpAndRegister(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/verify-otp/register', data);
    await setTokens({
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
    });
    return response.data;
  },

  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/login', data);
    await setTokens({
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
    });
    return response.data;
  },

  async verifyOtpForPasswordReset(data: OTPVerifyRequest): Promise<PasswordResetTokenResponse> {
    const response = await apiClient.post<PasswordResetTokenResponse>(
      '/auth/verify-otp/password-reset-token',
      data
    );
    return response.data;
  },

  async resetPassword(password: string, resetToken: string): Promise<void> {
    await apiClient.post<void>(
      '/auth/reset-password',
      { password } as PasswordResetRequest,
      {
        headers: {
          Authorization: `Bearer ${resetToken}`,
        },
      }
    );
  },

  async logout(): Promise<void> {
    await clearTokens();
  },
};
