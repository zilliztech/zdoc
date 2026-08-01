---
title: "Terraform Provider | BYOC"
slug: /terraform-provider
sidebar_label: "Terraform Provider"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz 提供全托管 Milvus 服务，在安全设计的基础上简化向量搜索应用的部署和扩展，并避免你构建和维护复杂基础设施，包括 Zilliz 提供的云基础设施以及你自己的基础设施。 | BYOC"
type: origin
token: GMnbw5a3kigAudkf5TqcaBJFnkd
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Terraform Provider

Zilliz 提供全托管 Milvus 服务，在安全设计的基础上简化向量搜索应用的部署和扩展，并避免你构建和维护复杂基础设施，包括 Zilliz 提供的云基础设施以及你自己的基础设施。

[Zilliz Cloud Terraform Provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest) 是一个开源 Infrastructure as Code (IaC) 方案，使你能够动态构建、更改和版本化 Zilliz Cloud 资源。使用前，你必须使用适当凭据配置 provider，例如具有相应权限的 Zilliz Cloud API key。

## 身份验证\{#}

在开始使用 Terraform 部署资源前，必须向 Zilliz Cloud 平台验证 Terraform 身份。在使用此 Terraform provider 执行 cloud-plane 操作前，必须使用具有适当权限的 Zilliz Cloud API key 完成身份验证。要创建 Zilliz Cloud API key，请按以下步骤操作：

1. 登录 [Zilliz Cloud console](https://cloud.zilliz.com/login)。

1. 在顶部导航栏右侧，点击 **API Keys**。

1. 在 API Keys 页面右上角点击 **+ API Key**。

1. 在出现的 **Create API Key** 对话框中，输入 API key 名称并配置其访问权限，然后点击 **Create** 生成 API key。

有关管理 API keys 的更多信息，请参阅 [API Keys](/docs/byoc/manage-api-keys)。

要执行 collection 操作、search 和 query 等 data-plane operations，需要使用目标 cluster 的冒号分隔用户名和密码，格式为 `username:password`，作为 cluster access token。

在下列资源中，clusters、users & roles 和 BYOC projects 资源使用 Zilliz Cloud APIs。database、collection & aliases、partition 和 index 资源使用 cluster access token。

## 可管理资源\{#}

目前，你可以使用此 provider 管理以下类型的资源：

### Clusters\{#clusters}

[Zilliz Cloud cluster](/docs/manage-cluster) 是运行在 Zilliz Cloud 上的 Milvus 实例。Zilliz Cloud 将其 clusters 分类为多种产品形态，包括 **Free**、**Serverless**、**Dedicated (Standard)、Dedicated (Enterprise)** 和 **Bring Your Own Cloud (BYOC)**。有关这些产品形态的详细信息，请参阅 [Detailed Plan Comparison](/docs/select-zilliz-cloud-service-plans)。

你可以使用 Zilliz Cloud Terraform Provider 创建和管理任何特定产品形态的 clusters。详情请参阅以下教程：

<Admonition type="info" icon="📘" title="注意">

在 BYOC 中使用 Terraform Provider 时，仅支持 dedicated 和 BYOC cluster 类型。BYOC projects 中不支持创建 Free 和 Serverless clusters。

</Admonition>

- [Create a Free Cluster](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-free-cluster)

- [Create a Serverless Cluster](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-serverless-cluster)

- [Create a Dedicated Cluster](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-standard-cluster)

- [Scale Cluster](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/scale-cluster)

- [Import Existing Clusters into Terraform Management](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/import-cluster)

### Database\{#database}

在 Zilliz Cloud 中，[database](/docs/database) 是组织和管理数据的逻辑单元。它仅在 dedicated clusters 中可用。创建 cluster 时，会创建一个默认 database。有关如何使用 Zilliz Cloud Terraform Provider 管理 database 的详细信息，请参阅以下资源和数据源：

- [Database (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/database)

- [Databases (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/databases)

### Collection & Aliases\{#collection-and-aliases}

[collection](/docs/manage-collections) 是具有固定列和可变行的二维表。每一列表示一个字段，每一行表示一个实体。有关如何使用 Zilliz Cloud Terraform Provider 管理 collections 的详细信息，请参阅以下资源和数据源：

- [Aliases (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/alias)

- [Collection (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/collection)

- [Aliases (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/aliases)

- [Collections (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/collections)

### Partition\{#partition}

partition 是 collection 的子集。每个 partition 与其父 collection 共享相同的数据结构，但只包含该 collection 中的一部分数据。本页帮助你了解如何管理 partitions。有关如何使用 Zilliz Cloud Terraform Provider 管理 partitions 的详细信息，请参阅以下资源和数据源：

- [Partitions (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/partitions)

- [Partitions (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/partitions)

### Index\{#index}

Zilliz Cloud 使用 [AUTOINDEX](/docs/autoindex-explained) 实现高效相似性搜索。它还提供这些 [metric types](/docs/search-metrics-explained)：**Cosine Similarity** (COSINE)、**Euclidean Distance** (L2)、**Inner Product** (IP)、**JACCARD** 和 **HAMMING**，用于衡量向量 embeddings 之间的距离。AUTOINDEX 也适用于 scalar fields，以加速 metadata filtering。有关如何使用 Zilliz Cloud Terraform Provider 管理 indexes 的详细信息，请参阅以下资源和数据源：

- [Index (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/index)

- [Indexes (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/indexes)

### Users & Roles\{#users-and-roles}

在 Zilliz Cloud 中，你可以创建 cluster users，并为其分配 cluster roles 来定义权限，从而实现数据安全。user 表示具有适当配置凭据的 database user，并被分配一组 roles；role 是封装一组 privileges 并可分配给 users 的实体。你可以使用本节的资源和数据源实现 role-based access control (RBAC)。详情请参阅以下资源和数据源：

- [User (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/user)

- [Users (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/users)

- [Role (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/user_role)

- [Roles (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/roles)

### BYOC projects\{#byoc-projects}

Zilliz Cloud 还提供 BYOC 方案，使组织能够将应用和数据托管在自己的云账号中，而不是依赖 Zilliz Cloud 的基础设施。BYOC 方案可部署为 BYOC 或 BYOC-I 模式，具体取决于你是否允许 Zilliz Cloud 通过跨账号权限代表你管理基础设施资源。详情请参阅 [BYOC Overview](/docs/byoc/byoc-intro)。

你可以使用 Zilliz Cloud Terraform Provider 创建 BYOC 或 BYOC-I project，并在你的 VPC 中部署相关 data plane resources。详情请参阅以下教程：

- [Create a BYOC Project on Zilliz Cloud Console](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-project-on-console)

- [Create a BYOC Project using Terraform](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-project)

- [Create a BYOC-I Project using Terraform](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project)

- [Manage Milvus Cluster in BYOC Environments](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/managing-milvus-in-byoc)

