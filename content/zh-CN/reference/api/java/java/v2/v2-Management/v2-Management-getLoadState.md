---
title: "getLoadState() | Java | v2"
slug: /java/java/v2-Management-getLoadState
sidebar_label: "getLoadState()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作显示指定 Collection 或 Partition 是否已加载。 | Java | v2"
type: docx
token: PAs7dwIIrop4OixCUr8ctHVLnXc
sidebar_position: 9
keywords: 
  - 向量 Database 教程
  - 向量 Database 如何工作
  - 向量数据库对比
  - openai 向量数据库
  - zilliz
  - zilliz cloud
  - 云
  - getLoadState()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getLoadState()

此操作显示指定 Collection 或 Partition 是否已加载。

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

    目标 Collection 所属的 Database 名称。

- `collectionName(String collectionName)`

    Collection 名称。

- `partitionName(String partitionName)`

    Partition 名称。

**返回类型：**

*Boolean*

**返回值：**

一个 Boolean 值，用于指示指定 Collection 或 Partition 的状态。 

<Admonition type="info" icon="📘" title="Notes">

如果某个 Collection 的任意一个或全部 Partition 已加载，则该 Collection 处于已加载状态。

</Admonition>

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.GetLoadStateReq;

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
