import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { ConfigManager } from '../config/manager';
import { Logger } from '../utils/logger';
import { PlatformUtils } from '../utils/platform';

/**
 * 切换到指定配置
 */
export async function useCommand(profileName: string): Promise<void> {
  try {
    if (!profileName) {
      Logger.error('请指定要切换的配置名称');
      Logger.info('使用方式: cc-config use <配置名称>');
      process.exit(1);
    }

    // 检查配置是否存在并切换
    await ConfigManager.useProfile(profileName);
    
    // 获取切换后的配置信息
    const { profile } = await ConfigManager.getCurrentProfile();
    
    Logger.success(`已切换到配置: ${Logger.highlight(profileName)}`);
    console.log();
    
    // 生成跨平台环境变量命令
    const envCommands = PlatformUtils.getEnvironmentCommands();
    const commands: string[] = [];
    
    // 对于 ANTHROPIC_AUTH_TOKEN
    if (profile.ANTHROPIC_AUTH_TOKEN && profile.ANTHROPIC_AUTH_TOKEN.trim() !== '') {
      commands.push(envCommands.set('ANTHROPIC_AUTH_TOKEN', profile.ANTHROPIC_AUTH_TOKEN));
    } else {
      commands.push(envCommands.unset('ANTHROPIC_AUTH_TOKEN'));
    }
    
    // 对于 ANTHROPIC_BASE_URL
    if (profile.ANTHROPIC_BASE_URL && profile.ANTHROPIC_BASE_URL.trim() !== '') {
      commands.push(envCommands.set('ANTHROPIC_BASE_URL', profile.ANTHROPIC_BASE_URL));
    } else {
      commands.push(envCommands.unset('ANTHROPIC_BASE_URL'));
    }
    
    // 对于 ANTHROPIC_MODEL
    if (profile.ANTHROPIC_MODEL && profile.ANTHROPIC_MODEL.trim() !== '') {
      commands.push(envCommands.set('ANTHROPIC_MODEL', profile.ANTHROPIC_MODEL));
    } else {
      commands.push(envCommands.unset('ANTHROPIC_MODEL'));
    }
    
    const oneLineCommand = commands.join(envCommands.commandSeparator);
    
    // 尝试复制到剪切板
    try {
      // 显示环境变量设置指令
      const platformName = PlatformUtils.getPlatformName();
      console.log(`复制并执行以下命令来应用环境变量 (${platformName}):`);
      Logger.separator();
      console.log(oneLineCommand);
      Logger.separator();
      
      // 检查剪切板是否可用
      const clipboardAvailable = await PlatformUtils.isClipboardAvailable();
      
      if (clipboardAvailable) {
        Logger.info("正在尝试自动复制到剪切板...");
        
        const copySuccess = await PlatformUtils.copyToClipboard(oneLineCommand);
        
        if (copySuccess) {
          Logger.success('已自动复制到剪切板，直接粘贴执行即可！');
        } else {
          Logger.error('自动复制操作失败，复制】上面的命令');
        }
      } else {
        Logger.warn('剪切板工具不可用，请【复制】上面的命令');
        
        // 如果是 Linux 系统，提供安装建议
        const installCommand = PlatformUtils.getClipboardInstallCommand();
        if (installCommand) {
          Logger.info(`安装剪切板工具: ${installCommand}`);
        }
      }
      
    } catch (clipboardError) {
      Logger.error('自动复制操作失败，请【复制】上面的命令');
    }
    Logger.separator();
    Logger.warn('环境变量仅在当前终端会话中有效');
    Logger.warn('请重启 Claude Code 以使配置生效');
    console.log();
    
  } catch (error) {
    Logger.error(`切换配置失败: ${error instanceof Error ? error.message : '未知错误'}`);
    process.exit(1);
  }
}