#!/bin/bash

# 前端项目构建和部署脚本
# 适用于腾讯云服务器部署

set -e  # 遇到错误立即退出

echo "🚀 AI角色扮演前端 - 构建和部署开始..."
echo "========================================"

# 配置变量
SERVER_IP="129.204.241.238"
FRONTEND_DIR="/var/www/ai-role-frontend"
LOCAL_DIST_DIR="./dist"

# 颜色输出函数
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. 环境检查
log_info "1. 检查构建环境..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js未安装，请先安装Node.js"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    log_error "npm未安装，请先安装npm"
    exit 1
fi

# 检查项目依赖
if [ ! -f "package.json" ]; then
    log_error "package.json文件不存在，请确保在项目根目录运行此脚本"
    exit 1
fi

log_info "✅ 环境检查通过"

# 2. 安装依赖
log_info "2. 安装项目依赖..."

if [ ! -d "node_modules" ]; then
    log_info "安装所有依赖..."
    npm install
else
    log_info "依赖已存在，跳过安装"
fi

log_info "✅ 依赖安装完成"

# 3. 构建项目
log_info "3. 构建前端项目..."

# 清理旧的构建文件
if [ -d "$LOCAL_DIST_DIR" ]; then
    log_info "清理旧的构建文件..."
    rm -rf $LOCAL_DIST_DIR
fi

# 执行构建
log_info "执行构建命令: npm run build"
npm run build

# 检查构建结果
if [ ! -d "$LOCAL_DIST_DIR" ]; then
    log_error "构建失败，dist目录未生成"
    exit 1
fi

if [ ! -f "$LOCAL_DIST_DIR/index.html" ]; then
    log_error "构建失败，index.html文件未生成"
    exit 1
fi

log_info "✅ 前端构建完成"

# 4. 本地验证
log_info "4. 本地验证构建结果..."

# 检查构建文件大小
BUILD_SIZE=$(du -sh $LOCAL_DIST_DIR | cut -f1)
log_info "构建文件大小: $BUILD_SIZE"

# 检查主要文件是否存在
REQUIRED_FILES=("index.html" "assets/" "favicon.ico")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -e "$LOCAL_DIST_DIR/$file" ]; then
        log_warn "⚠️ 文件 $file 不存在"
    else
        log_info "✅ 文件 $file 存在"
    fi
done

log_info "✅ 本地验证完成"

# 5. 准备部署文件
log_info "5. 准备部署文件..."

# 创建部署包
DEPLOY_PACKAGE="ai-role-frontend-$(date +%Y%m%d-%H%M%S).tar.gz"
log_info "创建部署包: $DEPLOY_PACKAGE"

tar -czf $DEPLOY_PACKAGE -C $LOCAL_DIST_DIR .

# 检查部署包
if [ ! -f "$DEPLOY_PACKAGE" ]; then
    log_error "部署包创建失败"
    exit 1
fi

PACKAGE_SIZE=$(du -h $DEPLOY_PACKAGE | cut -f1)
log_info "部署包大小: $PACKAGE_SIZE"

log_info "✅ 部署包准备完成"

# 6. 部署到服务器（可选）
echo ""
log_info "6. 部署选项:"
echo "   1) 仅本地构建"
echo "   2) 手动上传到服务器"
echo "   3) 自动部署到服务器"
echo ""

read -p "请选择部署方式 (1-3): " deploy_choice

case $deploy_choice in
    1)
        log_info "✅ 本地构建完成"
        log_info "部署包位置: $(pwd)/$DEPLOY_PACKAGE"
        ;;
    2)
        log_info "📋 手动部署步骤:"
        echo "   1. 上传文件: $DEPLOY_PACKAGE 到服务器"
        echo "   2. 解压到: $FRONTEND_DIR"
        echo "   3. 设置权限: sudo chown -R www-data:www-data $FRONTEND_DIR"
        echo "   4. 重启Nginx: sudo systemctl restart nginx"
        ;;
    3)
        # 自动部署到服务器
        log_info "开始自动部署到服务器..."
        
        # 检查SSH连接
        if ! ssh root@$SERVER_IP "echo 'SSH连接测试成功'"; then
            log_error "SSH连接失败，请检查服务器连接"
            exit 1
        fi
        
        # 上传部署包
        log_info "上传部署包到服务器..."
        scp $DEPLOY_PACKAGE root@$SERVER_IP:/tmp/
        
        # 在服务器上执行部署
        log_info "在服务器上执行部署..."
        ssh root@$SERVER_IP "
            set -e
            
            # 备份现有文件
            if [ -d \"$FRONTEND_DIR\" ] && [ \"\$(ls -A $FRONTEND_DIR)\" ]; then
                BACKUP_DIR=\"$FRONTEND_DIR-backup-\$(date +%Y%m%d-%H%M%S)\"
                echo \"备份现有文件到: \$BACKUP_DIR\"
                cp -r \"$FRONTEND_DIR\" \"\$BACKUP_DIR\"
            fi
            
            # 清空并解压新文件
            rm -rf \"$FRONTEND_DIR\"/*
            tar -xzf /tmp/$DEPLOY_PACKAGE -C \"$FRONTEND_DIR\"
            
            # 设置权限
            chown -R www-data:www-data \"$FRONTEND_DIR\"
            chmod -R 755 \"$FRONTEND_DIR\"
            
            # 重启Nginx
            systemctl restart nginx
            
            echo \"✅ 部署完成\"
        "
        
        # 清理临时文件
        ssh root@$SERVER_IP "rm -f /tmp/$DEPLOY_PACKAGE"
        
        log_info "✅ 自动部署完成"
        ;;
    *)
        log_info "✅ 本地构建完成"
        log_info "部署包位置: $(pwd)/$DEPLOY_PACKAGE"
        ;;
esac

# 7. 清理和总结
log_info "7. 清理临时文件..."

# 保留部署包，但可以删除旧的
OLD_PACKAGES=$(find . -name "ai-role-frontend-*.tar.gz" -mtime +7)
if [ -n "$OLD_PACKAGES" ]; then
    log_info "清理7天前的旧部署包..."
    rm -f $OLD_PACKAGES
fi

log_info "🎉 前端部署流程完成！"
echo ""
echo "📋 部署信息:"
echo "   服务器地址: http://$SERVER_IP"
echo "   前端目录: $FRONTEND_DIR"
echo "   构建时间: $(date)"
echo "   部署包: $DEPLOY_PACKAGE"
echo ""

# 验证部署（如果选择了自动部署）
if [ "$deploy_choice" = "3" ]; then
    log_info "验证部署结果..."
    
    if curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP/ | grep -q "200"; then
        log_info "✅ 前端页面访问正常"
    else
        log_warn "⚠️ 前端页面访问异常"
    fi
fi

echo "🔧 常用命令:"
echo "   重新构建: npm run build"
echo "   本地预览: npm run preview"
echo "   开发模式: npm run dev"
echo ""

log_info "💡 部署完成！访问 http://$SERVER_IP 查看效果"