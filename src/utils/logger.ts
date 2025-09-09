import chalk from 'chalk';

/**
 * 日志工具类
 */
export class Logger {
  /**
   * 输出成功信息
   */
  static success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  /**
   * 输出错误信息
   */
  static error(message: string): void {
    console.error(chalk.red('✗'), message);
  }

  /**
   * 输出警告信息
   */
  static warn(message: string): void {
    console.warn(chalk.yellow('⚠'), message);
  }

  /**
   * 输出普通信息
   */
  static info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  /**
   * 输出高亮文本
   */
  static highlight(text: string): string {
    return chalk.cyan(text);
  }

  /**
   * 输出当前配置的高亮文本
   */
  static current(text: string): string {
    return chalk.green.bold(text);
  }

  /**
   * 输出键值对
   */
  static keyValue(key: string, value: string): void {
    console.log(`${chalk.gray(key + ':')} ${value}`);
  }

  /**
   * 输出分隔线
   */
  static separator(): void {
    console.log(chalk.gray('─'.repeat(50)));
  }

  /**
   * 隐藏 token 的敏感部分
   */
  static hideToken(token: string): string {
    if (!token || token.length < 8) {
      return '***';
    }
    const start = token.substring(0, 4);
    const end = token.substring(token.length - 4);
    return `${start}${'*'.repeat(token.length - 8)}${end}`;
  }
}