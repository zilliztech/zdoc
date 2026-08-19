---
title: "访问控制概览 | Cloud"
slug: /access-control-overview
sidebar_label: "访问控制概览"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 实现基于角色的访问控制（RBAC），用于精细控制对 Zilliz Cloud 中资源的访问。RBAC 是一种安全措施，它将权限授予角色，而不是直接授予用户。这些角色包含针对资源的特定权限，然后再授予用户，从而高效管理用户访问控制。 | Cloud"
type: origin
token: HA7nwc7s2i1mmDkdT62cAyZxnwb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 访问控制概览

Zilliz Cloud 实现基于角色的访问控制（RBAC），用于精细控制对 Zilliz Cloud 中资源的访问。RBAC 是一种安全措施，它将权限授予角色，而不是直接授予用户。这些角色包含针对资源的特定权限，然后再授予用户，从而高效管理用户访问控制。

Zilliz Cloud 访问控制模型包含三个层级：

- **组织级**：管理组织成员身份、组织角色、账单访问权限。

- **项目级**：管理项目成员身份、项目角色以及对项目资源（例如集群）的访问。

- **集群级**：管理数据库用户、集群角色以及数据库、Collection 和其他集群资源的数据平面权限。

这些层级协同工作，但不会彼此替代。用户可以登录组织，但不一定有权访问项目。项目成员可以管理项目资源，但不一定自动拥有集群内的所有数据库权限。集群用户可以搜索或插入数据，但不一定是组织管理员。

## 访问控制如何组织\{#how-access-control-is-organized}

Zilliz Cloud 将访问控制分为**平台访问**（控制平面）和**数据访问**（数据平面）。

![EKV5w8TgGh2zZnbnKErc9AyHnQf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/EKV5w8TgGh2zZnbnKErc9AyHnQf.png)

- **平台访问**控制 Zilliz Cloud 控制台和控制平面 API 中的组织级和项目级操作，例如邀请成员、管理账单、创建项目、配置集群以及管理项目级权限。

- **数据访问**控制集群内的操作，例如创建集群用户、创建集群角色、授予权限、创建 Collection、构建索引、插入数据、搜索、查询和删除数据。

这种分离有助于团队为每项职责授予所需的最小访问权限。例如，财务同事可能需要账单访问权限，但不需要集群数据访问权限。开发者可能需要访问一个项目和一个集群，但不需要组织管理权限。

## 组织级访问\{#organization-level-access}

组织是 Zilliz Cloud 账号访问的顶层边界。

以下是在 Zilliz Cloud 中实现组织级 RBAC 的工作流。

<Procedures>

1. [邀请组织成员](./manage-platform-users#invite-organization-users)。

1. 向成员或组[分配预定义组织角色](./manage-platform-roles#predefined-organization-roles)。每个组织角色都包含一组预定义权限，用于确定被分配的成员可以在组织级执行哪些操作。组织成员会自动继承角色中包含的权限。

</Procedures>

## 项目级访问\{#project-level-access}

项目是组织云资源（例如集群）和项目特定访问策略的主要边界。项目级访问控制谁可以在项目中工作，以及他们可以对项目资源执行哪些操作。

以下是在 Zilliz Cloud 中实现项目级 RBAC 的工作流。

<Procedures>

1. [创建自定义项目角色](./manage-platform-roles#create-a-custom-project-role)或使用[预定义项目角色](./manage-platform-roles#predefined-project-roles)。每个项目角色都包含一组预定义权限，用于确定被分配的成员可以在项目级执行哪些操作。

1. 邀请项目[成员](./manage-platform-users#invite-project-users)，并将项目角色分配给用户。项目成员会自动继承角色中包含的权限。

</Procedures>

## 集群级访问\{#cluster-level-access}

集群级访问控制集群内的数据平面权限。它使用集群用户、集群角色、权限和权限组。

该层级很重要，因为项目访问和集群数据访问回答的是不同问题：

- 项目访问回答：“此账号用户是否可以使用该项目及其云资源？”

- 集群访问回答：“此集群用户是否可以对此数据库、Collection 或集群资源执行此操作？”

下图展示了在 Zilliz Cloud 中实现 RBAC 的完整工作流。

![XFE3wJ7oYhO7d2bi9HucoFgHnfc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/XFE3wJ7oYhO7d2bi9HucoFgHnfc.png)

<Procedures>

1. **创建用户**：除了 Zilliz Cloud 中的默认用户 `db_admin` 外，您还可以通过 [Web 控制台](./cluster-users)或 [SDK](./cluster-users-sdk) 创建新用户，并设置密码以保障数据安全。

1. **创建角色**：您可以通过 [Web 控制台](./cluster-roles)或 [SDK](./cluster-roles-sdk) 创建自定义角色。角色的具体能力由其所拥有的权限决定。

1. **（可选）创建权限组并添加权限：** 可将多个[权限](./cluster-privileges)组合成一个权限组，以简化向角色授予权限的过程。除了 Zilliz Cloud 提供的内置权限组外，您还可以使用 [SDK ](./cluster-privileges#custom-privilege-group)创建自定义权限组。

1. **为角色授予权限或权限组**：通过向角色授予权限或权限组来定义其能力。目前，您只能在 [Web 控制台](./cluster-roles#create-a custom-cluster-role)上为角色授予内置权限组。如需为角色授予特定权限或自定义权限组，请[提交工单](http://support.zilliz.com.cn/)并使用 [SDK](./cluster-roles-sdk#grant-a-privilege-group-to-a-role) 实现。

1. **为用户授予角色**：将包含特定权限的角色授予用户，使用户具备相应的角色权限。单个角色可同时授予多个用户。您可以通过[ Web 控制台](./cluster-users#edit-the-role-of-a-cluster-user)或 [SDK](./cluster-users-sdk#grant-a-role-to-a-user) 完成此操作。

</Procedures>

## 如何确定有效访问权限\{#how-effective-access-is-determined}

用户的有效访问权限是其从所有适用分配中获得的最终权限集。

在实践中：

- 组织角色决定用户可以在组织级执行哪些操作。

- 项目角色决定用户可以在特定项目内执行哪些操作。

- 集群角色决定集群用户可以在特定集群内执行哪些操作。

如果用户从多个来源获得访问权限，Zilliz Cloud 应评估合并后的权限。

## 访问模式示例\{#example-access-patterns}

- **财务用户**财务同事需要管理发票，但不需要访问项目资源或集群数据。

    - 邀请用户加入组织。

    - 分配**组织账单管理员**角色。

    - 除非用户还需要项目访问权限，否则不要分配项目角色。

    - 除非用户还需要数据平面访问权限，否则不要创建集群用户。

- **项目所有者**团队负责人拥有一个项目，并需要管理用户、角色、集群和项目资源。

    - 确保用户是组织成员。

    - 邀请用户加入目标项目。

    - 为该项目分配**项目管理员**角色。

    - 仅当用户还需要连接到集群并执行数据平面操作时，才授予集群级访问权限。

**应用程序写入者**

应用程序需要在生产集群中插入和更新向量，但不应管理组织或项目设置。

- 创建或识别生产集群所在的项目。

- 仅为应用程序凭证所有者分配所需的最小项目级访问权限。

- 为应用程序创建集群用户。

- 创建或选择一个对所需数据库或 Collection 具有写入权限的集群角色。

- 将该集群角色授予集群用户。

**只读分析师**

分析师需要检查或查询数据，但不应修改资源。

- 邀请用户加入目标项目。

- 分配 **Data Viewer** 角色，或分配具有只读访问权限的自定义项目角色。

- 如果需要直接集群访问，请创建集群用户，并分配只读集群角色或限制为所需 Collection 的自定义集群角色。

## 最佳实践\{#best-practices}

- 仅向少数管理员授予**组织管理员**角色。

- 将 **Public** 用作只需要登录组织的用户的默认基线。

- 使用项目角色在不同团队之间划分项目职责。

- 当内置角色比实际工作职责更宽泛时，创建自定义项目角色。

- 使用集群角色管理数据平面权限，尤其是在访问必须限制到特定数据库或 Collection 时。

- 尽可能将人员访问与应用程序访问分离。

- 将移除过期用户作为定期访问审查的一部分。

