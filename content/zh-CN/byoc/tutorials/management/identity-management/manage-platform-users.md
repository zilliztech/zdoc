---
title: "管理平台用户 | BYOC"
slug: /manage-platform-users
sidebar_label: "管理平台用户"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本指南介绍 Zilliz Cloud 中的两类平台用户：组织用户和项目用户，并说明如何管理它们。 | BYOC"
type: origin
token: MFCMwKsYVi5VLUkag4HcC0yGnZd
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 管理平台用户

本指南介绍 Zilliz Cloud 中的两类平台用户：组织用户和项目用户，并说明如何管理它们。

## 组织用户\{#organization-users}

组织用户是 Zilliz Cloud 组织的成员。他们可以登录控制台，并可根据其职责被分配组织角色、项目访问权限或其他权限。

<Admonition type="info" icon="📘" title="说明">

要管理组织用户，您必须拥有包含成员和角色管理权限的组织角色，例如 Organization Owner 或等效的自定义组织角色。

</Admonition>

### 邀请组织用户\{#invite-organization-users}

<Admonition type="info" icon="📘" title="📘 说明">

每个组织最多可拥有 100 个用户。

</Admonition>

下图演示了如何邀请组织用户。

![ZOqww5ojMhZPkHbKrRtcPA6dn1g](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/ZOqww5ojMhZPkHbKrRtcPA6dn1g.png)

<Procedures>

1. 在 Zilliz Cloud 控制台中，导航到目标组织。

1. 进入 **Access Control**。

1. 切换到 **Members** 选项卡。

1. 单击 **Invite Member**。

1. 输入以下信息：

    - Email address(es)：您可以输入一个或多个电子邮件地址。

    - Organization role：选择适当的组织角色。下表说明了预定义的组织角色。

        | 角色 | 适用场景 | 说明 |
        | --- | --- | --- |
        | Public | 用户只需要基础登录访问权限，之后再授予其他访问权限。 | 自动授予每个组织成员。它不能单独移除。 |
        | Organization Owner | 用户管理组织设置、成员、角色、项目、安全和账单。 | 仅授予可信管理员。 |
        | Billing Admin | 用户管理账单和订阅。 | 面向不需要广泛技术访问权限的财务和采购用户。 |

    - （可选）Project access：通过选择一个项目和一个或多个项目角色来设置项目访问权限。

1. 单击 **Invite**。

</Procedures>

邀请接收者将收到一封电子邮件邀请，必须在 48 小时内接受邀请才能加入组织。或者，您也可以从 Web 控制台复制邀请链接并分享给被邀请者。

### 撤销或重新发送邀请\{#revoke-or-resend-an-invitation}

邀请用户加入组织后，Zilliz Cloud 会向该用户发送邀请邮件。在用户接受邀请之前，您可以撤销或重新发送邀请。

下图演示了如何撤销或重新发送邀请。

![FhvKwsorxhyQgxboTWmcHwBjnIb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/FhvKwsorxhyQgxboTWmcHwBjnIb.png)

<Procedures>

1. 单击 **Access Control**。

1. 切换到 **Members** 选项卡。

1. 找到待处理的邀请，并在 **Actions** 中单击 **...**。

1. 单击 **Resend Invitation** 或 **Revoke Invitation**。

</Procedures>

### 编辑组织用户的角色\{#edit-the-roles-of-organization-users}

用户加入组织后，您可以更新该用户的组织角色和项目访问权限。一个用户可以拥有多个组织角色和多个项目角色分配。最终权限是所有直接角色分配和基于组的角色分配的并集。

下图演示了如何编辑组织用户的角色。

<Procedures>

1. 单击 **Access Control**。

1. 切换到 **Members** 选项卡。

1. 找到目标成员，并在 **Actions** 中单击笔形图标（**Edit Role**）。

1. 更新组织角色和项目访问权限。

1. 单击 Save。

</Procedures>

### 查看组织用户详情\{#view-organization-user-details}

使用成员详情面板查看成员的状态、组织角色、项目访问权限、加入时间、上次登录时间以及其他详情。

当检查用户为什么可以访问某个项目，或为什么无法执行某项操作时，这会很有用。

### 移除组织用户\{#remove-organization-users}

当用户不应再属于组织时，将其移除。移除组织用户会移除组织成员身份以及该组织中的直接角色分配。

<Admonition type="info" icon="📘" title="说明">

移除成员后，对应的个人 API Key 将立即被撤销，访问将被拒绝。为避免服务中断，请确保在移除之前替换环境中使用的任何个人 Key。此操作无法撤销。

</Admonition>

下图演示了如何移除组织用户。

![Ray5wT20yhFfGxbZPNfcTM7AnTe](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Ray5wT20yhFfGxbZPNfcTM7AnTe.png)

<Procedures>

1. 单击 **Access Control**。

1. 切换到 **Members** 选项卡。

1. 找到目标用户，并在 **Actions** 中单击 **...**。

1. 单击 **Remove**。

1. 确认移除。

</Procedures>

### 离开组织\{#leave-an-organization}

当用户不再需要访问权限时，可以离开组织。每个组织必须至少保留一名 Organization Owner。如果您是唯一的 Organization Owner，请在离开前分配另一名 Organization Owner。

<Admonition type="info" icon="📘" title="说明">

离开组织后，除非另一位管理员再次邀请您，否则您无法再访问该组织及其资源。

</Admonition>

您可以通过以下任一方式离开组织：

- 在组织列表页面离开组织：

    ![CbUSwvhhnhppg8bx9NrckHsRnWg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/CbUSwvhhnhppg8bx9NrckHsRnWg.png)

    <Procedures>

    1. 找到一个组织。

    1. 单击组织卡片右下角的 **...**。

    1. 单击 **Leave**。

    </Procedures>

- 进入组织，并在 **Organization Members** 页面离开组织：

    <Procedures>

    1. 单击 **Access Control**。

    1. 切换到 **Members** 选项卡。

    1. 找到您自己，并在 **Actions** 中单击 **...**。

    1. 单击 **Leave**。

    1. 确认操作。

    </Procedures>

## 项目用户\{#project-users}

项目用户也称为项目协作者，是有权访问特定项目的用户或组。使用项目用户授予项目资源访问权限，而无需授予广泛的组织级权限。

<Admonition type="info" icon="📘" title="说明">

项目访问权限是显式的。项目角色分配必须指向特定项目。Zilliz Cloud 不支持为所有当前和未来项目设置跨项目通配符分配。

</Admonition>

下表说明了项目用户管理的相关概念。

| 概念 | 说明 |
| --- | --- |
| 项目协作者 | 被授予特定项目访问权限的用户或组。 |
| 项目角色 | 控制协作者在项目中可以执行哪些操作的角色。 |
| 直接分配 | 在项目中直接分配给用户的角色。 |
| 组分配 | 分配给组的角色。组中的用户继承该角色权限。 |
| 有效访问权限 | 直接项目角色和基于组的项目角色的并集。 |

### 邀请项目用户\{#invite-project-users}

要授予项目访问权限，请邀请用户或组作为项目协作者，并分配一个或多个项目角色。

下图演示了如何邀请项目用户。

![CRJkwarZNhktaKbVmClcUbsdnPc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/CRJkwarZNhktaKbVmClcUbsdnPc.png)

<Procedures>

1. 在 Zilliz Cloud 控制台中，打开目标项目。

1. 进入 **Access Control**。

1. 切换到 **Members** 选项卡。

1. 单击 **Invite Collaborator**。

1. 输入用户电子邮件地址，或选择要邀请的用户。

1. 选择一个或多个项目角色。下表说明了项目角色。

    | 角色 | 最适合 | 典型访问权限 |
    | --- | --- | --- |
    | Project Admin | 项目所有者和平台管理员。 | 完整的项目管理，包括协作者、角色、集群生命周期、计算和数据访问。 |
    | Data Admin | 数据库管理员和平台工程师。 | 不包含资源供应权限的完整项目数据管理。 |
    | Data Operator | 数据工程师和应用程序操作人员。 | 读写数据操作，不包含完整项目管理。 |
    | Data Viewer | 分析师、开发者和只读应用程序。 | 读取、查询和检查资源，不包含写入权限。 |
    | Custom project role | 需要最小权限项目访问的团队。 | 取决于角色中配置的权限集。 |

1. 单击 **Invite**。

</Procedures>

<Admonition type="info" icon="📘" title="说明">

如果您邀请用户加入项目，而该用户还不是组织成员，则该用户在接受邀请后会成为组织成员。

</Admonition>

### 编辑项目用户的角色\{#edit-the-roles-of-project-users}

当协作者的职责发生变化时，编辑项目访问权限。例如，您可以将用户从 Data Viewer 更改为 Data Operator。

下图演示了如何编辑项目用户的角色。

<Procedures>

1. 进入 **Access Control**。

1. 切换到 **Members** 选项卡。

1. 找到目标成员，并在 **Actions** 中单击笔形图标（**Edit Role**）。

1. 更新已分配的项目角色。

1. 单击 **Save**。

</Procedures>

### 移除项目用户\{#remove-project-users}

当身份不再需要访问项目时，移除项目用户或组。移除项目访问权限不会将用户从组织中移除。

下图演示了如何移除项目用户。

![SlvVwhTKphCKBtb73OpcMhZJnEb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/SlvVwhTKphCKBtb73OpcMhZJnEb.png)

<Procedures>

1. 单击 **Access Control**。

1. 切换到 **Members** 选项卡。

1. 找到目标用户，并在 **Actions** 中单击 **...**。

1. 单击 **Remove**。

1. 确认移除。

</Procedures>

### 离开项目\{#leave-a-project}

当用户不再需要访问权限时，可以离开项目。每个项目必须至少保留一名 Project Admin。如果您是唯一的 Project Admin，请在离开前分配另一名 Project Admin。

<Admonition type="info" icon="📘" title="说明">

离开项目后，除非另一位管理员再次邀请您，否则您无法再访问该项目及其资源。

</Admonition>

下图演示了如何离开项目。

![V6iFwWTdihJrBpbnmPycLYZanhb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/V6iFwWTdihJrBpbnmPycLYZanhb.png)

<Procedures>

1. 单击 **Access Control**。

1. 切换到 **Members** 选项卡。

1. 找到您自己，并在 **Actions** 中单击 **...**。

1. 单击 **Leave**。

1. 确认操作。

</Procedures>