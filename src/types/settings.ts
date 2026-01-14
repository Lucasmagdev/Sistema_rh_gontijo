/**
 * Tipos para configurações do sistema
 */

export interface RouteSettings {
  optimizationStrategy: 'time' | 'distance' | 'cost' | 'balanced';
  maxCalculationTime: number; // em segundos
  maxRouteAlternatives: number;
  distanceTolerance: number; // em metros
  preferHighways: boolean;
  avoidTolls: boolean;
}

export interface VisualSettings {
  theme: 'light' | 'dark' | 'auto';
  layoutDensity: 'compact' | 'comfortable' | 'spacious';
  fontSize: 'small' | 'medium' | 'large';
  showAnimations: boolean;
  showTooltips: boolean;
}

export interface GeneralSettings {
  timezone: string;
  language: string;
  dateFormat: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';
  timeFormat: '12h' | '24h';
  currency: string;
  autoSave: boolean;
  confirmActions: boolean;
  defaultNotifications: boolean;
}

export interface SystemSettings {
  route: RouteSettings;
  visual: VisualSettings;
  general: GeneralSettings;
  updatedAt: string;
}

export const DEFAULT_ROUTE_SETTINGS: RouteSettings = {
  optimizationStrategy: 'balanced',
  maxCalculationTime: 30,
  maxRouteAlternatives: 3,
  distanceTolerance: 100,
  preferHighways: false,
  avoidTolls: false,
};

export const DEFAULT_VISUAL_SETTINGS: VisualSettings = {
  theme: 'light',
  layoutDensity: 'comfortable',
  fontSize: 'medium',
  showAnimations: true,
  showTooltips: true,
};

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  timezone: 'America/Sao_Paulo',
  language: 'pt-BR',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: '24h',
  currency: 'BRL',
  autoSave: true,
  confirmActions: true,
  defaultNotifications: true,
};

export const DEFAULT_SETTINGS: SystemSettings = {
  route: DEFAULT_ROUTE_SETTINGS,
  visual: DEFAULT_VISUAL_SETTINGS,
  general: DEFAULT_GENERAL_SETTINGS,
  updatedAt: new Date().toISOString(),
};

