---
title: "compact() | Java | v2"
slug: /java/java/v2-Management-compact
sidebar_label: "compact()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、小さなセグメントをより大きなセグメントにマージすることで、コレクションの Compaction を実行します。コレクションに大量のデータを挿入した後で、この操作を呼び出すことをお勧めします。 | Java | v2"
type: docx
token: LDQsdzUJQotV2GxWGaqcFkDenuq
sidebar_position: 2
keywords: 
  - LLM のハルシネーション
  - ハイブリッド検索
  - レキシカル検索
  - 最近傍検索
  - zilliz
  - zilliz cloud
  - クラウド
  - compact()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# compact()

この操作では、小さなセグメントをより大きなセグメントにマージすることで、コレクションの Compaction を実行します。コレクションに大量のデータを挿入した後で、この操作を呼び出すことをお勧めします。

```java
public CompactResp compact(CompactReq request)
```

## リクエスト構文\{#request-syntax}

```java
compact(CompactReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .isClustering(Boolean isClustering)
    .isL0(Boolean isL0)
    .targetSize(Long targetSize)
    .targetSizeUnit(String targetSizeUnit)
    .build()
);
```

**ビルダーメソッド：**

- `databaseName(String databaseName)`

    データベースの名前です。指定しない場合は、現在のデータベースがデフォルトになります。

- `collectionName(String collectionName)`

    対象のコレクションの名前です。

- `isClustering(Boolean isClustering)`

    クラスタリング Compaction を実行するかどうか。デフォルトは `Boolean.FALSE` です。

- `isL0(Boolean isL0)`

    L0 Compaction をリクエストするかどうか。デフォルトは Boolean.FALSE で、クラスタリング Compaction とは独立しています。

- `targetSize(Long targetSize)`

    `targetSizeUnit` で表されるターゲットセグメントサイズです。`null` 値の場合はサーバーのデフォルトが使用されます。

- `targetSizeUnit(String targetSizeUnit)`

    `targetSize` の単位です。サポートされる値は `"b"`、`"kb"`、`"mb"`、`"gb"`、`"tb"`、`"pb"` です。デフォルトは `"mb"` です。

**戻り値の型：**

*CompactResp*

**戻り値：**

**CompactResp** オブジェクトには、次のフィールドが含まれます。

**パラメーター：**

- **compactionID** (*Long*) -

    Compaction タスクの ID です。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生した場合にスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.CompactReq;
import io.milvus.v2.service.utility.response.CompactResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Compact a collection
client.compact(CompactReq.builder()
    .collectionName("my_collection")
    .build();
);
```
