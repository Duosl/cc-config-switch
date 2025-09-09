/**
 * 单个配置文件的结构
 */
export interface Profile {
  /** Anthropic API Token */
  ANTHROPIC_AUTH_TOKEN?: string;
  /** Anthropic API Base URL */
  ANTHROPIC_BASE_URL?: string;
  /** Anthropic Model */
  ANTHROPIC_MODEL?: string;
}

/**
 * 配置文件的完整结构
 */
export interface Config {
  /** 当前使用的配置名称 */
  current: string;
  /** 所有配置文件 */
  profiles: {
    [key: string]: Profile;
  };
}

/**
 * 环境变量键名
 */
export const ENV_KEYS = {
  TOKEN: 'ANTHROPIC_AUTH_TOKEN',
  BASE_URL: 'ANTHROPIC_BASE_URL',
  MODEL: 'ANTHROPIC_MODEL'
} as const;

/**
 * 默认配置值
 */
export const DEFAULT_VALUES = {
  BASE_URL: 'https://api.anthropic.com'
} as const;

/**
 * CLI 命令选项
 */
export interface CommandOptions {
  help?: boolean;
  version?: boolean;
}

/**
 * 添加配置时的输入数据
 */
export interface AddProfileInput {
  name: string;
  token: string;
  baseUrl?: string;
  model?: string;
}