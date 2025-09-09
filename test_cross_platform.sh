#!/bin/bash

# 跨平台功能测试脚本

echo "🧪 开始跨平台功能测试..."
echo

# 构建项目
echo "📦 构建项目..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi
echo "✅ 构建成功"
echo

# 测试基本命令
echo "🔍 测试基本命令..."
echo "- 测试版本信息:"
npm run dev -- --version

echo "- 测试帮助信息:"
npm run dev -- --help | head -10

echo "- 测试列出配置:"
npm run dev -- list

echo "- 测试查看当前配置:"
npm run dev -- current | head -15

# 测试平台检测
echo
echo "🌐 测试平台检测..."
echo "当前操作系统: $(uname -s)"

# 测试跨平台环境变量命令格式
echo
echo "⚙️ 测试环境变量命令格式..."

# 在 macOS/Linux 上应该生成 export 命令
if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Unix-like 系统检测 - 应该生成 export 命令格式"
    npm run dev -- use default 2>/dev/null | grep -E "export|&&" || echo "未检测到 export 命令"
elif [[ "$OSTYPE" == "msys"* ]] || [[ "$OSTYPE" == "cygwin"* ]]; then
    echo "Windows 系统检测 - 应该生成 set 命令格式"
    npm run dev -- use default 2>/dev/null | grep -E "set|&&" || echo "未检测到 set 命令"
fi

# 测试剪切板功能
echo
echo "📋 测试剪切板功能..."
if command -v pbcopy >/dev/null 2>&1; then
    echo "✅ macOS pbcopy 可用"
elif command -v clip >/dev/null 2>&1; then
    echo "✅ Windows clip 可用"  
elif command -v xclip >/dev/null 2>&1; then
    echo "✅ Linux xclip 可用"
elif command -v xsel >/dev/null 2>&1; then
    echo "✅ Linux xsel 可用"
else
    echo "⚠️ 未检测到剪切板工具，功能将降级为手动复制"
fi

echo
echo "🎉 所有测试完成！"
echo "📝 注意：剪切板功能在不同平台上的表现："
echo "   • macOS: 使用 pbcopy（内置）"
echo "   • Windows: 使用 clip（内置）"
echo "   • Linux: 使用 xclip 或 xsel（需要安装）"