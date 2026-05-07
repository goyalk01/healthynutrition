import { InternalAxiosRequestConfig } from "axios";

export const handleMockApiResponse = (config: InternalAxiosRequestConfig): any => {
  const url = config.url || "";
  
  if (url.includes("/auth/me") || url.includes("/auth/login")) {
    return {
      data: {
        success: true,
        data: {
          accessToken: "mock-token",
          refreshToken: "mock-refresh-token",
          user: {
            id: "mock-user-id",
            email: "demo@nutrisense.local",
            name: "Demo User",
            role: "USER"
          }
        }
      }
    };
  }

  if (url.includes("/meals")) {
    return {
      data: {
        success: true,
        data: []
      }
    };
  }

  if (url.includes("/recommendations")) {
    return {
      data: {
        success: true,
        data: {
          items: [],
          healthScore: 85
        }
      }
    };
  }

  return {
    data: {
      success: true,
      data: {}
    }
  };
};
