---
title: "访问控制概览 | Cloud"
slug: /access-control-overview
sidebar_key: access-control-overview
sidebar_label: "访问控制概览"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud 采用基于角色的访问控制（RBAC）来实现精细化的资源访问控制。RBAC 是一种安全措施，它将权限授予角色而不是直接授予用户。这些角色包含对资源的特定权限，然后将这些角色授予用户，从而实现用户访问控制的高效管理。 | Cloud"
type: origin
token: APGCw9vhAiVHW2kDqtcceEdmn0b
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 安全
  - 访问控制
  - 访问控制概览
  - access control overview

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 访问控制概览

Zilliz Cloud 采用基于角色的访问控制（RBAC）来实现精细化的资源访问控制。RBAC 是一种安全措施，它将权限授予角色而不是直接授予用户。这些角色包含对资源的特定权限，然后将这些角色授予用户，从而实现用户访问控制的高效管理。

![BULSwuXe8haUhsbns9OcCi3pnig](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/BULSwuXe8haUhsbns9OcCi3pnig.png)

## Zilliz Cloud RBAC 架构\{#zilliz-cloud-rbac}

![JxEJw4kZvhzYiobUlAzcRxb0n9c](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/JxEJw4kZvhzYiobUlAzcRxb0n9c.png)

Zilliz Cloud 将资源分布在控制面（Control Plane）和数据面（Data Plane）上，并通过 RBAC 实现对控制面和数据面的访问控制。

- **控制面**：控制面包括组织、项目和集群管理。[账号用户](./email-accounts)被授予特定的组织和项目角色，并在与控制面资源交互时通过 [API 密钥](./manage-api-keys)进行身份验证。

- **数据面**：数据面包括集群、Database 和 Collection，主要负责数据访问管理。[集群用户](./cluster-users)被授予集群角色，并在与数平面资源交互时使用 [API 密钥](./manage-api-keys)或[用户名-密码对](./cluster-credentials)进行身份验证。

通常情况下，一个账号用户对应一个集群用户。然而，并非所有用户都需要同时访问控制面和数据面的资源。例如账单管理员这样的用户只需要控制面的访问权限，从而管理账单和支付方式，而不需要数据面的访问权限。此外，您还可以创建临时的集群用户并通过自定义 API 密钥授予其数据面资源的访问权限。这样一来，集群用户无需注册账号即可临时访问数据。有关管理自定义 API 密钥的详细信息，请参考 [API 密钥](./manage-api-keys)。

## 角色和权限\{#roles-and-privileges}

账号用户被授予组织角色和项目角色，集群用户被授予控制集群、Database 和 Collection 访问权限的集群角色。下图展示了 Zilliz Cloud 中角色的层级结构。

![OWHmwuJkrhnNDMbBW0ycXBPBngb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/OWHmwuJkrhnNDMbBW0ycXBPBngb.png)

- **组织层级**

    - 组织管理员角色包含所有项目和集群权限。

    有关组织角色的详情，请参考[管理组织用户](./organization-users)。

- **项目层级**

    - 项目管理员角色包含某个项目的所有管理权限以及项目下集群的管理权限。

    - 项目编辑者角色包含查看某个项目及项目下所有集群的管理权限。

    - 项目查看者角色包含查看某个项目及项目下所有集群的只读权限。

    有关项目角色的详情，请参考[管理项目用户](./project-users)。

- **集群层级**

    - 集群 Admin 角色包含某个集群的所有管理权限。

    - 集群 Read-Write 角色包含查看某个集群及在集群下 Collection 进行读写操作的权限。

    - 集群 Read-Only 角色包含查看集群及集群下 Collection 的只读权限。

    - 除上述 3 个内置角色外，您还可以 [创建自定义角色](./cluster-roles#create-a custom-cluster-role) 更精准地控制集群资源（Database、Collection）的访问权限。

    有关集群角色的详情，请参考[管理集群角色（控制台）](./cluster-roles)。

## 在 Zilliz Cloud 中实现 RBAC\{#implement-rbac-in-zilliz-cloud}

下图展示了在 Zilliz Cloud 中实现 RBAC 的完整流程。

![CXKvwad3shWWz9bwczCcwtqvnAg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/CXKvwad3shWWz9bwczCcwtqvnAg.png)

<Procedures>

1. **创建用户**：除了 Zilliz Cloud 中的默认用户 `db_admin` 外，您还可以通过 [Web 控制台](./cluster-users)或 [SDK](./cluster-users-sdk) 创建新用户，并设置密码以保障数据安全。

1. **创建角色**：您可以通过 [Web 控制台](./cluster-roles)或 [SDK](./cluster-roles-sdk) 创建自定义角色。角色的具体能力由其所拥有的权限决定。

1. **（可选）创建权限组并添加权限：** 可将多个[权限](./cluster-privileges)组合成一个权限组，以简化向角色授予权限的过程。除了 Zilliz Cloud 提供的内置权限组外，您还可以使用 [SDK ](./cluster-privileges#custom-privilege-group)创建自定义权限组。

1. **为角色授予权限或权限组**：通过向角色授予权限或权限组来定义其能力。目前，您只能在 [Web 控制台](./cluster-roles#create-a custom-cluster-role)上为角色授予内置权限组。如需为角色授予特定权限或自定义权限组，请[提交工单](http://support.zilliz.com.cn/)并使用 [SDK](./cluster-roles-sdk#grant-a-built-in-privilege-group-to-a-role) 实现。

1. **为用户授予角色**：将包含特定权限的角色授予用户，使用户具备相应的角色权限。单个角色可同时授予多个用户。您可以通过[ Web 控制台](./cluster-users#edit-the-role-of-a-cluster-user)或 [SDK](./cluster-users-sdk#grant-a-role-to-a-user) 完成此操作。

</Procedures>

