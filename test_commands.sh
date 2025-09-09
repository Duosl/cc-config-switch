#!/bin/bash

# 测试添加配置
echo "测试添加新配置..."
echo -e "work\nsk-ant-work-test-token\nhttps://api.anthropic.com\nclaude-3-5-sonnet-20241022" | npm run dev -- add

echo -e "\n\n测试列出所有配置..."
npm run dev -- list

echo -e "\n\n测试切换配置..."
npm run dev -- use work

echo -e "\n\n测试查看当前配置..."
npm run dev -- current

echo -e "\n\n测试导出配置..."
npm run dev -- export

echo -e "\n\n测试切换回默认配置..."
npm run dev -- use default

echo -e "\n\n测试删除配置..."
echo "y" | npm run dev -- remove work

echo -e "\n\n最终配置列表..."
npm run dev -- list