#!/usr/bin/env node

import { Command } from 'commander';
import { listCommand } from './commands/list';
import { useCommand } from './commands/use';
import { currentCommand } from './commands/current';
import { openCommand } from './commands/open';
import { addCommand } from './commands/add';
import { removeCommand } from './commands/remove';
import { Logger } from './utils/logger';

const program = new Command();

// 设置程序信息
program
  .name('cc-config')
  .description('Claude Code 配置切换工具')
  .version('1.0.0', '-v, --version', '显示版本号');

// list 命令 - 列出所有配置
program
  .command('list')
  .alias('ls')
  .description('列出所有可用配置')
  .action(async () => {
    await listCommand();
  });

// use 命令 - 切换配置
program
  .command('use <profile>')
  .description('切换到指定配置')
  .action(async (profile: string) => {
    await useCommand(profile);
  });

// current 命令 - 显示当前配置
program
  .command('current')
  .alias('cur')
  .description('显示当前配置信息')
  .action(async () => {
    await currentCommand();
  });

// open 命令 - 打开配置文件
program
  .command('open')
  .description('在默认编辑器中打开配置文件')
  .action(async () => {
    await openCommand();
  });

// add 命令 - 添加新配置
program
  .command('add [name]')
  .description('添加新配置 (交互式)')
  .action(async (name?: string) => {
    await addCommand(name);
  });

// remove 命令 - 删除配置
program
  .command('remove <profile>')
  .alias('rm')
  .description('删除指定配置')
  .action(async (profile: string) => {
    await removeCommand(profile);
  });

// 未知命令处理
program.on('command:*', (operands) => {
  Logger.error(`未知命令: ${operands[0]}`);
  Logger.info('使用 "cc-config --help" 查看可用命令');
  process.exit(1);
});

// 错误处理
process.on('uncaughtException', (error) => {
  Logger.error(`未捕获的异常: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  Logger.error(`未处理的 Promise 拒绝: ${reason}`);
  process.exit(1);
});

// 解析命令行参数
async function main() {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    Logger.error(`命令执行失败: ${error instanceof Error ? error.message : '未知错误'}`);
    process.exit(1);
  }
}

// 如果没有提供任何参数，显示帮助信息
if (process.argv.length <= 2) {
  program.help();
}

main();