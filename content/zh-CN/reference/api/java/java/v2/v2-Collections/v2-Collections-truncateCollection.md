---
title: "truncateCollection() | Java | v2"
slug: /java/java/v2-Collections-truncateCollection
sidebar_label: "truncateCollection()"
beta: false
added_since: v2.6.16
last_modified: v2.6.16
deprecate_since: false
notebook: false
description: "此操作会移除集合中的所有数据，同时保留集合的 schema、索引和别名。 | Java | v2"
type: docx
token: JiLLdfLlPoKWL6xEgOAcdCU3nol
sidebar_position: 36
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
  - zilliz
  - zilliz cloud
  - cloud
  - truncateCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# truncateCollection()

此操作会移除集合中的所有数据，同时保留集合的 schema、索引和别名。

```java
client.truncateCollection(TruncateCollectionReq request)
```

## 请求语法\{#request-syntax}

```java
TruncateCollectionReq.builder()
    .collectionName(String collectionName)
    .databaseName(String databaseName)
    .build()
```

**构建器方法：**

- `collectionName(String collectionName)` -

    **[必需]**

    要清空的集合名称。

- `databaseName(String databaseName)` -

    包含该集合的数据库名称。如果未指定，则使用默认数据库。

**返回：**

*void*

**异常：**

- **MilvusClientException** - 指定的集合不存在，或者服务器不可达。

## 示例\{#example}

```java
import io.milvus.v2.service.collection.request.TruncateCollectionReq;

TruncateCollectionReq req = TruncateCollectionReq.builder()
    .collectionName("my_collection")
    .build();

client.truncateCollection(req);
```
