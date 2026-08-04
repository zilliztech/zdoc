---
title: "dropRole() | Java | v2"
slug: /java/java/v2-Authentication-dropRole
sidebar_label: "dropRole()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除一个自定义角色。 | Java | v2"
type: docx
token: OLVbdsTOAoQwybx7oLPcZE3wnCf
sidebar_position: 8
keywords: 
  - nlp search
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - zilliz
  - zilliz cloud
  - cloud
  - dropRole()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropRole()

此操作会删除一个自定义角色。

```java
public void dropRole(DropRoleReq request)
```

## 请求语法\{#request-syntax}

```java
dropRole(DropRoleReq.builder()
    .roleName(String roleName)
    .build()
)
```

**构建器方法：**

- `roleName(String roleName)`

    要删除的角色名称。

**返回：**

*void*

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.DropRoleReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop a role
DropRoleReq dropRoleReq = DropRoleReq.builder()
        .roleName("test")
        .build();
client.dropRole(dropRoleReq);
```
