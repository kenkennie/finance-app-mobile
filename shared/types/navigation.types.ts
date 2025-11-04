import { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Personal: NavigatorScreenParams<PersonalStackParamList>;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type PersonalStackParamList = {
  Dashboard: undefined;
  Profile: undefined;
};

export type PersonalTabParamList = {
  Home: undefined;
  Expenses: undefined;
  Budgets: undefined;
  Profile: undefined;
  Transactions: undefined;
};
