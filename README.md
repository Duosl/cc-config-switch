# Claude Code 配置切换工具

一个用于管理 Claude Code 多个配置文件的跨平台命令行工具。

## 平台支持

✅ **macOS** - 完全支持，自动复制命令到剪切板  
✅ **Windows** - 完全支持，自动复制命令到剪切板  
✅ **Linux** - 完全支持，需要安装 `xclip` 或 `xsel` 以启用剪切板功能

## 特性

- 🌐 **跨平台支持** - macOS、Windows、Linux 全平台支持
- 🔧 管理多个 Claude Code 配置
- 🔄 快速切换不同配置
- 📝 交互式添加新配置
- 📋 列出所有配置信息
- 🔍 查看当前配置状态
- 📁 直接编辑配置文件
- 📤 导出环境变量设置
- 📋 **智能剪切板** - 自动复制环境变量命令

## 安装

### 环境要求

- **Node.js**: 16.0.0 或更高版本
- **操作系统**: macOS、Windows、Linux

### 剪切板功能要求

- **macOS**: 内置 `pbcopy` 支持（无需额外安装）
- **Windows**: 内置 `clip` 支持（无需额外安装）
- **Linux**: 需要安装 `xclip` 或 `xsel`
  ```bash
  # Ubuntu/Debian
  sudo apt-get install xclip
  # 或者
  sudo apt-get install xsel
  
  # CentOS/RHEL/Fedora  
  sudo yum install xclip
  # 或者
  sudo dnf install xclip
  ```

### 全局安装

> 需要先 clone 当前项目，在根目录下执行

```bash
npm install -g .
```

### 开发模式

```bash
npm install
npm run build
```

## 使用方法

### 列出所有配置

```bash
cc-config list
# 或
cc-config ls
```

### 切换配置

```bash
cc-config use <配置名称>
```

### 查看当前配置

```bash
cc-config current
# 或
cc-config cur
```

### 添加新配置

```bash
cc-config add [配置名称]
```

如果不提供配置名称，将会交互式地要求输入。

### 删除配置

```bash
cc-config remove <配置名称>
# 或
cc-config rm <配置名称>
```

### 打开配置文件

```bash
cc-config open
```

## 配置文件

配置文件位于 `~/.cc-config/profiles.json`，格式如下：

```json
{
  "current": "default",
  "profiles": {
    "default": {
    },
    "bigmodel": {
      "ANTHROPIC_AUTH_TOKEN": "sk-******************************r",
      "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
      "ANTHROPIC_MODEL": "glm-4.5"
    },
    "kimi": {
      "ANTHROPIC_AUTH_TOKEN": "sk-******************************r",
      "ANTHROPIC_BASE_URL": "https://api.moonshot.cn/anthropic",
      "ANTHROPIC_MODEL": "kimi-k2-turbo-preview"
    }
  }
}
```

## 环境变量

工具会管理以下环境变量：

- `ANTHROPIC_AUTH_TOKEN`: Anthropic API Token
- `ANTHROPIC_BASE_URL`: API Base URL (默认: https://api.anthropic.com)
- `ANTHROPIC_MODEL`: 使用的模型

### 跨平台命令格式

**Unix/Linux/macOS:**
```bash
export ANTHROPIC_AUTH_TOKEN="your-token" && export ANTHROPIC_BASE_URL="https://api.anthropic.com" && export ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"
```

**Windows 命令提示符:**
```cmd
set "ANTHROPIC_AUTH_TOKEN=your-token" && set "ANTHROPIC_BASE_URL=https://api.anthropic.com" && set "ANTHROPIC_MODEL=claude-3-5-sonnet-20241022"
```

工具会根据您的操作系统自动生成正确的命令格式。

## 开发

### 构建

```bash
npm run build
```

### 开发模式运行

```bash
npm run dev -- [命令]
```

### 清理构建文件

```bash
npm run clean
```

## 示例

```bash
# 列出所有配置
cc-config list

# 添加新配置
cc-config add personal

# 切换到工作配置
cc-config use work

# 查看当前配置
cc-config current

# 打开配置文件进行编辑
cc-config open
```

## 许可证

[MIT LICENSE](./LICENSE)