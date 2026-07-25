---
title: "管理项目用户 | BYOC"
slug: /project-users
sidebar_label: "管理项目用户"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 中，您可以邀请用户加入项目并根据他们的工作职能分配角色。这些角色决定了用户对项目的访问权限以及他们可以执行的操作。 | BYOC"
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

邀请用户加入项目时，您需要为用户授予一个角色，该角色定义了用户在该项目内执行特定操作的权限。 

要邀请用户，输入用户的电子邮件地址，然后选择授予的项目角色。

### 项目角色\{#project-roles}

Zilliz Cloud 提供 3 种项目角色。这些角色无法修改或删除。

- **项目管理员**：具备管理项目及其所有资源（集群、Database、Collection）的全部权限。

    下表罗列了该项目角色具备的界面和 API 操作权限。

    <table>
       <tr>
         <th><p><strong>界面操作权限</strong></p></th>
         <th><p><strong>控制面 RESTful API (V2) 权限</strong></p></th>
         <th><p><strong>数据面 RESTful API (V2) 权限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>管理 <a href="./collection">Collection</a> 和 <a href="./manage-indexes">Index</a></p></li><li><p><a href="./project-users">管理项目用户</a></p></li><li><p>管理 <a href="./setup-whitelist">IP 白名单</a>和 <a href="./setup-a-private-link">Private Endpoint</a></p></li><li><p><a href="./manage-project-alerts">管理项目告警</a></p></li><li><p>管理<a href="./backup-and-restore">备份</a></p></li><li><p>管理<a href="./migrations">数据迁移</a></p></li><li><p><a href="./job-center">管理项目任务</a></p></li><li><p>管理集成</p></li><li><p>以及所有<a href="./cluster-roles">集群 Admin</a> 权限</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">所有 Cloud Meta 操作</a></p></li><li><p><a href="/reference/restful/cluster-operations-v2">所有 Cluster 操作</a></p></li><li><p><a href="/reference/restful/volume-operations-v2">所有 Volume 操作</a></p></li><li><p><a href="/reference/restful/import-operations-v2">所有 Import 操作</a></p></li><li><p><a href="/reference/restful/backup-and-restore-v2">所有 Backup & Restore 操作</a></p></li><li><p><a href="/reference/restful/cloud-migration-v2">所有 Cloud Migration 操作</a></p></li><li><p><a href="/reference/restful/cloud-job-v2">所有 Cloud Job 操作</a></p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">所有 Collection 操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">所有 Index 操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">所有 Partition 操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">所有 Vector 操作</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">所有 Alias 操作</a></p></li><li><p><a href="/reference/restful/role-operations-v2">所有 Role 操作</a></p></li><li><p><a href="/reference/restful/user-operations-v2">所有 User 操作</a></p></li></ul></td>
       </tr>
    </table>

- **项目编辑者（Read-Write）**：具备查看项目和管理其资源（集群、Database库、Collection）的权限。

    下表罗列了该项目角色具备的界面和 API 操作权限。

    <table>
       <tr>
         <th><p><strong>界面操作权限</strong></p></th>
         <th><p><strong>控制面 RESTful API (V2) 权限</strong></p></th>
         <th><p><strong>数据面 RESTful API (V2) 权限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>管理 <a href="./collection">Collection</a> 和 <a href="./manage-indexes">Index</a></p></li><li><p>查看<a href="./backup-and-restore">备份</a>但无法创建或恢复备份</p></li><li><p>查看<a href="./job-center">项目任务</a>单无法取消任务或重试失败任务</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">所有 Cloud Meta 操作</a></p></li><li><p>部分 Cluster 操作</p><ul><li><p><a href="/reference/restful/list-projects-v2">查看项目列表</a></p></li><li><p><a href="/reference/restful/list-clusters-v2">查看集群列表</a></p></li><li><p><a href="/reference/restful/describe-cluster-v2">查看集群详情</a></p></li><li><p><a href="/reference/restful/query-cluster-metrics-v2">查询集群指标</a></p></li><li><p><a href="/docs/prometheus-monitoring">导出集群指标</a></p></li></ul></li><li><p>部分 Volume 操作</p><ul><li><a href="/reference/restful/list-volumes-v2">查看 Volume 列表</a></li></ul></li><li><p><a href="/reference/restful/import-operations-v2">所有 Import 操作</a></p></li><li><p>部分 Backup & Restore 操作</p><ul><li><p><a href="/reference/restful/list-backups-v2">查看备份列表</a></p></li><li><p><a href="/reference/restful/describe-backup-v2">查看备份详情</a></p></li><li><p><a href="/reference/restful/get-backup-policy-v2">获取备份策略</a></p></li></ul></li><li><p><a href="/reference/restful/cloud-job-v2">所有 Cloud Job 操作</a></p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">所有 Collection 操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">所有 Index 操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">所有 Partition 操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">所有 Vector 操作</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">所有 Alias 操作</a></p></li></ul></td>
       </tr>
    </table>

- **项目查看者（Read-Only**）：具备查看项目及其资源（集群、Database、Collection）的权限。

    下表罗列了该项目角色具备的界面和 API 操作权限。

    <table>
       <tr>
         <th><p><strong>界面操作权限</strong></p></th>
         <th><p><strong>控制面 RESTful API (V2) 权限</strong></p></th>
         <th><p><strong>数据面 RESTful API (V2) 权限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>查看 <a href="./collection">Collection</a> 和 <a href="./manage-indexes">Index</a></p></li><li><p>查看<a href="./backup-and-restore">备份</a>但无法创建或恢复备份</p></li><li><p>查看<a href="./job-center">项目任务</a>单无法取消任务或重试失败任务</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">所有 Cloud Meta 操作</a></p></li><li><p>部分 Cluster 操作</p><ul><li><p><a href="/reference/restful/list-projects-v2">查看项目列表</a></p></li><li><p><a href="/reference/restful/list-clusters-v2">查看集群列表</a></p></li><li><p><a href="/reference/restful/describe-cluster-v2">查看集群详情</a></p></li><li><p><a href="/reference/restful/query-cluster-metrics-v2">查询集群指标</a></p></li><li><p><a href="/docs/prometheus-monitoring">导出集群指标</a></p></li></ul></li><li><p>部分 Volume 操作</p><ul><li><a href="/reference/restful/list-volumes-v2">查看 Volume 列表</a></li></ul></li><li><p>部分 Import 操作</p><ul><li><p><a href="/reference/restful/get-import-job-progress-v2">查看导入任务进度</a></p></li><li><p><a href="/reference/restful/list-import-jobs-v2">查看导入任务列表</a></p></li></ul></li><li><p>部分 Backup & Restore 操作</p><ul><li><p><a href="/reference/restful/list-backups-v2">查看备份列表</a></p></li><li><p><a href="/reference/restful/describe-backup-v2">查看备份详情</a></p></li><li><p><a href="/reference/restful/get-backup-policy-v2">获取备份策略</a></p></li></ul></li><li><p><a href="/reference/restful/cloud-job-v2">所有 Cloud Job 操作</a></p></li></ul></td>
         <td><ul><li><p>部分 Collection 操作</p><ul><li><p><a href="/reference/restful/describe-collection-v2">查看 Collection 详情</a></p></li><li><p><a href="/reference/restful/get-collection-load-state-v2">查看 Collection 加载状态</a></p></li><li><p><a href="/reference/restful/get-collection-stats-v2">查看 Collection 统计信息</a></p></li><li><p><a href="/reference/restful/has-collection-v2">查看 Collection 是否存在</a></p></li><li><p><a href="/reference/restful/list-collections-v2">查看 Collection 列表</a></p></li></ul></li><li><p>部分 Index 操作</p><ul><li><p><a href="/reference/restful/describe-index-v2">查看索引详情</a></p></li><li><p><a href="/reference/restful/list-indexes-v2">查看索引列表</a></p></li></ul></li><li><p>部分 Partition 操作</p><ul><li><p><a href="/reference/restful/get-partition-statistics-v2">查看 Partition 统计信息</a></p></li><li><p><a href="/reference/restful/has-partition-v2">查看 Partition 是否存在</a></p></li><li><p><a href="/reference/restful/list-partitions-v2">查看 Partition 列表</a></p></li></ul></li><li><p>部分 Alias 操作</p><ul><li><p><a href="/reference/restful/describe-alias-v2">查看 Alias 详情</a></p></li><li><p><a href="/reference/restful/list-aliases-v2">查看 Alias 列表</a></p></li></ul></li><li><p>部分 Vector 操作</p><ul><li><p><a href="/reference/restful/get-v2">获取 Entity</a></p></li><li><p><a href="/reference/restful/hybrid-search-v2">Hybrid Search</a></p></li><li><p><a href="/reference/restful/query-v2">查询</a></p></li><li><p><a href="/reference/restful/search-v2">搜索</a></p></li></ul></li></ul></td>
       </tr>
    </table>

被邀请的用户将通过电子邮件收到邀请，并必须在 48 小时内接受邀请以加入项目。或者，您也可以直接从 Web 控制台复制邀请链接并分享给被邀请人。

一旦用户加入项目，该用户自动成为项目所属组织的组织成员。

<Admonition type="info" icon="📘" title="说明">

<p>每次您可以以相同角色邀请一个或多个用户加入项目。</p>

</Admonition>

![invite-user-to-project-zh](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/invite-user-to-project-zh.png "invite-user-to-project-zh")

## 撤销或重发邀请\{#revoke-or-resend-an-invitation}

当您邀请现有组织成员加入同一组织内的项目时，他们会自动获得对项目的访问权限，无需接收单独的邀请。但如果您邀请用户加入他们还未加入的组织的项目，他们将会收到加入该组织的邀请，并会获得项目内指定项目的访问权限。
要撤销或重发邀请，你必须是[组织管理员](./organization-users#organization-roles)或[项目管理员](./project-users#project-roles)。

<Admonition type="info" icon="📘" title="说明">

<p>在用户接受邀请之前，您可以选择撤销或重发邀请。</p>

</Admonition>

![revoke-or-resend-project-invitation-zh](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/revoke-or-resend-project-invitation-zh.png "revoke-or-resend-project-invitation-zh")

## 编辑成员角色或移出成员\{#edit-a-collaborators-role-or-remove-a-collaborator}

当用户接受邀请后，他们将成为项目成员。之后，您可以根据需求编辑他们的角色或从项目中移出他们。

要编辑成员角色或移出项目成员，你必须是[组织管理员](./organization-users#organization-roles)或[项目管理员](./project-users#project-roles)。

![edit-user-role-or-remove-project-user-zh](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/edit-user-role-or-remove-project-user-zh.png "edit-user-role-or-remove-project-user-zh")

## 离开项目\{#leave-a-project}

当您不再属于某个项目时，您可以选择离开项目。

注意，如果您是项目的唯一管理员，您将无法离开该项目，因为每个项目必须始终至少有一个项目管理员。

<Admonition type="caution" icon="🚧" title="警告">

<p>一旦您离开项目，您对该项目及其相关资源的访问权限将被取消。</p>

</Admonition>

![leave-project-zh](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/leave-project-zh.png "leave-project-zh")

