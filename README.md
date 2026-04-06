# GoPay Platform Web

GoPay 支付平台运营管理系统前端项目

## 技术栈

- Vue 3 + TypeScript + Vite
- Ant Design Vue 4.x
- Vue Router 5
- Pinia
- ECharts
- Axios

## 功能特性

- ✅ 登录页面（默认账号：admin/admin）
- ✅ 主布局（侧边栏导航 + 顶部导航栏）
- ✅ 仪表盘（数据概览、订单统计、通知公告、交易图表）
- ✅ 完整菜单配置（13个主模块）
- ⏳ 系统管理模块
- ⏳ 商户管理模块
- ⏳ 订单管理模块
- ⏳ 更多功能开发中...

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
gopay-platform-web/
├── src/
│   ├── api/              # API 接口
│   ├── assets/           # 静态资源
│   ├── components/       # 公共组件
│   │   └── Layout.vue    # 主布局组件
│   ├── router/           # 路由配置
│   │   ├── index.ts      # 路由主文件
│   │   └── menu.ts       # 菜单配置
│   ├── store/            # 状态管理
│   │   ├── index.ts      # Pinia 主文件
│   │   └── user.ts       # 用户状态
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数
│   ├── views/            # 页面组件
│   │   ├── login/        # 登录页面
│   │   ├── dashboard/    # 仪表盘
│   │   ├── system/       # 系统管理
│   │   ├── merchant/     # 商户管理
│   │   └── order/        # 订单管理
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── PROJECT_PROGRESS.md   # 项目进度文档
└── package.json
```

## 开发进度

详细的开发进度和任务清单请查看 [PROJECT_PROGRESS.md](./PROJECT_PROGRESS.md)

## 访问地址

开发环境：http://localhost:3000/

## 登录信息

- 账号：admin
- 密码：admin

## License

Apache License 2.0
