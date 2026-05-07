import { AxiosResponse } from "axios";
import { ApiResponse } from "../types/api";

export const unwrapApiResponse = <T>(
  response: AxiosResponse<ApiResponse<T>>,
): T => {
  if (!response.data.success) {
    throw new Error(response.data.error.message);
  }

  return response.data.data;
};
