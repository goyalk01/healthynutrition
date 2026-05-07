const appMode = process.env.NEXT_PUBLIC_APP_MODE || "development";

export const featureFlags = {
  isDevelopmentMode: appMode === "development",
  isProductionMode: appMode === "production",
  useMockApi: appMode === "development" || process.env.NEXT_PUBLIC_ENABLE_MOCK_API === "true",
  autoDemoLogin: appMode === "development",
};
