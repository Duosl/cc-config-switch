import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { Config, Profile, DEFAULT_VALUES, AddProfileInput } from './types';
import { Logger } from '../utils/logger';

/**
 * 配置管理器
 */
export class ConfigManager {
  private static readonly CONFIG_DIR = path.join(os.homedir(), '.cc-config');
  private static readonly CONFIG_FILE = path.join(ConfigManager.CONFIG_DIR, 'profiles.json');

  /**
   * 确保配置目录存在
   */
  private static async ensureConfigDir(): Promise<void> {
    await fs.ensureDir(this.CONFIG_DIR);
  }

  /**
   * 获取默认配置
   */
  private static getDefaultConfig(): Config {
    return {
      current: 'default',
      profiles: {
        default: {
        }
      }
    };
  }

  /**
   * 读取配置文件
   */
  static async loadConfig(): Promise<Config> {
    try {
      await this.ensureConfigDir();
      
      if (!(await fs.pathExists(this.CONFIG_FILE))) {
        const defaultConfig = this.getDefaultConfig();
        await this.saveConfig(defaultConfig);
        return defaultConfig;
      }

      const content = await fs.readFile(this.CONFIG_FILE, 'utf-8');
      const config = JSON.parse(content) as Config;
      
      // 验证配置结构
      this.validateConfig(config);
      
      return config;
    } catch (error) {
    //   Logger.error(`读取配置文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
      throw error;
    }
  }

  /**
   * 保存配置文件
   */
  static async saveConfig(config: Config): Promise<void> {
    try {
      await this.ensureConfigDir();
      
      // 验证配置
      this.validateConfig(config);
      
      await fs.writeFile(this.CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
      Logger.error(`保存配置文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
      throw error;
    }
  }

  /**
   * 验证配置文件结构
   */
  private static validateConfig(config: Config): void {
    if (!config || typeof config !== 'object') {
      throw new Error('配置文件格式无效');
    }

    if (!config.current || typeof config.current !== 'string') {
      throw new Error('配置文件缺少 current 字段');
    }

    if (!config.profiles || typeof config.profiles !== 'object') {
      throw new Error('配置文件缺少 profiles 字段');
    }

    // 验证当前配置是否存在
    if (!config.profiles[config.current]) {
      throw new Error(`当前配置 "${config.current}" 不存在`);
    }

    // 验证每个配置的结构
    for (const [name, profile] of Object.entries(config.profiles)) {
      this.validateProfile(name, profile);
    }
  }

  /**
   * 验证单个配置的结构
   */
  private static validateProfile(name: string, profile: Profile): void {
    if (!profile || typeof profile !== 'object') {
      throw new Error(`配置 "${name}" 格式无效`);
    }

    // anthropic 配置特殊处理
    if (name === 'default') {
      const hasBaseUrl = 'ANTHROPIC_BASE_URL' in profile && profile.ANTHROPIC_BASE_URL !== undefined && profile.ANTHROPIC_BASE_URL.trim() !== '';
      const hasAuthToken = 'ANTHROPIC_AUTH_TOKEN' in profile && profile.ANTHROPIC_AUTH_TOKEN !== undefined && profile.ANTHROPIC_AUTH_TOKEN.trim() !== '';
      
      // 要么都不配置，要么都配置
      if (hasAuthToken !== hasBaseUrl) {
        throw new Error(`配置 ${name} 的 ANTHROPIC_BASE_URL 和 ANTHROPIC_AUTH_TOKEN 必须同时配置或同时不配置`);
      }
      return
    }
    // 验证必需字段
    const requiredFields = ['ANTHROPIC_BASE_URL', 'ANTHROPIC_AUTH_TOKEN'];
    for (const field of requiredFields) {
        if (!(field in profile) || typeof profile[field as keyof Profile] !== 'string' || !profile[field as keyof Profile] || (profile[field as keyof Profile] as string).trim() === '') {
            throw new Error(`配置 ${name} 的 ${field} 不能为空`);
        }
    }
    
    // ANTHROPIC_MODEL 是可选字段，但如果存在必须是字符串
    if ('ANTHROPIC_MODEL' in profile && typeof profile.ANTHROPIC_MODEL !== 'string') {
        throw new Error(`配置 ${name}的 ANTHROPIC_MODEL 必须是字符串`);
    }
  }

  /**
   * 获取当前配置
   */
  static async getCurrentProfile(): Promise<{ name: string; profile: Profile }> {
    const config = await this.loadConfig();
    const currentName = config.current;
    const currentProfile = config.profiles[currentName];
    
    if (!currentProfile) {
      throw new Error(`当前配置 "${currentName}" 不存在`);
    }

    return { name: currentName, profile: currentProfile };
  }

  /**
   * 切换到指定配置
   */
  static async useProfile(profileName: string): Promise<void> {
    const config = await this.loadConfig();
    
    if (!config.profiles[profileName]) {
      throw new Error(`配置 "${profileName}" 不存在`);
    }

    config.current = profileName;
    await this.saveConfig(config);
  }

  /**
   * 添加新配置
   */
  static async addProfile(input: AddProfileInput): Promise<void> {
    const config = await this.loadConfig();
    
    if (config.profiles[input.name]) {
      throw new Error(`配置 "${input.name}" 已存在`);
    }

    const newProfile: Profile = {
      ANTHROPIC_BASE_URL: input.baseUrl || DEFAULT_VALUES.BASE_URL,
      ANTHROPIC_AUTH_TOKEN: input.token,
      ANTHROPIC_MODEL: input.model
    };

    // 验证新配置
    this.validateProfile(input.name, newProfile);

    config.profiles[input.name] = newProfile;
    await this.saveConfig(config);
  }

  /**
   * 删除配置
   */
  static async removeProfile(profileName: string): Promise<void> {
    const config = await this.loadConfig();
    
    if (!config.profiles[profileName]) {
      throw new Error(`配置 "${profileName}" 不存在`);
    }

    if (config.current === profileName) {
      throw new Error(`无法删除当前正在使用的配置 "${profileName}"`);
    }

    delete config.profiles[profileName];
    await this.saveConfig(config);
  }

  /**
   * 列出所有配置
   */
  static async listProfiles(): Promise<{ current: string; profiles: { [key: string]: Profile } }> {
    const config = await this.loadConfig();
    return {
      current: config.current,
      profiles: config.profiles
    };
  }

  /**
   * 获取配置文件路径
   */
  static getConfigPath(): string {
    return this.CONFIG_FILE;
  }

  /**
   * 检查配置文件是否存在
   */
  static async configExists(): Promise<boolean> {
    return fs.pathExists(this.CONFIG_FILE);
  }
}