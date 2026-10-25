---
title: "revokePrivilege() | Java | v2"
slug: /java/java/v2-Authentication-revokePrivilege
sidebar_label: "revokePrivilege()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会撤销已分配给角色的权限。 | Java | v2"
type: docx
token: SOiMdD68wohoLqxFmltc6vwDnTf
sidebar_position: 17
keywords: 
  - 最近邻搜索
  - Agentic RAG
  - RAG LLM 架构
  - 私有 LLM
  - zilliz
  - zilliz cloud
  - 云
  - revokePrivilege()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# revokePrivilege()

此操作会撤销已分配给角色的权限。

```java
public void revokePrivilege(RevokePrivilegeReq request)
```

## 请求语法\{#request-syntax}

```java
revokePrivilege(RevokePrivilegeReq.builder()
    .dbName(String databaseName)
    .roleName(String roleName)
    .objectType(String objectType)
    .privilege(String privilege)
    .objectName(String objectName)
    .build()
)
```

**构建器方法：**

- `dbName(String databaseName)`

    Database 的名称。

    此参数为可选参数。设置此参数后，权限撤销范围将限制在指定的 Database 内。

- `objectName(String objectName)`

    要控制访问权限的对象的名称。例如，如果对象类型为 **Collection**，则对象名称为 Collection 的名称。如果对象类型为 **User**，则对象名称为 Database 用户的名称。

    当 **object_type** 设置为 **Global** 时，将 **object_name** 设置为通配符（**&ast;**），表示指定类型的所有对象。有关详细信息，请参阅“用户和角色”页面表格中的“相关 API”列。

- `objectType(String objectType)`

    要从中撤销权限的对象类型。

    可选值：

    - **Global**：系统级对象，允许用户执行影响所有 Collection、用户或系统级设置的操作。当 **object_type** 设置为 **Global** 时，将 **object_name** 设置为通配符（**&ast;**），表示指定类型的所有对象。

    - **Collection**：特定于 Collection 的对象，允许用户在特定 Collection 内执行创建索引、加载数据、插入或删除数据以及查询数据等操作。

    - **User**：与用户管理相关的对象，允许用户管理 Database 用户的凭据和角色，例如更新用户凭据或查看用户详细信息。

- `privilege(String privilege)`

    要分配的权限的名称。

    有关详细信息，请参阅“用户和角色”页面表格中的 **Privilege name** 列。

- `roleName(String roleName)`

    要从中撤销权限的角色的名称。

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.RevokePrivilegeReq;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Revoke a privilege
RevokePrivilegeReq revokePrivilegeReq = RevokePrivilegeReq.builder()
        .roleName("db_rw")
        .privilege("DescribeCollection")
        .objectName("*")
        .objectType("Global")
        .build();
client.revokePrivilege(revokePrivilegeReq);
```
