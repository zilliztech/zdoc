---
title: "releaseCollection() | Java | v2"
slug: /java/java/v2-Management-releaseCollection
sidebar_label: "releaseCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、特定のコレクションのデータをメモリから解放します。 | Java | v2"
type: docx
token: AjbDdUJTuoB9MqxN5PDcyYeLnRe
sidebar_position: 16
keywords: 
  - IVF
  - knn
  - 画像検索
  - LLMs
  - zilliz
  - zilliz cloud
  - クラウド
  - releaseCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# releaseCollection()

この操作では、特定のコレクションのデータをメモリから解放します。

```java
public void releaseCollection(ReleaseCollectionReq request)
```

## リクエスト構文\{#request-syntax}

```java
releaseCollection(ReleaseCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .async(Boolean async)
    .timeout(Long timeout)
    .build()
);
```

**ビルダーメソッド：**

- `databaseName(String databaseName)` -

    データベースの名前です。指定しない場合は、現在のデータベースがデフォルトになります。

- `collectionName(String collectionName)` -

    対象のコレクションの名前です。

- `async(Boolean async)` -

    操作を非同期で実行するかどうかを指定します。デフォルトは `Boolean.TRUE` です。

- `timeout(Long timeout)` -

    タイムアウト時間（ミリ秒）です。デフォルトは `60000L` です。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.ReleaseCollectionReq;
import java.util.Set;

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
