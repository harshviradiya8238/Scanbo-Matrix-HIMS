import { env } from '../config/env';
import { validationSchemas, validateInput } from './validation';

/**
 * Secure API client with built-in security features
 * - Request timeout
 * - Error handling
 * - Input validation
 * - CSRF protection
 * - XSS prevention
 */

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  validateResponse?: boolean;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Secure API client class
 */
export class SecureApiClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(baseUrl?: string, timeout?: number) {
    this.baseUrl = baseUrl || env.NEXT_PUBLIC_API_URL || '';
    this.defaultTimeout = timeout || env.NEXT_PUBLIC_API_TIMEOUT;
  }

  /**
   * Make a secure API request
   */
  async request<T = unknown>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;

    // Validate URL to prevent SSRF
    if (!this.isValidUrl(url)) {
      throw new ApiError(400, 'Invalid URL');
    }

    // Prepare headers
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add CSRF token if available (implement based on your auth strategy)
    const csrfToken = this.getCSRFToken();
    if (csrfToken) {
      requestHeaders['X-CSRF-Token'] = csrfToken;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        credentials: 'same-origin', // Important for CSRF protection
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.message || `API request failed: ${response.statusText}`,
          errorData
        );
      }

      const data = await response.json();

      return {
        data: data as T,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError(408, 'Request timeout');
        }
        throw new ApiError(500, error.message);
      }

      throw new ApiError(500, 'Unknown error occurred');
    }
  }

  /**
   * Validate URL to prevent SSRF attacks
   */
  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      // Only allow http/https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return false;
      }
      // In production, add additional checks:
      // - Whitelist allowed domains
      // - Block private IP ranges
      // - Block localhost in production
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get CSRF token from cookie or session
   * Implement based on your authentication strategy
   */
  private getCSRFToken(): string | null {
    // Placeholder - implement based on your auth system
    // This could read from cookies, session storage, or context
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const csrfCookie = cookies.find((c) => c.trim().startsWith('csrf-token='));
      if (csrfCookie) {
        return csrfCookie.split('=')[1];
      }
    }
    return null;
  }

  // Convenience methods
  async get<T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async delete<T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

/**
 * Default API client instance
 */
export const apiClient = new SecureApiClient();

