import { ErrorResponse } from "@roshi/shared";
import axios, { AxiosError } from "axios";
import qs from "qs";
import { useMemo } from "react";
import { toast } from "react-toastify";
import { CONSTANTS, KEYS } from "../data/constants";
import { handleError } from "../utils/errorHandler";
import { getFromLocalStorage } from "../utils/localStorageHelper";

function dateTransformer(data: object): object {
  // Check if a string looks like a date
  function isDateString(value: unknown): value is string {
    const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(.\d{3}Z?)?)$/;
    return typeof value === "string" && dateRegex.test(value);
  }

  // Recursive function to traverse and transform the data
  function transform(obj: object | object[]): object | object[] {
    if (Array.isArray(obj)) {
      return obj.map((item) => transform(item));
    } else if (typeof obj === "object" && obj !== null) {
      const transformedObj: Record<string, unknown> = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          transformedObj[key] = isDateString(obj[key as keyof typeof obj])
            ? new Date(obj[key as keyof typeof obj])
            : transform(obj[key as keyof typeof obj]);
        }
      }
      return transformedObj;
    } else {
      return obj;
    }
  }

  return transform(data);
}

export const useAxios = (
  options: { noErrorToast?: boolean; successToast?: boolean; skipDateTransformation?: boolean; apiVersion?: number } = {
    apiVersion: 1,
    noErrorToast: false,
    successToast: false,
    skipDateTransformation: false,
  }
) => {
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: `${CONSTANTS.API_BASE_URL}/api/v${options.apiVersion || 1}`,
      paramsSerializer: (params) => {
        const parsed = qs.stringify(params, {
          arrayFormat: "brackets", // Use brackets for array format (e.g., filter[offerStatus]=[REJECTED])
          encode: false, // Do not encode values
        });
        return parsed;
      },
    });

    if (!options.skipDateTransformation) {
      const axiosTransformers = (() => {
        if (!axios.defaults.transformResponse) return [dateTransformer];
        if (Array.isArray(axios.defaults.transformResponse))
          return [...axios.defaults.transformResponse, dateTransformer];
        else return [axios.defaults.transformResponse, dateTransformer];
      })();

      instance.defaults.transformResponse = axiosTransformers;
    }

    instance.interceptors.request.use(async (config) => {
      const token = localStorage.getItem("token");
      const shortUrlCode = getFromLocalStorage<string>(KEYS.ROSHI_SHORT_URL_CODE);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (shortUrlCode) {
        config.headers.set("X-Short-Url", shortUrlCode);
      }

      return config;
    });

    instance.interceptors.response.use(
      (response) => {
        if (options.successToast) toast.success("Success");
        return response;
      },
      (error: AxiosError<ErrorResponse>) => {
        if (error.response?.data?.error?.code && !options.noErrorToast) {
          //Managed errors
          handleError(error.response?.data as ErrorResponse<object>);
        }
        return Promise.reject(error.response?.data);
      }
    );

    return instance;
  }, [options]);

  return axiosInstance;
};
