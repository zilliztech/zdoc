---
title: "truncateCollection() | Java | v2"
slug: /java/java/v2-Collections-truncateCollection
sidebar_label: "truncateCollection()"
beta: false
added_since: v2.6.16
last_modified: v2.6.16
deprecate_since: false
notebook: false
description: "此操作会删除 Collection 中的所有数据，同时保留 Collection 的 Schema、索引和别名。 | Java | v2"
type: docx
token: JiLLdfLlPoKWL6xEgOAcdCU3nol
sidebar_position: 36
keywords: 
  - NLP
  - 神经网络
  - 深度学习
  - 知识库
  - zilliz
  - zilliz cloud
  - 云
  - truncateCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# truncateCollection()

此操作会删除 Collection 中的所有数据，同时保留 Collection 的 Schema、索引和别名。

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

    要清空的 Collection 名称。

- `databaseName(String databaseName)` -

    包含该 Collection 的 Database 名称。如果未指定，则使用默认 Database。

**返回：**

*void*

**异常：**

- **MilvusClientException** - 指定的 Collection 不存在，或者服务器无法访问。

## 示例\{#example}

```java
import io.milvus.v2.service.collection.request.TruncateCollectionReq;

TruncateCollectionReq req = TruncateCollectionReq.builder()
    .collectionName("my_collection")
    .build();

client.truncateCollection(req);
```
