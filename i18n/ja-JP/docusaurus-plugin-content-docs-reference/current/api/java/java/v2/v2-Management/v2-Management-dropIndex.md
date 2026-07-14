---
title: "dropIndex() | Java | v2"
slug: /java/java/v2-Management-dropIndex
sidebar_label: "dropIndex()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、特定の collection から index を削除します。 | Java | v2"
type: docx
token: XHyydLsEAoPwB2xNhcwc9KBwn7g
sidebar_position: 5
keywords: 
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz
  - zilliz
  - zilliz cloud
  - cloud
  - dropIndex()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropIndex()

この操作は、特定の collection から index を削除します。

```java
public void dropIndex(DropIndexReq request)
```

## リクエスト構文\{#request-syntax}

```java
dropIndex(DropIndexReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .fieldName(String fieldName)
    .indexName(String indexName)
    .build()
)
```

**ビルダーメソッド:**

- `databaseName(String databaseName)`

    対象の collection が属する database の名前。

- `collectionName(String collectionName)`

    既存の collection の名前。

- `fieldName(String fieldName)`

    index が作成されている field の名前。

- `indexName(String indexName)`

    削除する index の名前。

**戻り値:**

*void*

**例外:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.index.request.DropIndexReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop index for the field "vector"
DropIndexReq dropIndexReq = DropIndexReq.builder()
        .collectionName("test")
        .fieldName("vector")
        .build();
client.dropIndex(dropIndexReq);
```

