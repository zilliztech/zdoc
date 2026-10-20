---
title: "queryAsync() | Java | v2"
slug: /java/java/v2-Vector-queryAsync
sidebar_label: "queryAsync()"
beta: false
added_since: v3.0.7
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクション内のエンティティを非同期にクエリし、future を返します。 | Java | v2"
type: docx
token: PWzJdbh5ZoT8K7xo1j4cbvNsnWe
sidebar_position: 16
keywords: 
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似性検索
  - マルチモーダル RAG
  - zilliz
  - zilliz cloud
  - クラウド
  - queryAsync()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# queryAsync()

この操作は、コレクション内のエンティティを非同期にクエリし、future を返します。

```java
public CompletableFuture<QueryResp> queryAsync(QueryReq request)
```

このメソッドは `query()` と同じリクエストパラメーターを使用しますが、`CompletableFuture<QueryResp>` をすぐに返します。返された future を使用して、結果を消費するか、操作が失敗したときの例外的な完了を処理します。

## リクエスト構文\{#request-syntax}

```java
CompletableFuture<QueryResp> future = client.queryAsync(QueryReq.builder()
    .collectionName(String collectionName)
    .filter(String filter)
    .outputFields(List<String> outputFields)
    .build());
```

`QueryReq` ビルダーメソッドの完全なリストについては、query() を参照してください。

**戻り値の型：**

*CompletableFuture&lt;QueryResp&gt;*

**戻り値：**

`QueryResp` で完了する future、または操作が失敗したときに例外的に完了する future です。

**パラメーター：**

- **queryResults** (*List&lt;QueryResp.QueryResult&gt;*) -

    クエリ結果のリストです。各結果には次のフィールドが含まれます。

- **entity** (*Map&lt;String,Object&gt;*) -

    一致したエンティティのフィールド名と値を含むマップです。

- **elementOffset** (*Long*) -

    構造体配列の要素レベルのクエリでは、一致した要素の配列内でのインデックスです。通常のクエリでは Null です。

- **sessionTs** (*long*) -

    読み取りのセッションタイムスタンプです。

- **cost** (*Long*) -

    操作の時間コストです。

- **scannedRemoteBytes** (*Long*) -

    クエリ中にリモートでスキャンされたバイト数です。

- **scannedTotalBytes** (*Long*) -

    クエリ中にスキャンされた合計バイト数です。

- **cacheHitRatio** (*Float*) -

    クエリのキャッシュヒット率です。

**例外：**

- **MilvusClientException**

    この例外は、リクエストの検証、トランスポート、またはサーバーでの実行に失敗した場合に発生します。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

CompletableFuture<QueryResp> future = client.queryAsync(QueryReq.builder()
        .collectionName("my_collection")
        .filter("age > 20")
        .outputFields(Arrays.asList("name", "age"))
        .build());
QueryResp response = future.get();
```
