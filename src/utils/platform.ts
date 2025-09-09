import * as os from 'os';
import { exec, ExecOptions } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 支持的操作系统平台
 */
export enum Platform {
  MACOS = 'darwin',
  WINDOWS = 'win32', // 无论32位还是64位Windows都返回win32
  LINUX = 'linux'
}

/**
 * 环境变量命令类型
 */
export interface EnvironmentCommands {
  set: (key: string, value: string) => string;
  unset: (key: string) => string;
  commandSeparator: string;
}

/**
 * 跨平台工具类
 */
export class PlatformUtils {
  /**
   * 获取当前操作系统平台
   */
  static getCurrentPlatform(): Platform {
    const platform = os.platform();
    switch (platform) {
      case 'darwin':
        return Platform.MACOS;
      case 'win32':
        return Platform.WINDOWS;
      case 'linux':
        return Platform.LINUX;
      default:
        // 对于其他 Unix-like 系统，默认使用 Linux 的行为
        return Platform.LINUX;
    }
  }

  /**
   * 检查是否为 Windows 平台
   */
  static isWindows(): boolean {
    return this.getCurrentPlatform() === Platform.WINDOWS;
  }

  /**
   * 检查是否为 macOS 平台
   */
  static isMacOS(): boolean {
    return this.getCurrentPlatform() === Platform.MACOS;
  }

  /**
   * 检查是否为 Linux 平台
   */
  static isLinux(): boolean {
    return this.getCurrentPlatform() === Platform.LINUX;
  }

  /**
   * 检查是否为 Unix-like 系统（macOS 或 Linux）
   */
  static isUnixLike(): boolean {
    return this.isMacOS() || this.isLinux();
  }

  /**
   * 获取平台特定的环境变量命令生成器
   */
  static getEnvironmentCommands(): EnvironmentCommands {
    if (this.isWindows()) {
      return {
        set: (key: string, value: string) => `set "${key}=${value}"`,
        unset: (key: string) => `set "${key}="`,
        commandSeparator: ' && '
      };
    } else {
      // Unix-like 系统 (macOS, Linux)
      return {
        set: (key: string, value: string) => `export ${key}="${value}"`,
        unset: (key: string) => `unset ${key}`,
        commandSeparator: ' && '
      };
    }
  }

  /**
   * 复制文本到剪切板
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      const platform = this.getCurrentPlatform();
      
      switch (platform) {
        case Platform.MACOS:
          await execAsync(`echo ${JSON.stringify(text)} | pbcopy`);
          return true;
          
        case Platform.WINDOWS:
          // Windows 使用 clip 命令
          await execAsync(`echo ${JSON.stringify(text)} | clip`);
          return true;
          
        case Platform.LINUX:
          // Linux 尝试使用 xclip 或 xsel
          try {
            await execAsync(`echo ${JSON.stringify(text)} | xclip -selection clipboard`);
            return true;
          } catch {
            try {
              await execAsync(`echo ${JSON.stringify(text)} | xsel --clipboard --input`);
              return true;
            } catch {
              // 如果都失败了，返回 false
              return false;
            }
          }
          
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * 检查剪切板工具是否可用
   */
  static async isClipboardAvailable(): Promise<boolean> {
    try {
      const platform = this.getCurrentPlatform();
      
      switch (platform) {
        case Platform.MACOS:
          await execAsync('which pbcopy');
          return true;
          
        case Platform.WINDOWS:
          // Windows 默认有 clip 命令
          return true;
          
        case Platform.LINUX:
          try {
            await execAsync('which xclip');
            return true;
          } catch {
            try {
              await execAsync('which xsel');
              return true;
            } catch {
              return false;
            }
          }
          
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * 获取详细的平台信息
   */
  static getDetailedPlatformInfo(): { 
    platform: string; 
    arch: string; 
    isWindows64: boolean;
    displayName: string;
  } {
    const platform = os.platform();
    const arch = os.arch();
    const isWindows64 = platform === 'win32' && (arch === 'x64' || arch === 'arm64');
    
    let displayName = this.getPlatformName();
    if (platform === 'win32') {
      displayName = isWindows64 ? 'Windows (64-bit)' : 'Windows (32-bit)';
    }
    
    return {
      platform,
      arch,
      isWindows64,
      displayName
    };
  }

  /**
   * 获取平台名称（用于显示）
   */
  static getPlatformName(): string {
    const platform = this.getCurrentPlatform();
    switch (platform) {
      case Platform.MACOS:
        return 'macOS';
      case Platform.WINDOWS:
        // 提供更详细的 Windows 版本信息
        const arch = os.arch();
        const is64bit = arch === 'x64' || arch === 'arm64';
        return `Windows ${is64bit ? '64' : '32'}`;
      case Platform.LINUX:
        return 'Linux';
      default:
        return 'Unknown';
    }
  }

  /**
   * 获取推荐的剪切板工具安装命令（仅 Linux）
   */
  static getClipboardInstallCommand(): string | null {
    if (this.isLinux()) {
      return 'sudo apt-get install xclip  # 或者 sudo apt-get install xsel';
    }
    return null;
  }
}