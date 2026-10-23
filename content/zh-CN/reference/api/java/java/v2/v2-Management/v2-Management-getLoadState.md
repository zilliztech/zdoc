---
title: "getLoadState() | Java | v2"
slug: /java/java/v2-Management-getLoadState
sidebar_label: "getLoadState()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作显示指定的 Collection 或 Partition 是否已加载。 | Java | v2"
type: docx
token: UN0oddDrNoaIq2xDGCLcG9XCnob
sidebar_position: 9
keywords: 
  - 向量 Database 教程
  - 向量 Database 如何工作
  - 向量 Database 对比
  - OpenAI 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - getLoadState()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getLoadState()

此操作显示指定的 Collection 或 Partition 是否已加载。

```java
public Boolean getLoadState(GetLoadStateReq request)
```

## 请求语法\{#request-syntax}

```java
getLoadState(GetLoadStateReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build()
)
```

**构建器方法：**

- `databaseName(String databaseName)`

    目标 Collection 所属的 Database 的名称。

- `collectionName(String collectionName)`

    Collection 的名称。

- `partitionName(String partitionName)`

    Partition 的名称。

**返回类型：**

*Boolean*

**返回：**

一个 Boolean 值，指示指定的 Collection 或 Partition 的状态。

**参数：**

- **loaded** （*Boolean*） -

    指定的 Collection 或 Partition 是否已加载：如果已加载，则为 `true`，否则为 `false`。

**异常：**

- **MilvusException**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.GetLoadStateReq;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get load state for collection "test"
GetLoadStateReq getLoadStateReq = GetLoadStateReq.builder()
        .collectionName("test")
        .build();
Boolean resp = client.getLoadState(getLoadStateReq);
```
