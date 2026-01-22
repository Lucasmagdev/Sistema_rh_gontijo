import { SystemSettings, DEFAULT_SETTINGS } from '../types/settings';

const STORAGE_KEY = 'system_settings';

function loadSettingsFromStorage(): SystemSettings {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return DEFAULT_SETTINGS;
  }
  try {
    const parsed = JSON.parse(stored) as SystemSettings;
    // Merge com defaults para garantir que novos campos sejam incluídos
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      route: { ...DEFAULT_SETTINGS.route, ...parsed.route },
      visual: { ...DEFAULT_SETTINGS.visual, ...parsed.visual },
      general: { ...DEFAULT_SETTINGS.general, ...parsed.general },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettingsToStorage(settings: SystemSettings): void {
  const settingsToSave = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave));
}

export async function getSettings(): Promise<SystemSettings> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return loadSettingsFromStorage();
}

export async function updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const current = loadSettingsFromStorage();
  const updated: SystemSettings = {
    ...current,
    ...settings,
    route: settings.route ? { ...current.route, ...settings.route } : current.route,
    visual: settings.visual ? { ...current.visual, ...settings.visual } : current.visual,
    general: settings.general ? { ...current.general, ...settings.general } : current.general,
    updatedAt: new Date().toISOString(),
  };
  
  saveSettingsToStorage(updated);
  return updated;
}

export async function resetSettings(): Promise<SystemSettings> {
  await new Promise(resolve => setTimeout(resolve, 300));
  saveSettingsToStorage(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

