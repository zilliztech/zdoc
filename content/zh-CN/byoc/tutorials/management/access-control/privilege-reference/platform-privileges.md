---
title: "平台资源权限 | BYOC"
slug: /platform-privileges
sidebar_label: "平台权限"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本参考列出了 Zilliz Cloud 访问控制使用的平台资源权限，并展示内置组织角色和项目角色如何映射到这些权限。 | BYOC"
type: origin
token: VUtXwhev1ibEBakSLqaciuWSnte
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 平台资源权限

本参考列出了 Zilliz Cloud 访问控制使用的平台资源权限，并展示内置组织角色和项目角色如何映射到这些权限。

当您需要回答以下问题时，请使用此页面：

- 每个平台资源有哪些可用权限？

- 哪些资源支持对象级角色授予？

- 每个内置组织角色或项目角色包含什么？

- 何时应在组织级、项目级或集群级管理访问权限？

有关集群数据平面权限，请参见[集群资源权限与权限组](./cluster-privileges)。本页面重点介绍组织级和项目级平台资源。

## 如何阅读本参考\{#how-to-read-this-reference}

每个资源条目包含以下字段：

| 字段 | 描述 |
| --- | --- |
| **Domain** | 资源所属的访问控制域，例如 IAM、organization、project 或 data。 |
| **Resource** | 由权限集控制的资源类型。 |
| **Available privileges** | 可授予该资源的操作。 |
| **Object-level grant** | 是否可以针对单个对象而不是整个资源类型授予权限。 |
| **Built-in role access** | 每个内置组织角色或项目角色授予的访问权限。 |

角色映射表使用以下值：

| 值 | 含义 |
| --- | --- |
| `*` | 该角色包含该资源列出的所有权限。 |
| `view` | 该角色可以查看该资源。 |
| `view, modify` | 该角色可以查看和修改该资源。 |
| `Read` | 该角色可以读取该资源的数据。 |
| `Read, Write` | 该角色可以读取和写入该资源的数据。 |
| `-` | 该角色不包含该资源的权限。 |

对于项目角色，权限仅适用于被分配的项目。某个项目中的 Project Admin 不会自动成为另一个项目中的 Project Admin。

## 涵盖的预定义角色\{#predefined-roles-covered}

本参考涵盖以下内置角色：

| 作用域 | 预定义角色 |
| --- | --- |
| 组织 | Org Owner、Billing Admin、Public |
| 项目 | Project Admin、Data Admin、Data Operator、Data Viewer |

## IAM 资源\{#iam-resources}

IAM 资源控制 Zilliz Cloud 平台使用的身份、凭证和角色。

| Resource | Display category | Available privileges | Object-level grant | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `org_member` | Identity | view, create, modify, delete | No | `*` | `-` | `view` | `-` | `-` | `-` | `-` |
| `project_member` | Identity | view, create, modify, delete | No | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `group` | Identity | view, create, modify, delete | No | `*` | `-` | `view` | `-` | `-` | `-` | `-` |
| `personal_api_key` | Credential | view, modify | No | `*` | `-` | `*` | `*` | `*` | `*` | `*` |
| `custom_api_key` | Credential | view, create, modify, delete | No | `*` | `-` | `-` | `-` | `-` | `-` | `-` |
| `service_account` | Credential | view, create, modify, delete | No | `*` | `-` | `-` | `*` | `-` | `-` | `-` |
| `org_role` | Role | view, grant | No | `*` | `-` | `view` | `-` | `-` | `-` | `-` |
| `project_role` | Role | view, grant | No | `*` across all projects | `-` | `view` across all projects | `*` in the assigned project | `view` in the assigned project | `view` in the assigned project | `view` in the assigned project |
| `project_custom_role` | Role | view, create, modify, delete, grant | No | `*` | `-` | `-` | `*` | `-` | `-` | `-` |

<Admonition type="info" icon="📘" title="说明">

- Personal API key 由个人用户拥有。每个用户都可以重置自己的 personal API key。Personal API key 权限不会通过资源权限模型独立管理。

- 项目角色访问权限受项目作用域限制。例如，Project Admin 只能在分配了 Project Admin 角色的项目中管理项目角色。

- Custom API key 在组织层级管理。

</Admonition>

## 组织资源\{#organization-resources}

组织资源控制组织范围的设置和能力。

| Resource | Description | Available privileges | Object-level grant | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Org Control Ops | Organization settings and organization-level operations | view, modify, delete | No | `*` | `-` | `-` | `-` | `-` | `-` | `-` |
| Billing & Cost | Billing, cost, payment, usage, and organization alert access | view, manage | No | `*` | `*` | `-` | `-` | `-` | `-` | `-` |
| Authentication | Organization authentication settings | view, manage | No | `*` | `-` | `-` | `-` | `-` | `-` | `-` |
| Recovery (Recycle Bin) | Organization recycle bin and recovery actions | view, manage | No | `*` | `-` | `-` | `-` | `-` | `-` | `-` |
| Project | Project provisioning | create | No | `*` | `-` | `-` | `-` | `-` | `-` | `-` |
| All project | Organization-wide project visibility | view | No | `*` | `-` | `-` | `-` | `-` | `-` | `-` |

组织资源不受项目作用域限制。仅向需要组织范围管理权限的用户或组授予这些权限。

## 项目资源\{#project-resources}

项目资源控制项目生命周期、项目能力、资源供应以及项目作用域的资源操作。

### 项目生命周期\{#project-lifecycle}

| Resource | Available privileges | Object-level grant | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Project | view, modify, delete, update_plan, update_region | Yes | `-` | `-` | `view` | `*` in the assigned project | `view` | `view` | `view` |

### 项目控制能力\{#project-control-capabilities}

| Resource | Description | Available privileges | Object-level grant | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Security | Project security configuration | view, manage | No | `-` | `-` | `-` | `*` | `view` | `view` | `view` |
| Backup | Project backup configuration and backup access | view, manage | No | `-` | `-` | `-` | `*` | `view` | `view` | `view` |
| Observability | Project monitoring, metrics, and observability access | view, manage | No | `-` | `-` | `-` | `*` | `*` | `view` | `view` |

### 资源供应\{#resource-provisioning}

资源供应权限控制谁可以创建项目资源。这些权限不是对象级授予，因为目标资源尚不存在。

| Resource | Display category | Available privileges | Object-level grant | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `serving_cluster` | Compute & storage | create | No | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `global_cluster` | Compute & storage | create | No | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `on_demand_cluster` | Compute & storage | create | No | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `volume` | Compute & storage | create | No | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `storage_integration` | Integration | create | No | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `model_provider_integration` | Integration | create | No | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `kms_integration` | Integration | create | No | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `datadog_integration` | Integration | create | No | `-` | `-` | `-` | `*` | `-` | `-` | `-` |

### 资源生命周期\{#resource-lifecycle}

资源生命周期权限控制对现有项目资源的操作。

| Resource | Display category | Available privileges | Object-level grant | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `serving_cluster` | Compute & storage | view, modify, delete, scale | Yes | `-` | `-` | `-` | `*` | `*` | `view` | `view` |
| `global_cluster` | Compute & storage | view, modify, delete, scale | Yes | `-` | `-` | `-` | `*` | `*` | `view` | `view` |
| `on_demand_cluster` | Compute & storage | view, modify, delete, scale | Yes | `-` | `-` | `-` | `*` | `*` | `view` | `view` |
| `volume` | Compute & storage | view, modify, delete, usage | Yes | `-` | `-` | `-` | `*` | `*` | `view, modify` | `view` |
| `storage_integration` | Integration | view, modify, delete, usage | Yes | `-` | `-` | `-` | `*` | `*` | `view, modify` | `view` |
| `model_provider_integration` | Integration | view, modify, delete, usage | Yes | `-` | `-` | `-` | `*` | `*` | `view, modify` | `view` |
| `kms_integration` | Integration | view, modify, delete, usage | Yes | `-` | `-` | `-` | `*` | `*` | `view, modify` | `view` |
| `datadog_integration` | Integration | view, modify, delete, usage | Yes | `-` | `-` | `-` | `*` | `*` | `-` | `-` |

## 数据资源\{#data-resources}

数据资源控制对承载数据的资源的项目级访问权限。这些权限独立于集群级 RBAC。使用项目级数据权限控制来自 Zilliz Cloud 平台的广泛访问，并使用集群角色和权限组控制集群内细粒度的数据库和 Collection 操作。

| Resource | Display category | Available privileges | Object-level grant | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `serving_cluster_data` | Compute & storage | Read, Write, * | Yes | `-` | `-` | `-` | `*` | `*` | `Read, Write` | `Read` |
| `on_demand_compute_data` | Compute & storage | Read, Write, * | Yes | `-` | `-` | `-` | `*` | `*` | `Read, Write` | `Read` |
| `volume_data` | Compute & storage | Read, Write, * | Yes | `-` | `-` | `-` | `*` | `*` | `Read, Write` | `Read` |

配置数据权限时，`Write` 表示包含 `Read`。选择 `*` 会授予 `Read` 和 `Write`。

## 对象级授予\{#object-level-grants}

某些资源支持对象级授予。对象级授予允许管理员向特定对象分配访问权限，例如特定项目资源、集群、Volume 或集成。

当访问权限应保持狭窄时，请使用对象级授予：

- 授予 Data Viewer 角色查看一个项目的访问权限。

- 授予 Data Operator 角色操作一个 Volume 或集成的访问权限。

- 授予数据角色读取或写入一个数据资源的访问权限，而不是项目中的所有数据资源。

不支持对象级授予的资源在更广泛的组织或项目作用域中管理。