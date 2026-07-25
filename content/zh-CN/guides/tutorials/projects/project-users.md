---
title: "管理项目用户 | Cloud"
slug: /project-users
sidebar_key: project-users
sidebar_label: "管理项目用户"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 中，您可以邀请用户加入项目并根据他们的工作职能分配角色。这些角色决定了用户对项目的访问权限以及他们可以执行的操作。 | Cloud"
type: origin
token: GZriwpM0Gi7fcukuo8xc736VnBh
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 项目
  - 项目管理
  - 管理项目用户
  - 项目管理员
  - 项目协作者

---

import Admonition from '@theme/Admonition';


# 管理项目用户

在 Zilliz Cloud 中，您可以邀请用户加入项目并根据他们的工作职能分配角色。这些角色决定了用户对项目的访问权限以及他们可以执行的操作。

本文将介绍如何管理项目用户。

## 邀请用户加入项目\{#invite-a-user-to-a-project}

要邀请用户加入项目，您必须是**组织管理员**或**项目管理员**。 

以下为邀请步骤：

1. 输入待邀请用户的邮箱地址。

1. 选择访问权限的分配方式：             

    - [项目管理员](./project-users#project-admin) — 授予对该项目及其所有资源的完全控制权限。

    - 自定义[项目访问策略](./project-users#project-access) — 为用户配置项目内的特定操作权限。

被邀请的用户将通过电子邮件收到邀请，并必须在 48 小时内接受邀请以加入项目。或者，您也可以直接从 Web 控制台复制邀请链接并分享给被邀请人。

一旦用户加入项目，该用户自动成为项目所属组织的组织成员。

<Admonition type="info" icon="📘" title="说明">

每次您可以以相同角色邀请一个或多个用户加入项目。

</Admonition>

### 项目管理员\{#project-admin}

具备管理项目及其所有资源（集群、Database、Collection）的全部权限。

### 设置项目访问策略\{#project-access}

为了在访问授权中遵循最小授权策略，您可以为受邀用户配置细粒度的集群和 Volume 访问策略。

![VGYtwk6XRhzoWjbESh7cQtlQnyb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/VGYtwk6XRhzoWjbESh7cQtlQnyb.png)

- 集群访问

    默认情况下，受邀用户会被授予**所有集群**的访问权限，并开启**包含后续创建的所有集群**选项。您可以针对上述设置为受邀用户分配角色，如**读写**，以便赋予该用户在所有集群中的访问权限。当接受该邀请后，用户即可在指定项目中获得您设置的权限。

    为了方便您进行访问控制，您也可以从下拉列表中选择具体的集群来限制受邀用户的访问范围。同时，您还可以关闭**包含后续创建的所有集群**选项来禁止受邀用户获取该项目中新建集群的访问权限。

    您还可以单击 **+ 集群访问**来添加多条集群访问策略。

- Volume 访问

    默认情况下，受邀用户会被授予**所有 Volume** 的访问权限，并开启**包含后续创建的所有Volume** 选项。您可以针对上述设置为受邀用户分配角色，如**读写**，以便赋予该用户在所有 Volume 中的访问权限。当接受该邀请后，用户即可在指定项目中获得您设置的权限。

    为了方便您进行访问控制，您也可以从下拉列表中选择具体的 Volume 来限制受邀用户的访问范围。同时，您还可以关闭**包含后续创建的所有 Volume** 选项来禁止受邀用户获取该项目中新建 Volume 的访问权限。

    您还可以单击 **+ Volume 访问**来添加多条 Volume 访问策略。

关于**读写、只读**和**集群管理员**角色的更多内容，可以阅读以下章节的内容。

#### 读写\{#read-write}

具备查看项目和管理其资源（集群、Database库、Collection）的权限。

#### 只读\{#read-only}

具备查看项目及其资源（集群、Database、Collection）的权限。

#### 集群管理员\{#cluster-admin}

具备查看项目和管理其资源（集群、Database库、Collection）的权限。

相比项目读写角色，集群管理员额外具备集群运维操作权限，例如集群扩缩容、暂停和恢复集群。

### 项目角色与访问策略权限比较\{#project-role-and-access-comparison}

下表对比了不同项目角色的权限差异。

**集群操作**

<table>
   <tr>
     <th><p><strong>操作</strong></p></th>
     <th><p><strong>项目管理员</strong></p></th>
     <th><p><strong>集群管理员</strong></p></th>
     <th><p><strong>项目读写</strong></p></th>
     <th><p><strong>项目只读</strong></p></th>
   </tr>
   <tr>
     <td><p>创建集群</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>删除集群</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>集群 Query CU 扩缩容</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>集群 Replica 扩缩容</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>挂起集群</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>恢复运行集群</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>查看集群列表</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>查看集群详情</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>查看集群指标</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

**集群用户**

<table>
   <tr>
     <th><p><strong>操作</strong></p></th>
     <th><p><strong>项目管理员</strong></p></th>
     <th><p><strong>集群管理员</strong></p></th>
     <th><p><strong>项目读写</strong></p></th>
     <th><p><strong>项目只读</strong></p></th>
   </tr>
   <tr>
     <td><p>查看用户列表</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>创建用户</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>重置用户密码</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>删除用户</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**审计日志**

<table>
   <tr>
     <th><p><strong>操作</strong></p></th>
     <th><p><strong>项目管理员</strong></p></th>
     <th><p><strong>集群管理员</strong></p></th>
     <th><p><strong>项目读写</strong></p></th>
     <th><p><strong>项目只读</strong></p></th>
   </tr>
   <tr>
     <td><p>启用审计日志</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>修改审计日志配置</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>关闭审计日志</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>查看审计日志流状态</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

**数据面操作**

<table>
   <tr>
     <th><p><strong>操作</strong></p></th>
     <th><p><strong>项目管理员</strong></p></th>
     <th><p><strong>集群管理员</strong></p></th>
     <th><p><strong>项目读写</strong></p></th>
     <th><p><strong>项目只读</strong></p></th>
   </tr>
   <tr>
     <td><p>床架 Collection</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Drop Collection</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>List/Describe Collection</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Insert/Upsert</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Delete</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Query/Search/Get</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Bulk Import</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>所有其他 RESTful 操作</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>按操作区分</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="说明">

集群管理员与项目读写角色的数据面权限相同。       

</Admonition>

**备份恢复**

<table>
   <tr>
     <th><p><strong>操作</strong></p></th>
     <th><p><strong>项目管理员</strong></p></th>
     <th><p><strong>集群管理员</strong></p></th>
     <th><p><strong>项目读写</strong></p></th>
     <th><p><strong>项目只读</strong></p></th>
   </tr>
   <tr>
     <td><p>查看备份列表</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>创建集群备份</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>恢复到新集群</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Collection恢复到当前集群</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>删除集群备份</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**Volume**

<table>
   <tr>
     <th><p><strong>操作</strong></p></th>
     <th><p><strong>项目管理员</strong></p></th>
     <th><p><strong>集群管理员</strong></p></th>
     <th><p><strong>项目读写</strong></p></th>
     <th><p><strong>项目只读</strong></p></th>
   </tr>
   <tr>
     <td><p>查看 Volume 列表</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>创建 Volume</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>删除 Volume</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**迁移**

<table>
   <tr>
     <th><p><strong>操作</strong></p></th>
     <th><p><strong>项目管理员</strong></p></th>
     <th><p><strong>集群管理员</strong></p></th>
     <th><p><strong>项目读写</strong></p></th>
     <th><p><strong>项目只读</strong></p></th>
   </tr>
   <tr>
     <td><p>查看迁移列表</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>创建迁移任务</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>停止迁移任务</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>查看迁移任务详情（查看已迁移Collection/Database）</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

**任务中心**

<table>
   <tr>
     <th><p><strong>操作</strong></p></th>
     <th><p><strong>项目管理员</strong></p></th>
     <th><p><strong>集群管理员</strong></p></th>
     <th><p><strong>项目读写</strong></p></th>
     <th><p><strong>项目只读</strong></p></th>
   </tr>
   <tr>
     <td><p>查看任务列表</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>查看任务详情</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>取消任务</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>重试任务</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**项目告警**

<table>
   <tr>
     <th><p><strong>操作</strong></p></th>
     <th><p><strong>项目管理员</strong></p></th>
     <th><p><strong>集群管理员</strong></p></th>
     <th><p><strong>项目读写</strong></p></th>
     <th><p><strong>项目只读</strong></p></th>
   </tr>
   <tr>
     <td><p>查看告警列表</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>创建告警</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>编辑告警</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>删除告警</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>查看告警历史</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

**项目成员**

<table>
   <tr>
     <th><p><strong>操作</strong></p></th>
     <th><p><strong>项目管理员</strong></p></th>
     <th><p><strong>集群管理员</strong></p></th>
     <th><p><strong>项目读写</strong></p></th>
     <th><p><strong>项目只读</strong></p></th>
   </tr>
   <tr>
     <td><p>邀请项目成员</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>编辑成员权限</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>移除项目成员</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**集群 IP 白名单**

<table>
   <tr>
     <th><p><strong>操作</strong></p></th>
     <th><p><strong>项目管理员</strong></p></th>
     <th><p><strong>集群管理员</strong></p></th>
     <th><p><strong>项目读写</strong></p></th>
     <th><p><strong>项目只读</strong></p></th>
   </tr>
   <tr>
     <td><p>查看 IP 白名单</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>创建 IP 白名单</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>修改 IP 白名单</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>删除 IP 白名单</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**Private endpoints**

<table>
   <tr>
     <th><p><strong>操作</strong></p></th>
     <th><p><strong>项目管理员</strong></p></th>
     <th><p><strong>集群管理员</strong></p></th>
     <th><p><strong>项目读写</strong></p></th>
     <th><p><strong>项目只读</strong></p></th>
   </tr>
   <tr>
     <td><p>查看 Private Endpoint 列表</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>创建 Private Endpoint</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>删除 Private Endpoint</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**CMEK**

<table>
   <tr>
     <th><p><strong>操作</strong></p></th>
     <th><p><strong>项目管理员</strong></p></th>
     <th><p><strong>集群管理员</strong></p></th>
     <th><p><strong>项目读写</strong></p></th>
     <th><p><strong>项目只读</strong></p></th>
   </tr>
   <tr>
     <td><p>查看 CMEK 列表</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>添加 CMEK</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>删除 CMEK</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**集成中心**

<table>
   <tr>
     <th><p><strong>操作</strong></p></th>
     <th><p><strong>项目管理员</strong></p></th>
     <th><p><strong>集群管理员</strong></p></th>
     <th><p><strong>项目读写</strong></p></th>
     <th><p><strong>项目只读</strong></p></th>
   </tr>
   <tr>
     <td><p>查看集成列表</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>查看 Datadog 集成</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>创建 Datadog 集成</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>更新 Datadog 集成</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>删除 Datadog 集成</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>查看存储集成列表</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>创建存储集成</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>删除存储集成</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

## 撤销或重发邀请\{#revoke-or-resend-an-invitation}

当您邀请现有组织成员加入同一组织内的项目时，他们会自动获得对项目的访问权限，无需接收单独的邀请。但如果您邀请用户加入他们还未加入的组织的项目，他们将会收到加入该组织的邀请，并会获得项目内指定项目的访问权限。

![DAeswlJ7nhBhg3bTpfAcIYmxnZg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/DAeswlJ7nhBhg3bTpfAcIYmxnZg.png)

要撤销或重发邀请，你必须是[组织管理员](./organization-users)或[项目管理员](./project-users)。

<Admonition type="info" icon="📘" title="说明">

在用户接受邀请之前，您可以选择撤销或重发邀请。

</Admonition>

## 编辑成员角色\{#edit-a-collaborators-role}

当用户接受邀请后，他们将成为项目成员。之后，您可以根据需求编辑他们的角色或从项目中移除他们。

要编辑成员角色，你必须是[组织管理员](./organization-users)或[项目管理员](./project-users)。

![BcHTwLFTdhfMczbMIE7cxGE8nPb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/BcHTwLFTdhfMczbMIE7cxGE8nPb.png)

## 移除项目成员\{#remove-a-collaborator}

要移除项目成员，你必须是[组织管理员](./organization-users)或[项目管理员](./project-users)。

![EZOkwcdgyhqJmEbDTkQcDRRfnWc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/EZOkwcdgyhqJmEbDTkQcDRRfnWc.png)

## 离开项目\{#leave-a-project}

当您不再属于某个项目时，您可以选择离开项目。

![WDWiwK9ukhvcIvbcVQHcExNknWe](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/WDWiwK9ukhvcIvbcVQHcExNknWe.png)

注意，如果您是项目的唯一管理员，您将无法离开该项目，因为每个项目必须始终至少有一个项目管理员。

<Admonition type="caution" icon="🚧" title="警告">

一旦您离开项目，您对该项目及其相关资源的访问权限将被取消。

</Admonition>

