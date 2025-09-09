import * as readline from 'readline';
import { ConfigManager } from '../config/manager';
import { Logger } from '../utils/logger';

/**
 * 创建命令行输入接口
 */
function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * 异步询问用户确认
 */
function confirmAction(rl: readline.Interface, message: string): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * 删除配置
 */
export async function removeCommand(profileName: string): Promise<void> {
  if (!profileName) {
    Logger.error('请指定要删除的配置名称');
    Logger.info('使用方式: cc-config remove <配置名称>');
    process.exit(1);
  }

  // 检查是否在交互式终端中
  if (!process.stdin.isTTY) {
    Logger.error('此命令需要在交互式终端中运行以确认删除操作');
    Logger.info('请直接运行 "cc-config remove ' + profileName + '"');
    process.exit(1);
  }

  const rl = createReadlineInterface();
  
  try {
    // 检查配置是否存在
    const { current, profiles } = await ConfigManager.listProfiles();
    
    if (!profiles[profileName]) {
      Logger.error(`配置 "${profileName}" 不存在`);
      rl.close();
      process.exit(1);
    }
    
    // 检查是否是当前配置
    if (current === profileName) {
      Logger.error(`无法删除当前正在使用的配置 "${profileName}"`);
      Logger.info('请先切换到其他配置后再删除');
      rl.close();
      process.exit(1);
    }
    
    // 显示要删除的配置信息
    const profile = profiles[profileName];
    console.log('\n要删除的配置:');
    Logger.separator();
    Logger.keyValue('名称', profileName);
    Logger.keyValue('Token', Logger.hideToken(profile.ANTHROPIC_AUTH_TOKEN || '未设置'));
    Logger.keyValue('Base URL', profile.ANTHROPIC_BASE_URL || '未设置');
    Logger.keyValue('Model', profile.ANTHROPIC_MODEL || '未设置');
    Logger.separator();
    
    // 确认删除
    const confirmed = await confirmAction(rl, `\n确定要删除配置 "${profileName}" 吗？`);
    rl.close();
    
    if (!confirmed) {
      Logger.info('操作已取消');
      return;
    }
    
    // 删除配置
    await ConfigManager.removeProfile(profileName);
    
    Logger.success(`配置 "${profileName}" 已删除`);
    
  } catch (error) {
    rl.close();
    Logger.error(`删除配置失败: ${error instanceof Error ? error.message : '未知错误'}`);
    process.exit(1);
  }
}