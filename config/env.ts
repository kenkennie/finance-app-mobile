import Constants from "expo-constants";

const ENV = {
  dev: {
    apiUrl: "http://192.168.0.100:3000/api/v1",
    // apiUrl: "https://expenseflow.kennivate.co.ke/api/v1",
  },
  staging: {
    apiUrl: "https://staging-api.yourapp.com/api",
  },
  prod: {
    apiUrl: "https://api.yourapp.com/api",
  },
};

const getEnvVars = () => {
  const releaseChannel = Constants.expoConfig?.extra?.releaseChannel;

  if (__DEV__) return ENV.dev;
  if (releaseChannel === "staging") return ENV.staging;
  return ENV.prod;
};

export default getEnvVars();
