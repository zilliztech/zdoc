---
title: "Terraform Provider | Cloud"
slug: /terraform-provider
sidebar_label: "Terraform Provider"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz offers a fully managed Milvus service, streamlining the deployment and scaling of vector search applications with security in mind, and eliminating the need to build and maintain complex infrastructure, including both the cloud infrastructure Zilliz provides and your own. | Cloud"
type: origin
token: BX6iwjUzLi7udfksJoxc7jK1nsW
sidebar_position: 14
keywords: 
  - zilliz
  - vector database
  - cloud
  - terraform provider
  - terraform
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search

---

import Admonition from '@theme/Admonition';


# Terraform Provider

Zilliz offers a fully managed Milvus service, streamlining the deployment and scaling of vector search applications with security in mind, and eliminating the need to build and maintain complex infrastructure, including both the cloud infrastructure Zilliz provides and your own.

The [Zilliz Cloud Terraform Provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest) is an open-source Infrastructure as Code (IaC) solution that enables you to dynamically build, change, and version your Zilliz Cloud resources. Before using it, you must configure the provider with proper credentials, such as a Zilliz Cloud API key with appropriate permissions. 

## Authentication\{#authentication}

Before you begin a resource deployment using Terraform, you must authenticate Terraform with the Zilliz Cloud platform. You must use a Zilliz Cloud API key with the appropriate permissions to complete authentication before any operations with this Terraform provider. To create a Zilliz Cloud API key, follow these steps:

1. Sign in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. On the right of the top navigation bar, click **API Keys**.

1. Click **+ API Key** in the top right corner on the API Keys page.

1. In the **Create API Key** dialog box that appears, enter an API key name and configure its access privileges, and click **Create** to generate an API key.

For more information about managing API keys, refer to [API Keys](/docs/byoc/manage-api-keys).

## Manageable Resources\{#manageable-resources}

Currently, you can use this provider to manage the following types of resources:

### Clusters\{#clusters}

A [Zilliz Cloud cluster](/docs/manage-cluster) is a Milvus instance that operates on Zilliz Cloud. Zilliz Cloud categorizes its clusters into various offerings, including **Free**, **Serverless**, **Dedicated (Standard)**, **Dedicated (Enterprise)**, and **Bring Your Own Cloud (BYOC)**. For details on these offerings, refer to the [Detailed Plan Comparison](/docs/select-zilliz-cloud-service-plans).

You can use the Zilliz Cloud Terraform Provider to create and manage clusters of any specific offering. For details, refer to the following tutorials:

- [Create a Free Cluster](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-free-cluster)

- [Create a Serverless Cluster](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-serverless-cluster)

- [Create a Dedicated Cluster](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-standard-cluster)

- [Scale Cluster](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/scale-cluster)

- [Import Existing Clusters into Terraform Management](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/import-cluster)

### Database\{#database}

In Zilliz Cloud, a [database](/docs/database) serves as a logical unit for organizing and managing data. It is available only in dedicated clusters. Upon the creation of a cluster, a default database will be created. For details about how to manage database using Zilliz Cloud Terraform Provider, refer to the resources and data sources below:

- [Database (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/database)

- [Databases (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/databases)

### Collection & Aliases\{#collection-and-aliases}

A [collection](/docs/manage-collections) is a two-dimensional table with fixed columns and variant rows. Each column represents a field, and each row represents an entity. For details about how to manage collections using Zilliz Cloud Terraform Provider, refer to the following resources and data sources below:

- [Aliases (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/alias)

- [Collection (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/collection)

- [Aliases (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/aliases)

- [Collections (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/collections)

### Partition\{#partition}

A partition is a subset of a collection. Each partition shares the same data structure with its parent collection but contains only a subset of the data in the collection. This page helps you understand how to manage partitions. For details on how to manage partitions using Zilliz Cloud Terraform Provider, refer to the following resources and data sources below:

- [Partitions (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/partitions)

- [Partitions (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/partitions)

### Index\{#index}

Zilliz Cloud employs [AUTOINDEX](/docs/autoindex-explained) to enable efficient similarity searches. It also offers these [metric types](/docs/search-metrics-explained): **Cosine Similarity** (COSINE), **Euclidean Distance** (L2), **Inner Product** (IP), **JACCARD**, and **HAMMING** to measure the distances between vector embeddings. AUTOINDEX also applies to scalar fields to accelerate metadata filtering. For details about how to manage indexes using Zilliz Cloud Terraform Provider, refer to the following resources and data sources below:

- [Index (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/index)

- [Indexes (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/indexes)

### Users & Roles\{#users-and-roles}

In Zilliz Cloud, you can create cluster users and assign them cluster roles to define the privileges, achieving data security. A user represents a database user with properly configured credentials and is assigned a set of roles, while a role is an entity that encapsulates a set of privileges and can be assigned to users. You can use this section's resources and data sources to implement role-based access control (RBAC). For details, refer to the resource and data sources below:

- [User (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/user)

- [Users (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/users)

- [Role (Resource)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/resources/user_role)

- [Roles (Data Source)](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/data-sources/roles)

