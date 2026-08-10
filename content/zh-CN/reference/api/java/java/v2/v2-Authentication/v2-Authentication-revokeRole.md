---
title: "revokeRole() | Java | v2"
slug: /java/java/v2-Authentication-revokeRole
sidebar_label: "revokeRole()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会撤销分配给用户的角色。 | Java | v2"
type: docx
token: Znb7dcNoeobIkkxGLGfcpVfUnIX
sidebar_position: 19
keywords: 
  - 视频搜索
  - AI 幻觉
  - AI Agent
  - 语义搜索
  - zilliz
  - zilliz cloud
  - 云
  - revokeRole()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# revokeRole()

此操作会撤销分配给用户的角色。

```java
public void revokeRole(RevokeRoleReq request)
```

## 请求语法\{#request-syntax}

```java
revokeRole(RevokeRoleReq.builder()
    .roleName(String roleName)
    .userName(String userName)
    .build()
)
```

**构建器方法：**

- `roleName(String roleName)`

    要撤销的角色名称。

- `userName(String userName)`

    现有用户的名称。

**返回：**

*void*

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.RevokeRoleReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Revoke a role from a user
RevokeRoleReq revokeRoleReq = RevokeRoleReq.builder()
        .roleName("db_ro")
        .userName("test")
        .build();
client.revokeRole(revokeRoleReq);
```

