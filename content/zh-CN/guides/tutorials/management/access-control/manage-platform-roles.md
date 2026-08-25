---
title: "管理平台角色 | Cloud"
slug: /manage-platform-roles
sidebar_label: "管理平台角色"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本指南介绍 Zilliz Cloud 中的两类平台角色：组织角色和项目角色，并说明如何管理它们。 | Cloud"
type: origin
token: MNqIwPF2diSEbtkWO0TcoRGRn3i
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 管理平台角色

本指南介绍 Zilliz Cloud 中的两类平台角色：组织角色和项目角色，并说明如何管理它们。

## 管理组织角色\{#manage-organization-roles}

组织角色控制组织级访问权限。使用组织角色管理成员、组、组织设置、账单和订阅、安全设置、组织告警、平台审计日志可见性、API Key、项目管理以及回收站操作的权限。

<Admonition type="info" icon="📘" title="说明">

组织角色仅适用于组织级资源。它们不定义集群、数据库或 Collection 权限。

</Admonition>

### 预定义组织角色\{#predefined-organization-roles}

下表说明了 3 个预定义组织角色。

| 角色 | 描述 | 是否可编辑？ |
| --- | --- | --- |
| Organization Owner | 完整的组织级管理权限，包括访问控制、设置、账单、安全、API 密钥和项目角色分配。 | 否 |
| Billing Admin | 管理账单和订阅，并对相关组织和项目上下文具有只读访问权限。 | 否 |
| Public | 自动授予每个组织成员的基础仅登录角色。 | 否 |

## 管理项目角色\{#manage-project-roles}

项目角色控制特定项目内的访问权限。使用项目角色管理项目成员、集群生命周期操作、按需计算访问、集成、备份、迁移、告警、Volume 以及项目作用域的数据访问。

<Admonition type="info" icon="📘" title="说明">

项目角色属于特定项目。分配项目角色时，该分配仅适用于所选项目。

</Admonition>

### 预定义项目角色\{#predefined-project-roles}

下表说明了 4 个预定义项目角色。

| 角色 | 最适合 | 典型权限 |
| --- | --- | --- |
| Project Admin | 项目所有者和平台管理员。 | 完整的项目管理，包括协作者、角色、集群生命周期、计算和数据访问。 |
| Cluster Admin | 数据库管理员和平台工程师。 | 集群管理，例如 scaling、备份、集群操作和数据访问。 |
| Data Operator | 应用团队和数据工程师。 | 读写数据操作，包含有限的项目管理。 |
| Data Viewer | 分析师、开发者和只读应用程序。 | 用于查看、查询和搜索工作流的只读访问。 |

### 自定义项目角色\{#custom-project-roles}

当预定义角色不符合团队职责时，创建自定义项目角色。自定义项目角色可以在项目内组合平台权限、计算权限和数据访问权限。

#### 创建自定义项目角色\{#create-a-custom-project-role}

<Procedures>

1. 打开目标项目。

1. 进入 **Access Contro**l。

1. 打开 **Project Roles** 选项卡。

1. 单击 **+ Project Role**。

    ![XlzRw8sT2hOGegb7yH6chnT0n2d](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/XlzRw8sT2hOGegb7yH6chnT0n2d.png)

1. 选择创建自定义角色的方式，然后单击 **Next**。

    - **Start from scratch**：创建完全自定义角色，以获得最大灵活性。

    - **Select an existing project role as a template**：使用预定义角色作为起点，并微调其权限，以提高效率。

    ![IYPObE7Dpox6Oqxxy0wcyrGWnFc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/iypobe7dpox6oqxxy0wcyrgwnfc.png "IYPObE7Dpox6Oqxxy0wcyrGWnFc")

1. 输入自定义角色名称和描述。

    ![R0mOwkmdqhLgtUb1MZ5ckIyFn8f](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/R0mOwkmdqhLgtUb1MZ5ckIyFn8f.png)

1. 配置角色访问权限并单击 **Create**。有关可添加到自定义项目角色的完整权限列表，请参见 [平台资源权限](./platform-privileges)。

    ![EnKXbUCzZosA6RxDRfRcwJMTnSb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/enkxbuczzosa6rxdrfrcwjmtnsb.png "EnKXbUCzZosA6RxDRfRcwJMTnSb")

</Procedures>

#### 编辑自定义项目角色\{#edit-a-custom-project-role}

当权限集需要变更时，编辑自定义项目角色。变更会应用于所有被授予该角色的用户、组或自定义 API Key。

<Procedures>

1. 打开目标项目。

1. 进入 **Access Contro**l。

1. 打开 **Project Roles** 选项卡。

1. 找到目标自定义角色，并从 **Actions** 菜单中选择 **Edit**。

    ![Ag7HwJhXmhNDIYbtwctcPFPsnDh](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Ag7HwJhXmhNDIYbtwctcPFPsnDh.png)

1. 更新角色详情或权限，然后单击 **Save**。

    ![Mdf0bUacuoAiMLxsxA6cSoB1nWe](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/mdf0buacuoaimlxsxa6csob1nwe.png "Mdf0bUacuoAiMLxsxA6cSoB1nWe")

</Procedures>

#### 删除自定义项目角色\{#delete-a-custom-project-role}

<Admonition type="info" icon="📘" title="说明">

您不能删除仍分配给用户或 API 密钥的项目角色。请先移除现有分配，再删除角色。

</Admonition>

![HMhTwhaFMhPY9JbM3wKcr3OYn4c](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/HMhTwhaFMhPY9JbM3wKcr3OYn4c.png)

<Procedures>

1. 打开目标项目。

1. 进入 **Access Contro**l。

1. 打开 **Project Roles** 选项卡。

1. 找到目标自定义角色，并从 **Actions** 菜单中选择 **Delete**。

1. 确认删除。

</Procedures>