import { NavigatorScreenParams } from '@react-navigation/native';
import { ScoredRoute } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type TabParamList = {
  Buscar: undefined;
  Relatos: undefined;
  MinhasRotas: undefined;
  Perfil: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  ProfileSetup: { firstTime?: boolean } | undefined;
  RouteResults: { origin: string; destination: string };
  RouteDetail: { route: ScoredRoute; savedId?: string };
  NewReport: { location?: string } | undefined;
  ReportDetail: { reportId: string };
  About: undefined;
};
