import { message } from "antd";

export interface ApiError {
  status?: number;
  message?: string;
  error?: string;
  data?: unknown;
}

export class ApiErrorHandler {
  private static instance: ApiErrorHandler;
  
  private constructor() {}

  static getInstance(): ApiErrorHandler {
    if (!ApiErrorHandler.instance) {
      ApiErrorHandler.instance = new ApiErrorHandler();
    }
    return ApiErrorHandler.instance;
  }

  handle(error: unknown, context?: string): void {
    const errorInfo = this.parseError(error);
    console.error(`API Error${context ? ` in ${context}` : ""}:`, errorInfo);

    if (context) {
      message.error(`Failed to ${context}. Please try again.`);
    }
  }

  parseError(error: unknown): ApiError {
    if (this.isApiError(error)) {
      return error;
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        status: 0,
      };
    }

    if (typeof error === "string") {
      return { message: error };
    }

    return { message: "An unexpected error occurred" };
  }

  private isApiError(error: unknown): error is ApiError {
    if (typeof error !== "object" || error === null) return false;
    const e = error as Record<string, unknown>;
    return (
      typeof e.status === "number" ||
      typeof e.message === "string" ||
      typeof e.error === "string"
    );
  }

  getUserMessage(error: ApiError): string {
    if (error.status === 401) {
      return "Please log in to continue.";
    }
    if (error.status === 403) {
      return "You don't have permission to perform this action.";
    }
    if (error.status === 404) {
      return "The requested resource was not found.";
    }
    if (error.status >= 500) {
      return "Server error. Please try again later.";
    }
    if (error.status === 0 || !error.status) {
      return "Network error. Please check your connection.";
    }
    return error.message || "An unexpected error occurred.";
  }
}

export const apiErrorHandler = ApiErrorHandler.getInstance();

export function withErrorHandling<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  context?: string
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((error) => {
          apiErrorHandler.handle(error, context);
          throw error;
        });
      }
      return result;
    } catch (error) {
      apiErrorHandler.handle(error, context);
      throw error;
    }
  }) as T;
}

export function safeAsync<T>(
  promise: Promise<T>,
  context?: string
): Promise<[T | null, ApiError | null]> {
  return promise
    .then((data) => [data, null])
    .catch((error) => {
      apiErrorHandler.handle(error, context);
      return [null, apiErrorHandler.parseError(error)];
    });
}
