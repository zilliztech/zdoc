---
title: "Zilliz CLI | Cloud"
slug: /cli/cli/overview
sidebar_label: "概述"
sidebar_position: 0
---

# Zilliz CLI

[Zilliz Command Line Interface (CLI)](https://github.com/zilliztech/zilliz-cli) 提供了一个命令行工具，用于管理您的 Zilliz Cloud 资源并执行数据操作。借助该工具，您可以在终端中完成常见的云端资源管理任务，以及与向量数据相关的创建、查询和检索操作。

## 功能特性

- **云管理** - 管理集群、项目、存储卷和备份，便于统一维护云资源的生命周期
- **配置管理** - 配置身份验证、告警和 CLI 设置，帮助您根据使用场景调整本地环境
- **数据操作** - 管理集合、数据库、索引，并执行向量搜索等操作，以支持数据写入、查询和检索流程

## 快速开始

### 安装

使用以下命令安装 CLI：

```bash
pip install zilliz-cli
```

### 身份验证

安装完成后，运行以下命令登录您的账户，以便 CLI 可以访问相应的 Zilliz Cloud 资源：

```bash
zilliz login
```

### 创建集群

完成登录后，您可以使用下面的命令快速创建一个 serverless 类型的集群，作为后续数据操作的基础环境：

```bash
zilliz cluster create --name my-cluster --type serverless
```

## 命令分类

Zilliz CLI 按功能划分为多个命令类别，便于您根据资源类型或操作目标快速查找对应命令。下面列出了主要分类及其常见用途。

### [云管理](./CloudManagement/CloudManagement-Cluster/Cluster-create)

- [备份](./CloudManagement/CloudManagement-Backup/Backup-create) - 创建、恢复和管理备份
- [计费](./CloudManagement/CloudManagement-Billing/Billing-bindcard) - 查看发票和使用情况
- [集群](./CloudManagement/CloudManagement-Cluster/Cluster-create) - 创建、挂起、恢复和删除集群
- [项目](./CloudManagement/CloudManagement-Project/Project-create) - 管理项目
- [存储卷](./CloudManagement/CloudManagement-Volume/Volume-create) - 管理存储卷

### [配置](./Configuration/Configuration-Auth/Auth-login)

- [Auth](./Configuration/Configuration-Auth/Auth-login) - 登录、登出和切换账户
- [Configure](./Configuration/Configuration-Configure/Configure-clear) - 设置和获取配置值
- [Context](./Configuration/Configuration-Context/Context-current) - 管理 CLI 上下文
- [Alert](./Configuration/Configuration-Alert/Alert-create) - 创建和管理告警

### [数据操作](./DataOperations/DataOperations-Collection/Collection-create)

- [集合](./DataOperations/DataOperations-Collection/Collection-create) - 创建、查看详情并管理集合
- [数据库](./DataOperations/DataOperations-Database/Database-create) - 管理数据库
- [索引](./DataOperations/DataOperations-Index/Index-create) - 创建和管理索引
- [向量](./DataOperations/DataOperations-Vector/Vector-delete) - 插入、搜索和查询向量
- [用户/角色](./DataOperations/DataOperations-Role/Role-create) - 管理用户和角色

## 开始使用

如果您是首次使用 Zilliz CLI，建议按照以下顺序进行操作：先完成身份验证，再创建集群，最后创建集合并开始执行数据操作。这样可以更顺畅地完成从环境准备到实际使用的整个流程。

- [身份验证](./Configuration/Configuration-Auth/Auth-login)
- [创建集群](./CloudManagement/CloudManagement-Cluster/Cluster-create)
- [创建集合](./DataOperations/DataOperations-Collection/Collection-create)
