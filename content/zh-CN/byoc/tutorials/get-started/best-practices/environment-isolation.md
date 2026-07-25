---
title: "环境隔离 | BYOC"
slug: /environment-isolation
sidebar_label: "环境隔离"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在企业级应用开发和部署过程中，合理的环境隔离与访问控制至关重要。Zilliz Cloud 通过组织、项目、集群的层级结构，提供灵活的环境隔离方案。本文将帮助您根据运营、安全和财务需求选择最合适的隔离策略。 | BYOC"
type: origin
token: Mn3vwEyK0iFAQrkEKMFcklRInBg
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 环境隔离

---

import Admonition from '@theme/Admonition';


# 环境隔离

在企业级应用开发和部署过程中，合理的环境隔离与访问控制至关重要。Zilliz Cloud 通过**组织**、**项目**、**集群**的层级结构，提供灵活的环境隔离方案。本文将帮助您根据运营、安全和财务需求选择最合适的隔离策略。

## 项目级别隔离\{#project-level-isolation}

对于大多数企业级生产部署来说，项目级隔离是推荐选项，尤其是在不需要计费隔离的情况下。

**适用于：**

- 需要[管理用户访问权限](./project-users)，但不需要完全财务分离

**优势：**

- 在[项目](./projects)级别进行用户邀请和角色管理

- 支持统一账单，并可按环境追踪用量

- 对大多数企业场景提供足够的隔离能力

## 集群级别隔离\{#cluster-level-isolation}

最灵活、最轻量的隔离方式。

**适用于：**

- 专注快速迭代的小型团队

- 对访问控制要求较低的场景

- 简单的工作负载隔离需求

**特点：**

- 同一项目下可创建多个[集群](./cluster)

- 每个集群具有独立的计算/存储资源，实现工作负载隔离

- 提供统一[监控](./metrics-and-alerts)，便于运维与管理

## 选择合适的隔离策略\{#choosing-the-right-isolation-strategy}

您可以参考以下决策流程：

1. 是否需要独立账单或发票？ 

    → 是：选择**组织级别隔离**

1. 是否需要按环境实施 RBAC？ 

    → 是：选择**项目级别隔离**

1. 上述两者都不需要？ 

    → 选择**集群级别隔离**，以简化管理

如需定制化建议，欢迎联系 [Zilliz Cloud 支持团队](https://support.zilliz.com.cn/hc/zh-cn)。