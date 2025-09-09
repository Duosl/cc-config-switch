import * as readline from 'readline';
import { ConfigManager } from '../config/manager';
import { Logger } from '../utils/logger';
import { AddProfileInput, DEFAULT_VALUES } from '../config/types';

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
 * 异步询问用户输入
 */
function question(rl: readline.Interface, prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      rl.question(prompt, (answer) => {
        resolve(answer.trim());
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 验证 URL 格式
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 添加新配置
 */
export async function addCommand(profileName?: string): Promise<void> {
  // 检查是否在交互式终端中
  if (!process.stdin.isTTY) {
    Logger.error('此命令需要在交互式终端中运行');
    Logger.info('请直接运行 "cc-config add" 或 "cc-config add <配置名称>"');
    process.exit(1);
  }

  const rl = createReadlineInterface();
  
  try {
    let input: AddProfileInput = { name: '', token: '' };
    
    // 获取配置名称
    if (profileName) {
      input.name = profileName;
    } else {
      while (!input.name) {
        const name = await question(rl, '请输入配置名称: ');
        if (!name) {
          Logger.error('配置名称不能为空');
          continue;
        }
        
        // 检查配置是否已存在
        try {
          const { profiles } = await ConfigManager.listProfiles();
          if (profiles[name]) {
            Logger.error(`配置 "${name}" 已存在`);
            continue;
          }
        } catch (error) {
          // 如果配置文件不存在，可以继续
        }
        
        input.name = name;
      }
    }
    
    // 获取 Token
    while (!input.token) {
      const token = await question(rl, '请输入 Anthropic Auth Token: ');
      if (!token) {
        Logger.error('Token 不能为空');
        continue;
      }
      input.token = token;
    }
    
    // 获取 Base URL（可选）
    const baseUrlInput = await question(rl, `请输入 Base URL (默认: ${DEFAULT_VALUES.BASE_URL}): `);
    if (baseUrlInput) {
      if (!isValidUrl(baseUrlInput)) {
        Logger.error('无效的 URL 格式');
        rl.close();
        process.exit(1);
      }
      input.baseUrl = baseUrlInput;
    }
    
    // 获取模型（可选）
    const modelInput = await question(rl, `请输入模型名称 (默认: 不设置): `);
    if (modelInput) {
      input.model = modelInput;
    }
    
    rl.close();
    
    // 添加配置
    await ConfigManager.addProfile(input);
    
    Logger.success(`配置 "${input.name}" 已添加成功`);
    
    // 显示配置信息
    console.log('\n新配置信息:');
    Logger.separator();
    Logger.keyValue('名称', input.name);
    Logger.keyValue('Token', Logger.hideToken(input.token));
    Logger.keyValue('Base URL', input.baseUrl || DEFAULT_VALUES.BASE_URL);
    Logger.keyValue('Model', input.model || '');
    Logger.separator();
    
    console.log();
    Logger.info(`使用 "cc-config use ${input.name}" 切换到此配置`);
    
  } catch (error) {
    rl.close();
    Logger.error(`添加配置失败: ${error instanceof Error ? error.message : '未知错误'}`);
    process.exit(1);
  }
}