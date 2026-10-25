---
title: "dropPrivilegeGroup() | Java | v2"
slug: /java/java/v2-Authentication-dropPrivilegeGroup
sidebar_label: "dropPrivilegeGroup()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会创建一个权限组。 | Java | v2"
type: docx
token: CPCydbcK5oiXF4xm20ycwXu5nSh
sidebar_position: 7
keywords: 
  - 图像相似度搜索
  - 上下文窗口
  - 自然语言搜索
  - 相似度搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - dropPrivilegeGroup()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropPrivilegeGroup()

此操作会创建一个权限组。

```java
public Void dropPrivilegeGroup(DropPrivilegeGroupReq request)
```

## 请求语法\{#request-syntax}

```java
dropPrivilegeGroup(DropPrivilegeGroupReq.builder()
    .groupName(String groupName)
    .build()
)
```

**构建器方法：**

- `groupName(String groupName)`

    要删除的权限组名称。

**异常：**

- **MilvusClientExceptions**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.DropPrivilegeGroupReq;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop a privilege group
DropPrivilegeGroupReq dropPrivilegeGroupReq = DropPrivilegeGroupReq.builder()
        .groupName("read_only")
        .build();
        
client.dropPrivilegeGroup(dropPrivilegeGroupReq);
```
