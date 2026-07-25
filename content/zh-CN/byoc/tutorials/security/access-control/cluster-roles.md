---
title: "管理集群角色（控制台） | BYOC"
slug: /cluster-roles
sidebar_label: "管理集群角色（控制台）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "集群角色定义了用户在集群中的权限。具体而言，集群角色控制集群用户在集群、Database 和 Collection 层级的权限。 | BYOC"
type: origin
token: A1MewOIxbi6Lq3kmiFkcqVt7nZf
sidebar_position: 4
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 安全
  - 访问控制
  - 集群角色
  - roles

---

import Admonition from '@theme/Admonition';


# 管理集群角色（控制台）

集群角色定义了用户在集群中的权限。具体而言，集群角色控制集群用户在集群、Database 和 Collection 层级的权限。

Zilliz Cloud 提供两种类型的集群角色：内置角色和自定义角色。

如需管理集群角色，您的角色必须为**组织管理员**或**项目管理员**或具备 **Cluster_Admin** 权限的角色。

## 内置集群角色\{#built-in-cluster-roles}

Zilliz Cloud 提供 3 种内置的集群角色，每种内置角色都包含了向量数据库系统中常用的权限组合。内置角色无法修改或删除。

- **Admin**：集群 Admin 角色具备管理某个集群及其所有资源（Database、Collection）的权限。

    下表罗列了该角色具备的界面和 API 操作权限。

    <table>
       <tr>
         <th><p><strong>界面操作权限</strong></p></th>
         <th><p><strong>数据面 RESTful API (V2) 权限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>管理集群属性（例如 CU 规格、Replica 数量、弹性扩缩）</p></li><li><p>管理 Collection 和 Index</p></li><li><p>查看集群指标</p></li><li><p>查看集群用户和角色</p></li><li><p>查看集群备份</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">所有 Collection 操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">所有 Index 操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">所有 Partition 操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">所有 Vector 操作</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">所有 Alias 操作</a></p></li><li><p><a href="/reference/restful/role-operations-v2">所有 Role 操作</a></p></li><li><p><a href="/reference/restful/user-operations-v2">所有 User 操作</a></p></li></ul></td>
       </tr>
    </table>

- **Read-Write**：集群 Read-Write 角色具备查看某个集群及管理其所有资源（Database、Collection）的权限。

    下表罗列了该角色具备的界面和 API 操作权限。

    <table>
       <tr>
         <th><p><strong>界面操作权限</strong></p></th>
         <th><p><strong>数据面 RESTful API (V2) 权限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>管理 Collection 和 Index</p></li><li><p>查看集群指标</p></li><li><p>查看集群用户和角色</p></li><li><p>查看集群备份</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">所有 Collection 操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">所有 Index 操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">所有 Partition 操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">所有 Vector 操作</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">所有 Alias 操作</a></p></li></ul></td>
       </tr>
    </table>

- **Read-Only**：集群 Read-Only 角色具备查看某个集群及其所有资源（Database、Collection）的权限。

    下表罗列了该角色具备的界面和 API 操作权限。

    <table>
       <tr>
         <th><p><strong>界面操作权限</strong></p></th>
         <th><p><strong>数据面 RESTful API (V2) 权限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>查看 Collection 和 Index</p></li><li><p>查看集群指标</p></li><li><p>查看集群用户和角色</p></li><li><p>查看集群备份</p></li></ul></td>
         <td><ul><li><p>部分 Collection 操作</p><ul><li><p><a href="/reference/restful/describe-collection-v2">查看 Collection 详情</a></p></li><li><p><a href="/reference/restful/get-collection-load-state-v2">查看 Collection 加载状态</a></p></li><li><p><a href="/reference/restful/get-collection-stats-v2">查看 Collection 统计信息</a></p></li><li><p><a href="/reference/restful/has-collection-v2">查看 Collection 是否存在</a></p></li><li><p><a href="/reference/restful/list-collections-v2">查看 Collection 列表</a></p></li></ul></li><li><p>部分 Index 操作</p><ul><li><p><a href="/reference/restful/describe-index-v2">查看索引详情</a></p></li><li><p><a href="/reference/restful/list-indexes-v2">查看索引列表</a></p></li></ul></li><li><p>部分 Partition 操作</p><ul><li><p><a href="/reference/restful/get-partition-statistics-v2">查看 Partition 统计信息</a></p></li><li><p><a href="/reference/restful/has-partition-v2">查看 Partition 是否存在</a></p></li><li><p><a href="/reference/restful/list-partitions-v2">查看 Partition 列表</a></p></li></ul></li><li><p>部分 Alias 操作</p><ul><li><p><a href="/reference/restful/describe-alias-v2">查看 Alias 详情</a></p></li><li><p><a href="/reference/restful/list-aliases-v2">查看 Alias 列表</a></p></li></ul></li></ul></td>
       </tr>
    </table>

## 自定义集群角色\{#custom-cluster-roles}

自定义角色相对更灵活，支持精细化分配集群、Database、Collection 层级的权限。

如需实现 Collection 层级的权限控制，建议您创建自定义的集群角色。

<Admonition type="info" icon="📘" title="说明">

<p>此功能仅限 Dedicated 集群使用。</p>
<p>目前 Zilliz Cloud 仅支持为自定义角色分配内置权限组。如需创建自定义角色并分配特定权限或自定义权限组，请<a href="http://support.zilliz.com.cn">联系我们</a>。</p>

</Admonition>

## 创建自定义集群角色\{#create-a custom-cluster-role}

1. 前往目标集群的**角色**页签。点击 **+ 集群角色**。

    ![add-cluster-role-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/add-cluster-role-cn.png "add-cluster-role-cn")

1. 输入角色名称。

1. 配置角色的集群、Database、Collection 权限。选择权限组并选择目标资源。

    Zilliz Cloud 提供 9 种内置权限组：

    - Collection 权限组: Admin (`COLL_ADMIN`)、Read-Write (`COLL_RW`)、Read-Only (`COLL_RO`)

    - Database 权限组 Admin (`DB_Admin`)、Read-Write (`DB_RW`)、Read-Only (`DB_RO`)

    - Cluster Privilege Group: Admin (`Cluster_Admin`)、Read-Write (`Cluster_RW`)、Read-Only (`Cluster_RO`)

    有关权限和权限组的详细信息，请参考[权限](./cluster-privileges)。

    <Admonition type="info" icon="📘" title="说明">

    <p>上述三个层级的内置权限组之间没有级联关系。设置实例层级的权限组并不会自动设置该实例下所有 Database 和 Collection 的权限，Database 和 Collection 层级的权限需要单独手动设置。</p>

    </Admonition>

    如需自行组合权限创建权限组，请[联系我们](http://support.zilliz.com.cn)。

    ![add-cluster-role-form-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/add-cluster-role-form-cn.png "add-cluster-role-form-cn")

1. 点击**创建**。 每个集群中最多可创建 20 个自定义集群角色。

## 将角色授予用户\{#grant-a-role-to-a-user}

自定义角色创建成功后，您可以将其分配给用户。前往**用户**页签，您可以在[创建集群用户](./cluster-users#create-a-cluster-user)和[修改集群用户角色](./cluster-users#edit-the-role-of-a-cluster-user)时为用户授予角色。

![grant-role-to-user-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/grant-role-to-user-cn.png "grant-role-to-user-cn")

## 撤销授予用户的角色\{#revoke-a-role-from-a-user}

如果某个角色不再适用于某个集群用户，您可以撤销分配给集群用户的角色。前往**用户**页签，在目标用户的操作下拉菜单中点击[编辑角色](./cluster-users#edit-the-role-of-a-cluster-user)。在对话框中为用户选择一个新的角色。

![revoke-role-from-user-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/revoke-role-from-user-cn.png "revoke-role-from-user-cn")

## 编辑自定义集群角色\{#edit-a-custom-cluster-role}

您可以调整自定义角色的权限。权限调整的操作会影响所有被分配到该角色的用户。

![edit-custom-role-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/edit-custom-role-cn.png "edit-custom-role-cn")

## 删除自定义集群角色\{#delete-a-custom-cluster-role}

您可以删除不再需要使用的自定义角色。

已分配给用户的自定义角色不可删除。如仍需继续删除，请先找到正在使用该自定义角色的集群用户，然后为这些用户分配其他角色，最终再删除该自定义角色。

![delete-cluster-role-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/delete-cluster-role-cn.png "delete-cluster-role-cn")

