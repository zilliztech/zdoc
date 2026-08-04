---
title: "loadCollection() | Java | v2"
slug: /java/java/v2-Management-loadCollection
sidebar_label: "loadCollection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会将指定 collection 的数据加载到内存中。 | Java | v2"
type: docx
token: Y3q1d5FzmoSiNkxsWDLcHnAlnQf
sidebar_position: 13
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - loadCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# loadCollection()

此操作会将指定 collection 的数据加载到内存中。

```java
public void loadCollection(LoadCollectionReq request)
```

## 请求语法\{#request-syntax}

```java
loadCollection(LoadCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .numReplicas(Integer numReplicas)
    .async(Boolean async)
    .sync(Boolean sync)
    .timeout(Long timeout)
    .refresh(Boolean refresh)
    .loadFields(List<String> loadFields)
    .skipLoadDynamicField(Boolean skipLoadDynamicField)
    .resourceGroups(List<String> resourceGroups)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)` -

    数据库名称。若未指定，则默认使用当前数据库。

- `collectionName(String collectionName)` -

    目标 collection 的名称。

- `numReplicas(Integer numReplicas)` -

    要加载的副本数量。默认为 `1`。

- `async(Boolean async)` -

    是否异步运行该操作。默认为 `Boolean.FALSE`。

- `sync(Boolean sync)` -

    是否同步等待操作完成。默认为 `Boolean.TRUE`。

- `timeout(Long timeout)` -

    超时时长，单位为毫秒。默认为 `60000L`。

- `refresh(Boolean refresh)` -

    是否刷新加载以包含新字段。默认为 `Boolean.FALSE`。

- `loadFields(List<String> loadFields)` -

    要加载的特定字段名称列表。默认为 `new ArrayList<>()`。

- `skipLoadDynamicField(Boolean skipLoadDynamicField)` -

    是否跳过加载动态字段。默认为 `Boolean.FALSE`。

- `resourceGroups(List<String> resourceGroups)` -

    用于负载均衡的资源组名称列表。默认为 `new ArrayList<>()`。

**返回：**

*void*

**异常：**

- **MilvusClientException**

    当此操作过程中发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.LoadCollectionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Load collection "test"
LoadCollectionReq loadCollectionReq = LoadCollectionReq.builder()
        .collectionName("test")
        .build();
client.loadCollection(loadCollectionReq);
```
