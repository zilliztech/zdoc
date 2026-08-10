---
title: "revokePrivilegeV2() | Java | v2"
slug: /java/java/v2-Authentication-revokePrivilegeV2
sidebar_label: "revokePrivilegeV2()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会从特定角色中撤销权限或权限组。 | Java | v2"
type: docx
token: FZN8dtlIRoMSGBxF7b1cWX48n0b
sidebar_position: 18
keywords: 
  - 自然语言搜索
  - 相似性搜索
  - 多模态 RAG
  - llm 幻觉
  - zilliz
  - zilliz cloud
  - 云
  - revokePrivilegeV2()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# revokePrivilegeV2()

此操作会从特定角色中撤销权限或权限组。

```java
public Void revokePrivilegeV2(RevokePrivilegeReqV2 request)
```

## 请求语法\{#request-syntax}

```java
revokePrivilegeV2(RevokePrivilegeReqV2.builder()
    .roleName(String roleName)
    .privilege(String privilege)
    .dbName(String dbName)
    .collectionName(String collectionName)
    .build()
)
```

**构建器方法：**

- `roleName(String roleName)`

    目标角色的名称。

- `privilege(String privilege)`

    要从指定角色中撤销的权限或权限组。有关可用权限的详细信息，请参见 [权限](/docs/cluster-privileges)。

- `dbName(String dbName)`

    目标资源所在的 Database。执行此操作后，指定角色将失去对指定 Database 中指定权限的访问权限。

- `collectionName(String collectionName)`

    指定 Database 中的目标资源 Collection。执行此操作后，指定角色将失去对指定 Collection 中指定权限的访问权限。

**返回：**

*void*

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.RevokePrivilegeReqV2;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Revoke privilege or privilege group
RevokePrivilegeReqV2 revokePrivilegeReqV2 = RevokePrivilegeReqV2.builder()
    .roleName("my_role")
    .privilege("read_only")
    .dbName("my_db")
    .collectionName("my_collection")
    .build()
        
client.revokePrivilegeV2(revokePrivilegeReqV2);
```

