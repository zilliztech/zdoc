---
title: "grantPrivilege() | Java | v2"
slug: /java/java/v2-Authentication-grantPrivilege
sidebar_label: "grantPrivilege()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会为角色分配权限。 | Java | v2"
type: docx
token: LcitdP8NuoIahexCUMQcOgg2nYg
sidebar_position: 10
keywords: 
  - 图像相似度搜索
  - 上下文窗口
  - 自然语言搜索
  - 相似度搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - grantPrivilege()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# grantPrivilege()

此操作会为角色分配权限。

```java
public void grantPrivilege(GrantPrivilegeReq request)
```

## 请求语法\{#request-syntax}

```java
grantPrivilege(GrantPrivilegeReq.builder()
    .roleName(String roleName)
    .dbName(String dbName)
    .objectType(String objectType)
    .privilege(String privilege)
    .objectName(String objectName)
    .build()
)
```

**构建器方法：**

- `roleName(String roleName)`

    要为其分配权限的角色的名称。

- `dbName(String dbName)`

    权限适用的 Database 的名称。省略时，该值默认为当前 Database。

- `objectType(String objectType)`

    要为其分配权限的对象的类型。

    可选值：

    - **Global**：系统级对象，允许用户执行会影响所有 Collection、用户或系统级设置的操作。当 **objectType** 设置为 **Global** 时，将 **objectName** 设置为通配符（**&ast;**），以表示指定类型的所有对象。

    - **Collection**：特定于 Collection 的对象，允许用户在特定 Collection 中执行创建索引、加载数据、插入或删除数据以及查询数据等操作。

    - **User**：与用户管理相关的对象，允许用户管理 Database 用户的凭据和角色，例如更新用户凭据或查看用户详细信息。

- `privilege(String privilege)`

    要分配的权限名称。

    有关详细信息，请参见 [管理集群角色（SDK）](/docs/cluster-roles-sdk) 页面表格中的 **权限名称** 列。

- `objectName(String objectName)`

    要控制访问权限的对象的名称。例如，如果对象类型为 **Collection**，则对象名称为 Collection 的名称。如果对象类型为 **User**，则对象名称为 Database 用户的名称。

    当 **object_type** 设置为 **Global** 时，将 **object_name** 设置为通配符（**&ast;**），以表示指定类型的所有对象。有关详细信息，请参见 [管理集群角色（SDK）](/docs/cluster-roles-sdk) 页面表格中的相关 API 列。

**异常：**

- **MilvusClientExceptions**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.GrantPrivilegeReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Grant privileges
GrantPrivilegeReq grantPrivilegeReq = GrantPrivilegeReq.builder()
        .roleName("db_rw")
        .objectType("User")
        .objectName("user_1")
        .privilege("SelectUser")
        .build();
client.grantPrivilege(grantPrivilegeReq);
```
