---
title: "Terraform Provider | BYOC"
slug: /terraform-provider
sidebar_label: "Terraform Provider"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz 提供完全托管的 Milvus 服务，旨在简化向量搜索应用的部署与扩展，在安全性方面进行了优化设计，无需你自行构建和维护复杂的基础设施——无论是 Zilliz 提供的云环境，还是你自己的本地环境。 | BYOC"
type: origin
token: NE1qw4ke2ii1XfkMikrckk5Rnpb
sidebar_position: 11
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - terraform provider

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Terraform Provider

Zilliz 提供完全托管的 Milvus 服务，旨在简化向量搜索应用的部署与扩展，在安全性方面进行了优化设计，无需你自行构建和维护复杂的基础设施——无论是 Zilliz 提供的云环境，还是你自己的本地环境。

Zilliz Cloud Terraform Provider 是一个开源的基础设施即代码（Infrastructure as Code，IaC）解决方案，可让你动态地创建、修改和版本化管理你的 Zilliz Cloud 资源。在使用该工具前，你需要通过正确的凭据（例如具有适当权限的 Zilliz Cloud API 密钥）对 Provider 进行配置。

## 身份验证

在使用 Terraform 进行资源部署之前，你必须将 Terraform 与 Zilliz Cloud 平台进行身份验证。在使用该 Terraform Provider 执行任何操作之前，必须使用具有适当权限的 Zilliz Cloud API 密钥完成身份验证。

要创建 Zilliz Cloud API 密钥，请按照以下步骤操作：

<Procedures>

1. 登录 [Zilliz Cloud 控制台 ](https://cloud.zilliz.com.cn/)。

1. 在顶部导航栏的右侧，点击 **API 密钥**。

1. 在 **API 密钥** 页面的右上角，点击 **+ API 密钥** 。

1. 在弹出的**创建 API 密钥**对话框中，输入 **API 密钥名称**并配置其访问权限，然后点击**创建**以生成 API 密钥。

</Procedures>

有关管理 API 密钥的更多信息，请参阅[API 密钥](./manage-api-keys)。

## 可管理资源

目前，你可以使用该 Provider 管理以下类型的资源：

### 集群

Zilliz Cloud 集群是在 Zilliz Cloud 上运行的 Milvus 实例。Zilliz Cloud 将其集群划分为多种服务类型，包括 Free、Serverless、Dedicated (Standard)、Dedicated (Enterprise) 以及 Bring Your Own Cloud （BYOC)。

有关这些服务类型的详细介绍，请参阅 [Zilliz Cloud 版本对比](/docs/select-zilliz-cloud-service-plans)。

你可以使用 Zilliz Cloud Terraform Provider 创建和管理任意类型的集群实例。具体操作请参考以下教程：

- [Create a Free Cluster](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-free-cluster)

- [Create a Serverless Cluster](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-serverless-cluster)

- [Create a Dedicated Cluster](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-standard-cluster)

- [Scale Cluster](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/scale-cluster)

- [Import Existing Clusters into Terraform Management](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/import-cluster)

### Database

在 Zilliz Cloud 中，Database 是用于组织和管理数据的逻辑单元，仅在 Dedicated Clusters 中可用 。在创建集群时，系统会自动创建一个默认数据库。

如需了解如何使用 Zilliz Cloud Terraform Provider 管理 Database，请参考以下资源和数据源：

- [Database (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/database)

- [Databases (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/databases)

### Collection 和 Aliase\{#collection-aliases}

Collection 是一个具有固定列和可变行的二维表。每一列表示一个字段，每一行表示一个 Entity。

如需了解如何使用 Zilliz Cloud Terraform Provider 管理 Collection，请参考以下资源和数据源：

- [Aliases (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/alias)

- [Collection (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/collection)

- [Aliases (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/aliases)

- [Collections (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/collections)

### Partition

Partition 是集合的一个子集。每个分区与其父集合具有相同的数据结构，但仅包含集合中的一部分数据。

本页面可帮助你了解如何管理 Partition。如需了解如何使用 Zilliz Cloud Terraform Provider 管理分区，请参考以下资源和数据源：

- [Partitions (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/partitions)

- [Partitions (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/partitions)

### Index

Zilliz Cloud 采用 [AUTOINDEX](./autoindex-explained) 技术以实现高效的相似性搜索。它同时支持以下[相似度类型](./search-metrics-explained)来计算向量嵌入之间的距离：

- 余弦相似度（Cosine Similarity, COSINE ）

- 欧氏距离（Euclidean Distance, L2 ）

- 内积（Inner Product, IP ）

- 杰卡德相似系数（JACCARD）

- 汉明距离（HAMMING）

此外，AUTOINDEX 也适用于标量字段，用于加速元数据过滤。

如需了解如何使用 Zilliz Cloud Terraform Provider 管理索引，请参考以下资源和数据源：

- [Index (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/index)

- [Indexes (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/indexes)

### 用户和角色

在 Zilliz Cloud 中，你可以创建**集群用户**并为其分配**集群角色**来定义权限，从而实现数据安全。

- 用户（User） ：表示一个具有正确配置凭证的数据库用户，并被分配了一组角色。

- 角色（Role） ：是一个封装了若干权限的实体，可以被分配给用户，用于控制其访问和操作权限。

你可以使用本节中的资源和数据源来实现基于角色的访问控制（RBAC）。详情请参考以下资源和数据源：

- [User (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/user)

- [Users (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/users)

- [Role (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/user_role)

- [Roles (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/roles)

## BYOC 项目\{#byoc-projects}

Zilliz Cloud 还提供了一种 BYOC 解决方案，使组织能够在自己的云账户中托管应用程序和数据，而不是依赖Zilliz Cloud的基础设施。更多详情，可参考[BYOC 简介](./byoc-intro)。

您可以使用本节中的资源管理 BYOC 环境中的 Milvus 集群。详情请参考以下教程：

- [Manage Milvus Cluster in BYOC Environments](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/managing-milvus-in-byoc)

