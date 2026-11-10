---
title: "管理集群用户（控制台） | BYOC"
slug: /cluster-users
sidebar_label: "管理集群用户（控制台）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 中，您可以创建集群用户并为其分配集群角色以定义权限，从而实现数据安全。 | BYOC"
type: origin
token: KKSvwII0Ni7CQ7khuiBcU1gYnQc
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 管理集群用户（控制台）

在 Zilliz Cloud 中，您可以创建集群用户并为其分配集群角色以定义权限，从而实现数据安全。 

在创建集群时，会自动生成一个名为 `db_admin` 的默认用户，该用户不可删除。除了这个默认用户之外，您还可以创建更多的集群用户以实现更精细的访问控制。 

如需管理集群用户，您的角色必须为**组织管理员**、**项目管理员**或拥有 **Cluster_Admin** 权限的角色。

## 创建集群用户\{#create-a-cluster-user}

![VpSHbBL9qoIU2txgK5QckGcfnqb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/vpshbbl9qoiu2txgk5qckgcfnqb.png "VpSHbBL9qoIU2txgK5QckGcfnqb")

<Procedures>  

1. 进入目标集群的详情页面，点击 **用户** 页签。

1. 点击 **+ 用户**，打开 **创建集群用户** 对话框。

1. 配置用户。

    - 输入用户的用户名

    - （可选）输入用户的描述

    - 授予该用户内置角色或自定义角色。有关角色的详细信息，请参考[管理集群角色（控制台）](./cluster-roles)。

    - 为该用户设置[鉴权](./cluster-credentials)时使用的密码。

1. 点击 **创建**。

</Procedures>

<Admonition type="info" title="说明">

每个集群中最多可创建 500 名集群用户。

</Admonition>

## 编辑集群用户角色\{#edit-the-role-of-a-cluster-user}

![JXGGbWgyKoWB9bxlgBOcE6ZgnOb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/jxggbwgykowb9bxlgboce6zgnob.png "JXGGbWgyKoWB9bxlgBOcE6ZgnOb")

<Procedures>  

1. 进入目标集群的详情页面，点击 **用户** 页签。

1. 找到目标用户，点击其 **操作** 列中的编辑图标。

1. 在 **修改角色** 对话框中，选择要授予用户的角色。

1. 点击 **确认**。

</Procedures>

## 删除集群用户\{#drop-a-cluster-user}

<Admonition type="info" title="说明">

集群默认用户 **db_admin** 不支持删除。

</Admonition>

![drop-cluster-user-zh](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/drop-cluster-user-zh.png "drop-cluster-user-zh")

<Procedures>  

1. 进入目标集群的详情页面，点击 **用户** 页签。

1. 找到目标用户，点击其 **操作** 列中的 **...**，选择 **移除**。

1. 在 **移除集群用户** 对话框中，输入目标用户的用户名进行确认。

1. 点击 **移除**。

</Procedures>