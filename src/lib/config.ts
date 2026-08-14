import type { AppConfig } from '../types';

const KEY = 'sunrise-item-picker/config';

export function loadConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export function saveConfig(config: AppConfig): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(config));
  } catch {
    // Ignore quota errors — config is small enough that this shouldn't happen.
  }
}
