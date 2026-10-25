---
title: "grantPrivilegeV2() | Java | v2"
slug: /java/java/v2-Authentication-grantPrivilegeV2
sidebar_label: "grantPrivilegeV2()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会向特定角色授予权限或权限组。 | Java | v2"
type: docx
token: FQqadrhPqoTo3zxCjRWc6ryUnne
sidebar_position: 11
keywords: 
  - 向量 Database
  - IVF
  - knn
  - 图像搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - grantPrivilegeV2()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# grantPrivilegeV2()

此操作会向特定角色授予权限或权限组。

```java
public Void grantPrivilegeV2(GrantPrivilegeReqV2 request)
```

## 请求语法\{#request-syntax}

```java
grantPrivilegeV2(GrantPrivilegeReqV2.builder()
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

    要授予指定角色的权限或权限组。有关可用权限的详细信息，请参见 [管理集群角色（SDK）](/docs/cluster-roles-sdk)。

- `dbName(String dbName)`

    目标资源 Database。指定角色可在指定的 Database 中访问指定的权限。

- `collectionName(String collectionName)`

    指定 Database 中的目标资源 Collection。指定角色可在指定的 Collection 中访问指定的权限。

**异常：**

- **MilvusClientExceptions**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.GrantPrivilegeReqV2;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Grant privilege or privilege group
GrantPrivilegeReqV2 grantPrivilegeReqV2 = GrantPrivilegeReqV2.builder()
    .roleName("my_role")
    .privilege("Search")
    .dbName("my_db")
    .collectionName("my_collection")
    .build();

client.grantPrivilegeV2(grantPrivilegeReqV2);
```
