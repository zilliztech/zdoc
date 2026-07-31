---
title: "add() | Java | v2"
slug: /java/java/v2-EmbeddingList-add
sidebar_label: "add()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将向一个 EmbeddingList 实例添加向量嵌入。 | Java | v2"
type: docx
token: PUOBd229uoQGUIxnHLWcMSidnQh
sidebar_position: 1
keywords: 
  - 什么是非结构化数据
  - 向量嵌入
  - 向量存储
  - 开源向量数据库
  - zilliz
  - zilliz cloud
  - 云
  - add()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# add()

此操作将向一个 **[EmbeddingList](./v2-Collections-EmbeddingList)** 实例添加向量嵌入。

```java
public void add(BaseVector vector)
```

**参数：**

- **vector** (*BaseVector*) -

    要添加到当前 EmbeddingList 中的一个向量嵌入。 

**返回类型：**

*[EmbeddingList](./v2-Collections-EmbeddingList)*

**返回：**

一个 EmbeddingList 实例，可再次用于链式调用其他 `add()` 方法。

**异常：**

- **MilvusClientException**

    如果提供了不同类型的向量嵌入，则会引发此异常。

## 示例：\{#examples}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.data.EmbeddingList;
import io.milvus.v2.service.vector.request.data.FloatVec;
        
// 1. Initialize an EmbeddingList
EmbeddingList embeddingList = new EmbeddingList();

// 2. Add vector embedding
embeddingList.add(new FloatVec[0.1, 0.2, 0.3, 0.4, 0.5])
```
