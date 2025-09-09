import { ConfigManager } from '../config/manager';
import { Logger } from '../utils/logger';

/**
 * 显示当前配置
 */
export async function currentCommand(): Promise<void> {
  try {
    const { name, profile } = await ConfigManager.getCurrentProfile();
    
    console.log(`\n当前配置: ${Logger.current(name)}`);
    
    // 检查是否有任何有效的配置字段
    const hasBaseUrl = profile.ANTHROPIC_BASE_URL && profile.ANTHROPIC_BASE_URL.trim() !== '';
    const hasToken = profile.ANTHROPIC_AUTH_TOKEN && profile.ANTHROPIC_AUTH_TOKEN.trim() !== '';
    const hasModel = profile.ANTHROPIC_MODEL && profile.ANTHROPIC_MODEL.trim() !== '';
    
    // 只在有配置信息时才显示
    if (hasBaseUrl || hasToken || hasModel) {
      Logger.separator();
      if (hasBaseUrl) {
        Logger.keyValue('Base URL', profile.ANTHROPIC_BASE_URL!);
      }
      if (hasToken) {
        Logger.keyValue('Token', Logger.hideToken(profile.ANTHROPIC_AUTH_TOKEN!));
      }
      if (hasModel) {
        Logger.keyValue('Model', profile.ANTHROPIC_MODEL!);
      }
      Logger.separator();
    } 
    
    
    // 检查环境变量（只检查有值的字段）
    const envToken = process.env.ANTHROPIC_AUTH_TOKEN;
    const envBaseUrl = process.env.ANTHROPIC_BASE_URL;
    const envModel = process.env.ANTHROPIC_MODEL;
    
    let hasEnvMismatch = false;
    
    // 只在配置中有值时才检测环境变量
    if (hasToken) {
      if (envToken === profile.ANTHROPIC_AUTH_TOKEN) {
        Logger.success('ANTHROPIC_AUTH_TOKEN 已正确设置');
      } else {
        Logger.warn('ANTHROPIC_AUTH_TOKEN 未设置或与配置不符');
        hasEnvMismatch = true;
      }
    }
    
    if (hasBaseUrl) {
      if (envBaseUrl === profile.ANTHROPIC_BASE_URL) {
        Logger.success('ANTHROPIC_BASE_URL 已正确设置');
      } else {
        Logger.warn('ANTHROPIC_BASE_URL 未设置或与配置不符');
        hasEnvMismatch = true;
      }
    }
    
    if (hasModel) {
      if (envModel === profile.ANTHROPIC_MODEL) {
        Logger.success('ANTHROPIC_MODEL 已正确设置');
      } else {
        Logger.warn('ANTHROPIC_MODEL 未设置或与配置不符');
        hasEnvMismatch = true;
      }
    }
    
    console.log();
    
    if (hasEnvMismatch) {
      Logger.info('使用 "cc-config use ' + name + '" 重新切换配置获取设置命令');
    }
    
  } catch (error) {
    Logger.error(`获取当前配置失败: ${error instanceof Error ? error.message : '未知错误'}`);
    process.exit(1);
  }
}