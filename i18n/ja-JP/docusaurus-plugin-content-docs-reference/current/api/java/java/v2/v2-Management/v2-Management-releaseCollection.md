---
title: "releaseCollection() | Java | v2"
slug: /java/java/v2-Management-releaseCollection
sidebar_label: "releaseCollection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、特定のコレクションのデータをメモリから解放します。 | Java | v2"
type: docx
token: K5t2dl0XloN4VHx1lcpc6Uq3nye
sidebar_position: 16
keywords: 
  - IVF
  - knn
  - 画像検索
  - LLMs
  - zilliz
  - zilliz cloud
  - cloud
  - releaseCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# releaseCollection()

この操作は、特定のコレクションのデータをメモリから解放します。

```java
public void releaseCollection(ReleaseCollectionReq request)
```

## Request Syntax\{#request-syntax}

```java
releaseCollection(ReleaseCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .async(Boolean async)
    .timeout(Long timeout)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    データベース名。指定しない場合は、現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)` -

    対象のコレクション名。

- `async(Boolean async)` -

    この操作を非同期で実行するかどうか。デフォルトは `Boolean.TRUE` です。

- `timeout(Long timeout)` -

    タイムアウト時間（ミリ秒単位）。デフォルトは `60000L` です。

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.ReleaseCollectionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Release collection "test"
ReleaseCollectionReq releaseCollectionReq = ReleaseCollectionReq.builder()
        .collectionName("test")
        .build();
client.releaseCollection(releaseCollectionReq);
```
