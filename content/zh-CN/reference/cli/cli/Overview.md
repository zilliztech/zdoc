---
title: "Zilliz CLI | Cloud"
slug: /cli/cli/overview
sidebar_label: "概述"
sidebar_position: 0
---

# Zilliz CLI

[Zilliz Command Line Interface (CLI)](https://github.com/zilliztech/zilliz-cli) 提供了一个命令行工具，用于管理您的 Zilliz Cloud 资源并执行数据操作。借助该工具，您可以在终端中完成从云端资源管理到向量数据处理的一系列常见任务，适合希望通过脚本化方式、自动化流程或交互式命令来操作 Zilliz Cloud 的开发者与运维人员使用。

## 功能

- **云管理** - 管理集群、项目、存储卷和备份等云资源，便于进行环境创建、维护与资源组织
- **配置** - 配置身份验证、告警以及 CLI 设置，以便在不同账号、上下文和使用场景之间切换
- **数据操作** - 管理集合、数据库、索引，并执行向量搜索等操作，满足数据导入、查询和检索需求

## 快速开始

通过以下几个步骤，您可以快速安装并开始使用 Zilliz CLI。完成安装和登录后，即可直接在命令行中创建和管理云资源。

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

## 命令分类

Zilliz CLI 的命令按照用途分为多个类别，便于您根据不同任务快速定位对应命令。以下列出了主要分类及其覆盖的操作范围。

### [云管理](./CloudManagement/CloudManagement-Cluster/Cluster-create)

- [备份](./CloudManagement/CloudManagement-Backup/Backup-create) - 创建、恢复和管理备份
- [计费](./CloudManagement/CloudManagement-Billing/Billing-bindcard) - 查看发票和使用情况
- [集群](./CloudManagement/CloudManagement-Cluster/Cluster-create) - 创建、暂停、恢复和删除集群
- [项目](./CloudManagement/CloudManagement-Project/Project-create) - 管理项目
- [存储卷](./CloudManagement/CloudManagement-Volume/Volume-create) - 管理存储卷

### [配置](./Configuration/Configuration-Auth/Auth-login)

- [认证](./Configuration/Configuration-Auth/Auth-login) - 登录、登出以及切换账号
- [配置管理](./Configuration/Configuration-Configure/Configure-clear) - 设置和获取配置值
- [上下文](./Configuration/Configuration-Context/Context-current) - 管理 CLI 上下文
- [告警](./Configuration/Configuration-Alert/Alert-create) - 创建和管理告警

### [数据操作](./DataOperations/DataOperations-Collection/Collection-create)

- [集合](./DataOperations/DataOperations-Collection/Collection-create) - 创建、查看并管理集合
- [数据库](./DataOperations/DataOperations-Database/Database-create) - 管理数据库
- [索引](./DataOperations/DataOperations-Index/Index-create) - 创建和管理索引
- [向量](./DataOperations/DataOperations-Vector/Vector-delete) - 插入、搜索和查询向量
- [用户/角色](./DataOperations/DataOperations-Role/Role-create) - 管理用户和角色

## 开始使用

如果您是首次使用 Zilliz CLI，建议按照下面的顺序逐步完成操作：先完成身份验证，再创建集群，最后创建集合。这样可以帮助您更快熟悉 CLI 的核心工作流程，并为后续执行数据写入、索引构建和向量检索操作做好准备。

- [身份验证](./Configuration/Configuration-Auth/Auth-login)
- [创建集群](./CloudManagement/CloudManagement-Cluster/Cluster-create)
- [创建集合](./DataOperations/DataOperations-Collection/Collection-create)
