# 安装配置指南

本指南将帮助你快速安装和配置 SkinFlow 多智能体框架。

## 系统要求

### 基本要求
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **操作系统**: Linux, macOS, Windows
- **内存**: >= 4GB RAM
- **存储**: >= 1GB 可用空间

### 数据库支持
- **PostgreSQL**: >= 12 (推荐用于生产环境)
- **SQLite**: >= 3.35 (适合开发和测试)
- **MySQL**: >= 8.0 (实验性支持)

### LLM 提供商支持
- **OpenAI**: GPT-3.5, GPT-4 系列
- **Anthropic**: Claude 系列
- **本地模型**: Ollama, LocalAI
- **其他**: 任何兼容 OpenAI API 的服务

## 安装步骤

### 1. 创建新项目

```bash
# 创建项目目录
mkdir my-agent-app
cd my-agent-app

# 初始化 Node.js 项目
npm init -y

# 设置 ES 模块支持
echo '{"type": "module"}' > package.json
npm init -y # 重新初始化保持 type: "module"
```

### 2. 安装 SkinFlow

#### 方式一：从 npm 安装（推荐）
```bash
npm install skingflow
```

#### 方式二：从源码安装
```bash
git clone https://github.com/your-org/skingflow.git
cd skingflow
npm install
npm link

cd ../my-agent-app
npm link skingflow
```

### 3. 安装必需依赖

```bash
# 核心依赖
npm install dotenv

# 数据库驱动（选择一个）
npm install pg          # PostgreSQL
npm install sqlite3     # SQLite
npm install mysql2      # MySQL

# 可选依赖
npm install winston     # 日志系统
npm install pm2 -g      # 生产环境进程管理
```

## 环境配置

### 1. 创建环境变量文件

```bash
# 复制示例配置
cp node_modules/skingflow/.env.example .env

# 或手动创建
touch .env
```

### 2. 配置环境变量

编辑 `.env` 文件：

```env
# ================================
# LLM 配置
# ================================

# LLM 提供商类型 (http/ollama)
LLM_PROVIDER=http

# API 配置
LLM_BASE_URL=https://api.openai.com/v1/chat/completions
LLM_API_KEY=your-openai-api-key-here
LLM_MODEL=gpt-4

# 模型参数
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=4000
LLM_TIMEOUT=30000

# ================================
# 数据库配置
# ================================

# 数据库类型 (postgres/sqlite/mysql)
DB_TYPE=postgres

# PostgreSQL 配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skingflow
DB_USER=postgres
DB_PASSWORD=your-password

# 或使用连接字符串
# DATABASE_URL=postgresql://user:password@localhost:5432/skingflow

# SQLite 配置（用于开发）
# SQLITE_PATH=./data/skingflow.db

# ================================
# 框架配置
# ================================

# 调试模式
DEBUG_ENABLED=true
LOG_LEVEL=info
LOG_FILE=logs/skingflow.log

# 记忆系统配置
MEMORY_MAX_SHORT_TERM=50
MEMORY_MAX_LONG_TERM=1000
ENABLE_SEMANTIC_SEARCH=true

# 工具配置
CUSTOM_TOOLS_DIR=./tools
BUILTIN_TOOLS=write_todos,write_file,read_file,edit_file,ls

# 降级机制配置
FALLBACK_MAX_RETRIES=3
FALLBACK_RETRY_DELAY=1000
ENABLE_CIRCUIT_BREAKER=true

# ================================
# 可选配置
# ================================

# 向量数据库（用于语义搜索）
VECTOR_DB_URL=http://localhost:8080
VECTOR_DB_API_KEY=your-vector-db-key

# Redis 缓存
REDIS_URL=redis://localhost:6379

# 监控和指标
METRICS_ENABLED=true
HEALTH_CHECK_INTERVAL=30000
```

## 数据库设置

### PostgreSQL 设置

#### 1. 安装 PostgreSQL

```bash
# macOS (使用 Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
```

#### 2. 创建数据库和用户

```sql
-- 连接到 PostgreSQL
psql -U postgres

-- 创建数据库
CREATE DATABASE skingflow;

-- 创建专用用户
CREATE USER skingflow_user WITH PASSWORD 'secure_password';

-- 授予权限
GRANT ALL PRIVILEGES ON DATABASE skingflow TO skingflow_user;

-- 退出
\q
```

#### 3. 配置连接

更新 `.env` 文件：

```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skingflow
DB_USER=skingflow_user
DB_PASSWORD=secure_password
```

### SQLite 设置（开发环境）

```bash
# 创建数据目录
mkdir -p data

# 配置环境变量
echo "DB_TYPE=sqlite" >> .env
echo "SQLITE_PATH=./data/skingflow.db" >> .env
```

## 验证安装

### 1. 创建测试文件

创建 `test-installation.js`：

```javascript
import { createMultiAgentFramework } from 'skingflow';
import dotenv from 'dotenv';

dotenv.config();

async function testInstallation() {
  console.log('🧪 测试 SkinFlow 安装...\n');
  
  try {
    // 创建框架配置
    const config = {
      llm: {
        provider: process.env.LLM_PROVIDER || 'http',
        baseUrl: process.env.LLM_BASE_URL,
        apiKey: process.env.LLM_API_KEY,
        model: process.env.LLM_MODEL || 'gpt-4'
      },
      memory: {
        storage: {
          type: process.env.DB_TYPE || 'sqlite',
          config: process.env.DB_TYPE === 'postgres' ? {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
          } : {
            database: process.env.SQLITE_PATH || './data/test.db'
          }
        }
      },
      builtinTools: ['write_todos'],
      debug: true
    };
    
    // 初始化框架
    console.log('📦 正在初始化框架...');
    const framework = await createMultiAgentFramework(config);
    console.log('✅ 框架初始化成功！');
    
    // 测试基本功能
    console.log('🔍 测试基本功能...');
    const result = await framework.processRequest(
      '你好，这是一个测试请求',
      { userId: 'test-user' }
    );
    
    console.log('✅ 基本功能测试成功！');
    console.log(`   响应时间: ${result.duration}ms`);
    console.log(`   使用子智能体: ${result.subAgentsUsed}`);
    
    // 获取统计信息
    const stats = framework.getStats();
    console.log('📊 框架统计:');
    console.log(`   组件数量: ${stats.components}`);
    console.log(`   工具数量: ${stats.tools}`);
    console.log(`   子智能体: ${stats.subAgents}`);
    
    // 清理
    await framework.close();
    console.log('\n🎉 安装测试完成！SkinFlow 已准备就绪。');
    
  } catch (error) {
    console.error('❌ 安装测试失败:');
    console.error(error.message);
    console.error('\n请检查配置并参考故障排除指南。');
    process.exit(1);
  }
}

testInstallation();
```

### 2. 运行测试

```bash
node test-installation.js
```

成功输出示例：
```
🧪 测试 SkinFlow 安装...

📦 正在初始化框架...
✅ 框架初始化成功！
🔍 测试基本功能...
✅ 基本功能测试成功！
   响应时间: 2341ms
   使用子智能体: 1
📊 框架统计:
   组件数量: 6
   工具数量: 5
   子智能体: 5

🎉 安装测试完成！SkinFlow 已准备就绪。
```

## Docker 安装

### 1. 创建 Dockerfile

```dockerfile
FROM node:18-alpine

# 安装系统依赖
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 创建必要目录
RUN mkdir -p logs data

# 设置权限
RUN chown -R node:node /app
USER node

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node health-check.js || exit 1

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "app.js"]
```

### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  skingflow-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - LLM_API_KEY=${LLM_API_KEY}
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/skingflow
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    networks:
      - skingflow-network
    
  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=skingflow
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - skingflow-network

volumes:
  postgres_data:

networks:
  skingflow-network:
    driver: bridge
```

### 3. 部署

```bash
# 构建和启动
docker-compose up -d

# 查看日志
docker-compose logs -f skingflow-app

# 停止服务
docker-compose down
```

## 常见安装问题

### 1. Node.js 版本问题

```bash
# 检查 Node.js 版本
node --version

# 使用 nvm 管理 Node.js 版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### 2. 数据库连接问题

```javascript
// 测试数据库连接
import pg from 'pg';

const client = new pg.Client({
  host: 'localhost',
  port: 5432,
  database: 'skingflow',
  user: 'postgres',
  password: 'password'
});

try {
  await client.connect();
  console.log('✅ 数据库连接成功');
  await client.end();
} catch (error) {
  console.error('❌ 数据库连接失败:', error.message);
}
```

### 3. 权限问题

```bash
# 确保目录权限正确
chmod 755 ./logs
chmod 755 ./data

# 检查 Node.js 模块权限
ls -la node_modules/
```

### 4. 内存问题

```bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"

# 或在启动脚本中
node --max-old-space-size=4096 app.js
```

## 下一步

安装完成后，你可以：

1. 📖 阅读 [基础使用教程](basic-usage.md)
2. 🛠️ 查看 [工具系统文档](tools.md)
3. 🧠 了解 [记忆系统](memory.md)
4. 🎯 运行 [示例项目](../examples/)
5. ⚙️ 进行 [高级配置](advanced-config.md)

---

如果遇到问题，请查看 [故障排除指南](troubleshooting.md) 或提交 [GitHub Issue](https://github.com/your-org/skingflow/issues)。
