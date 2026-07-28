---
title: "Terraform 提供程序 | Cloud"
slug: /terraform-provider
sidebar_label: "Terraform 提供程序"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz 提供全托管的 Milvus 服务，在兼顾安全性的前提下简化向量搜索应用的部署与扩缩容，并免除了构建和维护复杂基础设施的需求，包括 Zilliz 提供的云基础设施以及您自己的基础设施。 | Cloud"
type: origin
token: BX6iwjUzLi7udfksJoxc7jK1nsW
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Terraform 提供程序

Zilliz 提供全托管的 Milvus 服务，在兼顾安全性的前提下简化向量搜索应用的部署与扩缩容，并免除了构建和维护复杂基础设施的需求，包括 Zilliz 提供的云基础设施以及您自己的基础设施。

[Zilliz Cloud Terraform Provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest) 是一个开源的基础设施即代码（IaC）解决方案，可让您动态构建、更改并版本化您的 Zilliz Cloud 资源。使用前，您必须使用适当的凭证配置该提供程序，例如具有相应权限的 Zilliz Cloud API 密钥。 

## 身份验证\{#authentication}

在您开始使用 Terraform 部署资源之前，必须先让 Terraform 通过 Zilliz Cloud 平台完成身份验证。您必须使用具有相应权限的 Zilliz Cloud API 密钥完成身份验证，然后才能对此 Terraform 提供程序执行任何操作。要创建 Zilliz Cloud API 密钥，请按以下步骤操作：

<Procedures>

1. 登录 [Zilliz Cloud 控制台](https://cloud.zilliz.com/login)。

1. 在顶部导航栏右侧，点击 **API 密钥**。

1. 在 API 密钥页面右上角，点击 **+ API 密钥**。

1. 在出现的 **创建 API 密钥** 对话框中，输入 API 密钥名称并配置其访问权限，然后点击 **创建** 生成 API 密钥。

</Procedures>

有关管理 API 密钥的更多信息，请参阅 [API 密钥](/docs/byoc/manage-api-keys)。

## 可管理的资源\{#manageable-resources}

目前，您可以使用此提供程序管理以下类型的资源：

### 集群\{#clusters}

[Zilliz Cloud 集群](/docs/manage-cluster) 是运行在 Zilliz Cloud 上的 Milvus 实例。Zilliz Cloud 将其集群划分为多种产品形态，包括 **Free**、**Serverless**、**Dedicated (Standard)**、**Dedicated (Enterprise)** 和 **Bring Your Own Cloud (BYOC)**。有关这些产品形态的详细信息，请参阅[详细方案对比](/docs/select-zilliz-cloud-service-plans)。

您可以使用 Zilliz Cloud Terraform Provider 创建和管理任意特定产品形态的集群。详情请参阅以下教程：

<Admonition type="info" icon="📘" title="说明">

在 BYOC 中使用 Terraform Provider 时，仅支持专用集群和 BYOC 集群类型。不支持在 BYOC 项目中创建 Free 和 Serverless 集群。

</Admonition>

- [创建 Free 集群](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-free-cluster)

- [创建 Serverless 集群](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-serverless-cluster)

- [创建 Dedicated 集群](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-standard-cluster)

- [扩缩容集群](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/scale-cluster)

- [将现有集群导入 Terraform 管理](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/import-cluster)

### 数据库\{#database}

在 Zilliz Cloud 中，[数据库](/docs/database) 作为组织和管理数据的逻辑单元。它仅在专用集群中可用。创建集群后，将自动创建一个默认数据库。有关如何使用 Zilliz Cloud Terraform Provider 管理数据库的详细信息，请参阅以下资源和数据源：

- [数据库（资源）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/database)

- [数据库（数据源）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/databases)

### 集合与别名\{#collection-and-aliases}

[集合](/docs/manage-collections) 是一个具有固定列和可变行的二维表。每一列代表一个字段，每一行代表一个实体。有关如何使用 Zilliz Cloud Terraform Provider 管理集合的详细信息，请参阅以下资源和数据源：

- [别名（资源）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/alias)

- [集合（资源）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/collection)

- [别名（数据源）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/aliases)

- [集合（数据源）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/collections)

### 分区\{#partition}

分区是集合的一个子集。每个分区与其父集合共享相同的数据结构，但仅包含该集合中的部分数据。本页帮助您了解如何管理分区。有关如何使用 Zilliz Cloud Terraform Provider 管理分区的详细信息，请参阅以下资源和数据源：

- [分区（资源）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/partitions)

- [分区（数据源）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/partitions)

### 索引\{#index}

Zilliz Cloud 使用 [AUTOINDEX](/docs/autoindex-explained) 来实现高效的相似性搜索。它还提供以下[度量类型](/docs/search-metrics-explained)：**Cosine Similarity**（COSINE）、**Euclidean Distance**（L2）、**Inner Product**（IP）、**JACCARD** 和 **HAMMING**，用于衡量向量嵌入之间的距离。AUTOINDEX 也适用于标量字段，以加速元数据过滤。有关如何使用 Zilliz Cloud Terraform Provider 管理索引的详细信息，请参阅以下资源和数据源：

- [索引（资源）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/index)

- [索引（数据源）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/indexes)

### 用户与角色\{#users-and-roles}

在 Zilliz Cloud 中，您可以创建集群用户并为其分配集群角色，以定义权限并实现数据安全。用户表示已正确配置凭证的数据库用户，并被分配一组角色；角色则是封装一组权限并可分配给用户的实体。您可以使用本节中的资源和数据源来实现基于角色的访问控制（RBAC）。详情请参阅以下资源和数据源：

- [用户（资源）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/user)

- [用户（数据源）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/users)

- [角色（资源）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/user_role)

- [角色（数据源）](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/roles)

