---
title: "EmbeddingList | Java | v2"
slug: /java/java/v2-Collections-EmbeddingList
sidebar_label: "EmbeddingList"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "EmbeddingList 实例表示一个向量嵌入列表。您可以使用 EmbeddingList 实例来构建查询向量，以便在 Array of Structs 字段中的某个向量字段上执行搜索。 | Java | v2"
type: docx
token: EXcNdtZrro7Ufkxp3G6cUArOn7b
sidebar_position: 2
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - EmbeddingList
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# EmbeddingList

**EmbeddingList** 实例表示一个向量嵌入列表。您可以使用 **EmbeddingList** 实例来构建查询向量，以便在 Array of Structs 字段中的某个向量字段上执行搜索。

```java
io.milvus.v2.service.vector.request.data.EmbeddingList
```

## Constructor\{#constructor}

构造一个空的嵌入列表，或一个包含给定向量嵌入的列表。

```java
EmbeddingList()
```

**RETURN TYPE:**

EmbeddingList

**RETURNS:**

一个 EmbeddingList 实例包含一个或多个向量嵌入。您可以使用它对 Array of Structs 字段中 Struct 元素里的向量字段执行搜索。

## Examples:\{#examples}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.data.EmbeddingList;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
// 2. Initialize EmbeddingList
EmbeddingList embeddingList1 = new EmbeddingList();
embeddingList1.add(new FloatVec(vector1));
embeddingList1.add(new FloatVec(vector2));

EmbeddingList embeddingList2 = new EmbeddingList();
embeddingList2.add(new FloatVec(vector3));
embeddingList2.add(new FloatVec(vector4));

SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .annsField(annName)
        .data(Arrays.asList(embeddingList1, embeddingList2))
        .limit(10)
        .build());
```

