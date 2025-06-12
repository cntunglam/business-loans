import dotenv from "dotenv";
dotenv.config();

const envVars = {
  JOBS_DATABASE_URL: {
    defaultValue: "",
  },
  PORT: {
    defaultValue: 4000,
  },
  TOKEN: {
    defaultValue: "",
  },
} as const;

export const CONFIG = {
  ...Object.keys(envVars).reduce(
    (acc, key) => {
      const value = process.env[key];
      if (!value && process.env.NODE_ENV !== "development") throw new Error(`Missing env var ${key}`);
      else if (!value && process.env.NODE_ENV === "development")
        return { ...acc, [key]: envVars[key as keyof typeof envVars].defaultValue };
      else return { ...acc, [key]: value };
    },
    {} as Record<keyof typeof envVars, string>
  ),
} as const;
