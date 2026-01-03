import { app } from 'electron';
import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import merge from 'lodash.merge';
import { AppConfig, DEFAULT_CONFIG } from '../types/config';

export class ConfigManager {
  private config: AppConfig;

  private configPath: string;

  private configDir: string;

  constructor() {
    this.configDir = join(homedir(), '.config', app.getName());
    this.configPath = join(this.configDir, 'config.json');
    this.config = { ...DEFAULT_CONFIG };
  }

  async initialize(): Promise<void> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      const savedConfig = JSON.parse(data);

      this.config = merge({}, DEFAULT_CONFIG, savedConfig);

      await this.saveConfig();
    } catch {
      // Config file not found or invalid, using default config
      await this.saveConfig();
    }
  }

  async saveConfig(): Promise<void> {
    await fs.mkdir(this.configDir, { recursive: true });
    await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  async updateConfig(updates: Partial<AppConfig>): Promise<void> {
    this.config = { ...this.config, ...updates };
    await this.saveConfig();
  }

  async updateProvidersConfig(
    providers: AppConfig['providers'],
  ): Promise<void> {
    this.config.providers = providers;
    await this.saveConfig();
  }

  async updateProviderConfig(
    providerId: string,
    providerConfig: Partial<AppConfig['providers'][0]>,
  ): Promise<void> {
    const providerIndex = this.config.providers.findIndex(
      (p) => p.id === providerId,
    );
    if (providerIndex !== -1) {
      this.config.providers[providerIndex] = {
        ...this.config.providers[providerIndex],
        ...providerConfig,
      };
      await this.saveConfig();
    }
  }

  async updatePluginConfig(
    pluginId: string,
    pluginConfig: Partial<AppConfig['plugins'][string]>,
  ): Promise<void> {
    if (!this.config.plugins[pluginId]) {
      this.config.plugins[pluginId] = { enabled: true };
    }
    this.config.plugins[pluginId] = {
      ...this.config.plugins[pluginId],
      ...pluginConfig,
    };
    await this.saveConfig();
  }

  async updateRankingConfig(
    rankingConfig: Partial<AppConfig['ranking']>,
  ): Promise<void> {
    this.config.ranking = { ...this.config.ranking, ...rankingConfig };
    await this.saveConfig();
  }
}

export const configManager = new ConfigManager();
