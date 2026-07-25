---
title: "版本说明书（2023/11/23） | Cloud"
slug: /release-notes-230
sidebar_key: release-notes-230
sidebar_label: "2023/11/23"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "我们很高兴地宣布 Zilliz Cloud 2.3.0 的发布。此版本引入了一系列创新 Beta 特性和功能改进。 | Cloud"
type: origin
token: BuuSwsbhEiIHDJkB9YSc63xAnrh
sidebar_position: 23
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


# 版本说明书（2023/11/23）

我们很高兴地宣布 Zilliz Cloud 2.3.0 的发布。此版本引入了一系列创新 Beta 特性和功能改进。

## Milvus 兼容性\{#milvus}

此次发布兼容 **Milvus 2.2.x** 以及 **Milvus 2.3.x (Beta)**。

## 创新 Beta 特性\{#innovative-beta-features}

通过我们最新的 Beta 特性，探索未来。立即升级以体验这些增强功能：

- 范围搜索

    用 [Range Search](./range-search) 重新定义你的查询，让你为搜索设置半径。与传统的 ANN 搜索不同，范围搜索确保包括指定半径内的所有向量，提供更全面的视图。

- Upsert

    通过 [Upsert](./upsert-entities)（“更新”和“插入”的融合）轻松管理动态数据集。享受频繁变化的数据集更高的效率。

- 余弦度量类型

    体验先进的向量搜索，支持余弦、内积和欧式距离。余弦度量消除了向量标准化的先决条件，简化了搜索过程。相关内容，可参考[相似度类型](./search-metrics-explained)。

- 访问控制

    通过 [API 密钥](./manage-api-keys)或[用户名密码身份验证](./cluster-credentials)安全地访问专用集群和无服务器实例。

- 返回原始向量

    在 [Search 参数](./single-vector-search)中指定向量字段，以将其作为搜索结果的一部分接收。

- JSON_CONTAINS 过滤器

    使用 [JSON_CONTAINS 运算符](./json-filtering-operators)进一步细化搜索，允许你基于 JSON 字段值指定过滤条件。

- Entity 计数

    快速概览加载的[集合中的 Entity 总数](./single-vector-search#use-output-fields)，以更好地管理数据。

## 功能改进\{#enhancements}

我们还实施了几项增强功能，以提升您的整体体验：

- RBAC 新角色

    授予[项目成员角色](./project-users)给项目协作者，以更流畅的协作。

- 计费优化

    享受更高效的计费管理，流程更简化。

- 高级价格计算器

    使用[价格计算器](https://zilliz.com/pricing#calculator)，获取综合估计，结合主键、向量字段和字符串字段，以提供更准确的价格概览。

- 自助服务账户删除

    轻松删除您自己的[账户](./email-accounts#delete-your-account)或[组织](./organization-users)，更好地控制您的个人资料。

- 稳定性增强

    我们解决了已知问题，以增强我们服务的可靠性。

感谢您选择 Zilliz Cloud，创新与性能的结合！

