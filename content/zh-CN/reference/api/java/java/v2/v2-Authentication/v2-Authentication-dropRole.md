---
title: "dropRole() | Java | v2"
slug: /java/java/v2-Authentication-dropRole
sidebar_label: "dropRole()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会删除自定义角色。 | Java | v2"
type: docx
token: EzGSdmnVYoWJ0WxiglLcoxn2neb
sidebar_position: 8
keywords: 
  - NLP 搜索
  - LLM 幻觉
  - 多模态搜索
  - 向量搜索算法
  - zilliz
  - zilliz cloud
  - 云
  - dropRole()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropRole()

此操作会删除自定义角色。

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

- `forceDrop(boolean forceDrop)`

    是否强制删除仍在使用中的角色。

**异常：**

- **MilvusClientExceptions**

    此操作期间发生任何错误时，将抛出此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.DropRoleReq;
import java.util.Set;

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
