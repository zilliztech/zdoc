---
title: "Zilliz CLI | Cloud"
slug: /cli/cli/overview
sidebar_label: "概述"
sidebar_position: 0
---

# Zilliz CLI

[Zilliz Command Line Interface (CLI)](https://github.com/zilliztech/zilliz-cli) 提供了一个命令行工具，用于管理您的 Zilliz Cloud 资源并执行数据操作。

## 功能

- **Cloud Management** - 管理集群、项目、存储卷和备份
- **Configuration** - 配置身份验证、告警和 CLI 设置
- **Data Operations** - 管理 Collection、Database、索引，并执行向量搜索

## 快速开始

### 安装

```bash
pip install zilliz-cli
```

### 身份验证

```bash
zilliz login
```

### 创建集群

```bash
zilliz cluster create --name my-cluster --type serverless
```

## 命令类别

### [Cloud Management](./CloudManagement/CloudManagement-Cluster/Cluster-create)

- [Backup](./CloudManagement/CloudManagement-Backup/Backup-create) - 创建、恢复和管理备份
- [Billing](./CloudManagement/CloudManagement-Billing/Billing-bindcard) - 查看发票和用量
- [Cluster](./CloudManagement/CloudManagement-Cluster/Cluster-create) - 创建、暂停、恢复和删除集群
- [Project](./CloudManagement/CloudManagement-Project/Project-create) - 管理项目
- [Volume](./CloudManagement/CloudManagement-Volume/Volume-create) - 管理存储卷

### [Configuration](./Configuration/Configuration-Auth/Auth-login)

- [Auth](./Configuration/Configuration-Auth/Auth-login) - 登录、登出和切换账户
- [Configure](./Configuration/Configuration-Configure/Configure-clear) - 设置和获取配置值
- [Context](./Configuration/Configuration-Context/Context-current) - 管理 CLI 上下文
- [Alert](./Configuration/Configuration-Alert/Alert-create) - 创建和管理告警

### [Data Operations](./DataOperations/DataOperations-Collection/Collection-create)

- [Collection](./DataOperations/DataOperations-Collection/Collection-create) - 创建、描述和管理 Collection
- [Database](./DataOperations/DataOperations-Database/Database-create) - 管理 Database
- [Index](./DataOperations/DataOperations-Index/Index-create) - 创建和管理索引
- [Vector](./DataOperations/DataOperations-Vector/Vector-delete) - 插入、搜索和查询向量
- [User/Role](./DataOperations/DataOperations-Role/Role-create) - 管理用户和角色

## 开始使用

- [身份验证](./Configuration/Configuration-Auth/Auth-login)
- [创建集群](./CloudManagement/CloudManagement-Cluster/Cluster-create)
- [创建 Collection](./DataOperations/DataOperations-Collection/Collection-create)
