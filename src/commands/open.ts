import open from 'open';
import { ConfigManager } from '../config/manager';
import { Logger } from '../utils/logger';

/**
 * 打开配置文件
 */
export async function openCommand(): Promise<void> {
  try {
    const configPath = ConfigManager.getConfigPath();
    
    // 如果配置文件不存在，先创建默认配置
    if (!(await ConfigManager.configExists())) {
      Logger.info('配置文件不存在，正在创建默认配置...');
      await ConfigManager.loadConfig(); // 这会创建默认配置
      Logger.success('已创建默认配置文件');
    }
    
    Logger.info(`正在打开配置文件: ${configPath}`);
    
    // 使用默认编辑器打开配置文件
    await open(configPath);
    
    Logger.success('配置文件已在默认编辑器中打开');
    Logger.warn('修改配置后请确保 JSON 格式正确');
    
  } catch (error) {
    Logger.error(`打开配置文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    
    // 如果自动打开失败，显示文件路径
    const configPath = ConfigManager.getConfigPath();
    Logger.info(`请手动打开配置文件: ${configPath}`);
    
    process.exit(1);
  }
}