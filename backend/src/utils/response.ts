export const createSuccessResponse = <T>(data: T, message?: string) => {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
};

export const createErrorResponse = (code: string, message: string) => {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
};
