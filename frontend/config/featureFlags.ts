const appMode =
  process.env.NEXT_PUBLIC_APP_MODE === "production" ? "production" : "development";
const explicitlyEnabledMockApi = process.env.NEXT_PUBLIC_ENABLE_MOCK_API === "true";

export const featureFlags = {
  appMode,
  isDevelopmentMode: appMode === "development",
  isProductionMode: appMode === "production",
  useMockApi: appMode === "development" || explicitlyEnabledMockApi,
  autoDemoLogin: appMode === "development",
  showDevRuntimeBanner: appMode === "development",
};
