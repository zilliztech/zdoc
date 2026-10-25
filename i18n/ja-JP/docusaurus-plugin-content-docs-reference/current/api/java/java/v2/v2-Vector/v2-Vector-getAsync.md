---
title: "getAsync() | Java | v2"
slug: /java/java/v2-Vector-getAsync
sidebar_label: "getAsync()"
beta: false
added_since: v3.0.7
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定した ID のエンティティを非同期で取得し、Future を返します。 | Java | v2"
type: docx
token: BvuWd2mJUotj3kxXhbqczE9Zn3U
sidebar_position: 13
keywords: 
  - ベクトルストア
  - オープンソースのベクトルデータベース
  - ベクトルインデックス
  - ベクトルデータベース（オープンソース）
  - zilliz
  - Zilliz Cloud
  - クラウド
  - getAsync()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getAsync()

この操作は、指定した ID のエンティティを非同期で取得し、Future を返します。

```java
public CompletableFuture<GetResp> getAsync(GetReq request)
```

このメソッドは `get()` と同じリクエストパラメーターを使用しますが、`CompletableFuture<GetResp>` をすぐに返します。返された Future を使用して結果を処理するか、操作が失敗した場合の例外完了を処理してください。

## リクエスト構文\{#request-syntax}

```java
CompletableFuture<GetResp> future = client.getAsync(GetReq.builder()
    .collectionName(String collectionName)
    .ids(List<Object> ids)
    .build());
```

`GetReq` のビルダーメソッドの完全な一覧については、get() を参照してください。

**戻り値の型：**

*CompletableFuture&lt;GetResp&gt;*

**戻り値：**

`GetResp` で完了する Future、または操作が失敗したときに例外で完了する Future です。

**パラメーター：**

- **queryResults** (*List&lt;QueryResp.QueryResult&gt;*) -

    クエリ結果のリストです。各結果には次のフィールドが含まれます：

    - **entity** (*Map&lt;String,Object&gt;*) -

        一致したエンティティのフィールド名と値を含むマップです。

    - **elementOffset** (*Long*) -

        構造体配列の要素レベルのクエリ（`element_filter` を使用）では、一致した要素の配列内でのインデックスです。通常のクエリでは null です。

- **sessionTs** (*long*) -

    読み取りのセッションタイムスタンプです。

- **cost** (*Long*) -

    操作にかかった時間です。

- **scannedRemoteBytes** (*Long*) -

    操作中にリモートでスキャンされたバイト数です。

- **scannedTotalBytes** (*Long*) -

    操作中にスキャンされた合計バイト数です。

- **cacheHitRatio** (*Float*) -

    操作のキャッシュヒット率です。

**例外：**

- **MilvusClientException**

    リクエストの検証、転送、またはサーバーでの実行に失敗した場合に、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.GetReq;
import io.milvus.v2.service.vector.response.GetResp;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

CompletableFuture<GetResp> future = client.getAsync(GetReq.builder()
        .collectionName("my_collection")
        .ids(Collections.singletonList("0"))
        .build());
GetResp response = future.get();
```
