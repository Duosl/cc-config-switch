import { ConfigManager } from '../config/manager';
import { Logger } from '../utils/logger';

/**
 * 列出所有配置
 */
export async function listCommand(): Promise<void> {
  try {
    const { current, profiles } = await ConfigManager.listProfiles();
    
    const profileNames = Object.keys(profiles);
    
    if (profileNames.length === 0) {
      Logger.warn('没有找到任何配置');
      return;
    }

    for (const name of profileNames) {
      const isCurrent = name === current;
      
      if (isCurrent) {
        console.log(`${Logger.current('* ' + name)}`);
      } else {
        console.log(`  ${name}`);
      }
    }
    
  } catch (error) {
    Logger.error(`列出配置失败: ${error instanceof Error ? error.message : '未知错误'}`);
    process.exit(1);
  }
}