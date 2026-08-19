---
title: "身份管理概览 | Cloud"
slug: /identity-management-overview
sidebar_label: "身份管理概览"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 使用身份来表示可访问组织、项目、集群、API 或 SDK 工作流的人员、组以及非人类参与者（例如服务账号）。身份管理控制哪些身份存在于 Zilliz Cloud 中，以及这些身份如何被邀请、同步、创建、移除或认证。随后，访问控制决定这些身份可以访问什么，以及可以执行哪些操作。 | Cloud"
type: origin
token: S5oBwPIf6iNkSrkEyHYcvpJonSb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 身份管理概览

Zilliz Cloud 使用身份来表示可访问组织、项目、集群、API 或 SDK 工作流的人员、组以及非人类参与者（例如服务账号）。身份管理控制哪些身份存在于 Zilliz Cloud 中，以及这些身份如何被邀请、同步、创建、移除或认证。随后，[访问控制](./access-control-overview)决定这些身份可以访问什么，以及可以执行哪些操作。

# 身份和访问模型\{#identity-and-access-model}

Zilliz Cloud 中的访问控制模型围绕两个概念构建：**主体**和**角色**。主体是可以被授权的身份。角色是一组命名权限。将角色分配给主体会在该角色的作用域内授予该角色包含的权限。

| 概念 | 含义 | 示例 |
| --- | --- | --- |
| 主体（Principal） | 可以被授予访问权限的身份。 | 组织成员、项目协作者、集群用户、组、服务账号。 |
| 角色（Role） | 一组命名权限。 | 组织管理员、组织账单管理员、项目管理员、Cluster Admin、Data Operator、Data Viewer、自定义角色。 |
| 角色分配（Role Assignment） | 将角色授予主体的操作。 | 在 Project A 中将项目角色授予一名用户。 |
| 作用域 （Scope） | 角色生效的边界。 | 组织、项目、集群。 |
| 有效访问权限（Effective Access） | 直接分配和组分配合并后的最终访问权限。 | 用户从同步组获得 Data Viewer，并从直接的项目角色分配获得 Cluster Admin。 |

# 主体\{#principals}

下表列出了 Zilliz Cloud 中的多种主体类型。

| 主体类型 | 作用域 | 用途 |
| --- | --- | --- |
| 组织用户 | 组织 | 控制台登录、组织角色以及项目访问分配。 |
| 项目协作者 | 项目 | 访问特定项目及其项目级资源。 |
| 集群用户 | 集群 | 集群级和数据平面访问，例如数据库、Collection、搜索、查询和写入操作。 |
| 组 | 组织 | 通过 SCIM 从身份提供商同步的组。 |
| 服务账号 | 组织或项目 | 用于应用程序、脚本、CI/CD 和自动化的非人类访问。这等同于自定义 API Key。 |

# 主体类型之间的关系\{#how-principal-types-relate-to-each-other}

一个人可能出现在多个作用域中。例如，一个用户可以是组织用户、一个或多个项目中的项目协作者，以及用于数据平面访问的集群用户。这些身份在不同层级管理，因为它们保护不同的资源边界。

| 身份 | 控制内容 | 重要边界 |
| --- | --- | --- |
| 组织用户 | 一个人是否属于组织，以及是否可以登录控制台。 | 组织成员身份并不自动意味着可以访问每个项目或集群。 |
| 项目用户 | 用户或组是否可以访问特定项目。 | 必须针对特定项目授予项目访问权限。不支持跨项目通配符授权。 |
| 集群用户 | 身份是否可以访问集群资源和数据平面操作。 | 集群用户按集群管理，并且可以拥有独立于组织角色的集群角色。 |

# 服务账号\{#service-accounts}

使用服务账号进行非人类访问。服务账号表示应用程序、脚本、CI/CD 作业或自动化工作流。API Key 用于认证请求，但它们本身不定义权限。Zilliz Cloud 会根据拥有[自定义 API Key](./manage-api-keys)的用户或服务账号，以及分配给该主体的角色，来评估 API 和 SDK 请求。