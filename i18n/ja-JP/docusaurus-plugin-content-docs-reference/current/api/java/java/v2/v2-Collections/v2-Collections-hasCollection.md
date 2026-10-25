---
title: "hasCollection() | Java | v2"
slug: /java/java/v2-Collections-hasCollection
sidebar_label: "hasCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定のコレクションが存在するかどうかを確認します。 | Java | v2"
type: docx
token: NpcZdo5JooJWWnxh4RAcwPEOnOf
sidebar_position: 16
keywords: 
  - 密ベクトル
  - 階層型ナビゲーション可能なスモールワールド
  - 密埋め込み
  - Faiss ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - hasCollection()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# hasCollection()

この操作は、特定のコレクションが存在するかどうかを確認します。

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

    ターゲットコレクションが属するデータベースの名前。

- `collectionName(String collectionName)`

    ターゲットコレクションの名前。

**戻り値の型:**

*bool*

**戻り値:**

指定したコレクションが存在するかどうかを示すブール値。

**パラメーター:**

- **exists** (*Boolean*) -

    指定したコレクションが存在するかどうか。

**例外:**

- **MilvusClientExceptions**

    この操作中にエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.HasCollectionReq;
import java.util.Set;

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
