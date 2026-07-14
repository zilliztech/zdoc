---
title: "hasCollection() | Java | v2"
slug: /java/java/v2-Collections-hasCollection
sidebar_label: "hasCollection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、特定の collection が存在するかどうかを確認します。 | Java | v2"
type: docx
token: RaBJd4clVo6KX4xjGJoc3Mz7nhg
sidebar_position: 18
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - hasCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# hasCollection()

この操作は、特定の collection が存在するかどうかを確認します。

```java
public Boolean hasCollection(HasCollectionReq request)
```

## リクエスト構文\{#request-syntax}

```java
hasCollection(HasCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
)
```

**BUILDER メソッド:**

- `databaseName(String databaseName)`

    ターゲット collection が属するデータベースの名前。

- `collectionName(String collectionName)`

    collection の名前。

**戻り値の型:**

*bool*

**戻り値:**

指定した collection が存在するかどうかを示すブール値。

**例外:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.HasCollectionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Check whether the collection exists
HasCollectionReq hasCollectionReq = HasCollectionReq.builder()
        .collectionName("test")
        .build();
Boolean resp = client.hasCollection(hasCollectionReq);
```

