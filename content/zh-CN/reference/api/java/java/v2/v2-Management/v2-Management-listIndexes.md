---
title: "listIndexes() | Java | v2"
slug: /java/java/v2-Management-listIndexes
sidebar_label: "listIndexes()"
beta: false
added_since: v2.4.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作列出特定 Collection 中某个字段的索引。 | Java | v2"
type: docx
token: LxwIdeFiGoYaRAxKS72cdjNkneh
sidebar_position: 12
keywords: 
  - AI 幻觉
  - AI 代理
  - 语义搜索
  - 异常检测
  - zilliz
  - zilliz cloud
  - 云
  - listIndexes()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listIndexes()

此操作列出特定 Collection 中某个字段的索引。

```java
public List<String> listIndexes(ListIndexesReq request)
```

## 请求语法\{#request-syntax}

```java
listIndexes(ListIndexesReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .fieldName(String fieldName)
    .build()
)
```

**构建器方法：**

- `databaseName(String databaseName)`

    目标 Collection 所属的 Database 名称。

- `collectionName(String collectionName)`

    Collection 的名称。

- `fieldName(String fieldName)`

    目标字段的名称。

**返回：**

*List&lt;String&gt;*

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.index.request.ListIndexesReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List the indexes on the `varchar` field in the `test` collection
ListIndexesReq listIndexesReq = ListIndexesReq.builder()
        .collectionName("test")
        .fieldName("varchar")
        .build();
        
List<String> indexes = client.listIndexes(ListIndexesReq);
```

