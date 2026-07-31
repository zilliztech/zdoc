---
title: "get() | Java | v2"
slug: /java/java/v2-Vector-get
sidebar_label: "get()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作通过实体 ID 获取特定实体。 | Java | v2"
type: docx
token: Xl3QdxmFxo3MNCxWlrxc9jFbnFc
sidebar_position: 2
keywords: 
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - get()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# get()

此操作通过实体 ID 获取特定实体。

```java
public GetResp get(GetReq request)
```

## 请求语法\{#request-syntax}

```java
get(GetReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .clusterId(String clusterId)
    .partitionName(String partitionName)
    .ids(List<Object> ids)
    .outputFields(List<String> outputFields)
    .build()
)
```

**构建器方法：**

- `databaseName(String databaseName)`

    目标集合所属数据库的名称。

- `collectionName(String collectionName)`

    现有集合的名称。

- `clusterId(String clusterId)`

    此向量读取请求的目标集群 ID。当多个请求应共享同一个集群 ID 时，请使用 `session(String clusterId)`。

- `partitionName(String partitionName)`

    分区名称。

- `ids(List<Object> ids)`

    单个特定实体 ID 或实体 ID 列表。

- `outputFields(List<String> outputFields)`

    查询结果中要包含的字段名称列表。

**返回类型：**

*GetResp*

**返回：**

表示一个或多个已查询实体的 **GetResp** 对象。

**参数：**

- **getResults** (*List\\\&lt;QueryResp.QueryResult\\\&gt;*)

    **QueryResp.QueryResult** 对象列表。

- **fields** (*Map\\\&lt;String,Object\\\&gt;*)

    包含字段名称及其值键值对的映射。

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.GetReq;
import io.milvus.v2.service.vector.response.GetResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get entity with id 0
GetReq getReq = GetReq.builder()
        .collectionName("test")
        .ids(Collections.singletonList("0"))
        .build();
GetResp getResp = client.get(getReq);
```
