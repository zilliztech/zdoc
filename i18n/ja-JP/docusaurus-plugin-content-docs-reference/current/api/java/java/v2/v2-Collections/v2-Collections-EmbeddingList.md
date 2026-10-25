---
title: "EmbeddingList | Java | v2"
slug: /java/java/v2-Collections-EmbeddingList
sidebar_label: "EmbeddingList"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "EmbeddingList インスタンスは、ベクトル埋め込みのリストを表します。EmbeddingList インスタンスを使用すると、Array of Structs フィールド内のベクトルフィールドに対する検索でクエリベクトルを構築できます。 | Java | v2"
type: docx
token: NQgpd7JHBoAgzzxU5PXcYml5nSd
sidebar_position: 32
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy ベクトル search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - EmbeddingList
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# EmbeddingList

**EmbeddingList** インスタンスは、ベクトル埋め込みのリストを表します。**EmbeddingList** インスタンスを使用すると、Array of Structs フィールド内のベクトルフィールドに対する検索でクエリベクトルを構築できます。

```java
io.milvus.v2.service.vector.request.data.EmbeddingList
```

## コンストラクター\{#constructor}

空の埋め込みリスト、または指定されたベクトル埋め込みのリストを構築します。

```java
EmbeddingList()
```

**RETURN TYPE:**

EmbeddingList

**RETURNS:**

EmbeddingList インスタンスは、1 つまたは複数のベクトル埋め込みで構成されます。これを使用すると、Array of Structs フィールドの Struct 要素内のベクトルフィールドに対する検索を実行できます。

## 例:\{#examples}

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

