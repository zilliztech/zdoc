---
title: "optimize() | Java | v2"
slug: /java/java/v2-Management-optimize
sidebar_label: "optimize()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、セグメントをターゲットサイズに Compaction したり、インデックスを再構築したりするなどして、コレクション内のデータの物理レイアウトを最適化します。 | Java | v2"
type: docx
token: SxrVdEzD4oLV9MxZbuzc6ltNnKe
sidebar_position: 31
keywords: 
  - ベクトルデータベース
  - マルチモーダルベクトルデータベース検索
  - 検索拡張生成
  - 大規模言語モデル
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - optimize()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# optimize()

この操作は、セグメントをターゲットサイズに Compaction したり、インデックスを再構築したりするなどして、コレクション内のデータの物理レイアウトを最適化します。

```java
public OptimizeTask optimize(OptimizeReq request)
```

## リクエスト構文\{#request-syntax}

```java
optimize(OptimizeReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .targetSize(String targetSize)
    .async(boolean async)
    .timeout(Long timeout)
    .build()
)
```

**ビルダーメソッド:**

- `databaseName(String databaseName)`

    データベース名です。指定しない場合は現在のデータベースがデフォルトになります。

- `collectionName(String collectionName)`

    対象コレクションの名前です。

- `targetSize(String targetSize)`

    ターゲットセグメントサイズです（例: `"512MB"`、`"1GB"`）。`null` 値の場合はサーバーのデフォルト値が使用されます。

- `async(boolean async)`

    最適化をバックグラウンドで実行するかどうかです。`false`（デフォルト）の場合は、最適化が完了するまで操作がブロックされます。`true` の場合は、`OptimizeTask` をすぐに返します。

- `timeout(Long timeout)`

    ミリ秒単位のタイムアウトです。`null` 値はタイムアウトなしを意味します。

**戻り値の型:**

*OptimizeTask*

**戻り値:**

進行状況を追跡し、最適化結果を提供する **OptimizeTask** です。`getResult(Long timeoutMs)` を呼び出すと、結果が利用可能になるまでブロックし、最終的な **OptimizeResp** を返します。このオブジェクトには以下のフィールドが含まれます:

**パラメーター:**

- **status** (*String*) -

    最適化のステータスです。

- **collectionName** (*String*) -

    最適化されたコレクションの名前です。

- **compactionId** (*Long*) -

    最適化によってトリガーされた Compaction の ID です。

- **targetSize** (*String*) -

    最適化のターゲットセグメントサイズです。

- **progress** (*List&lt;String&gt;*) -

    最適化の進行状況メッセージです。

### OptimizeTask\{#optimizetask}

**メソッド:**

- `void start()`

    最適化タスクを開始します。

- `boolean isDone()`

    最適化が完了したかどうかを返します。

- `boolean isCancelled()`

    最適化がキャンセルされたかどうかを返します。

- `ProgressStage getProgress()`

    現在の進行状況ステージを返します。

- `List<String> getProgressHistoryAsStrings()`

    進行状況の履歴を文字列として返します。

- `boolean cancel()`

    最適化のキャンセルを試みます。

- `OptimizeResp getResult(Long timeoutMs)`

    結果が利用可能になるか、タイムアウトするまでブロックし、`OptimizeResp` を返します。

    **ProgressStage** の値: `INITIALIZING`、`WAITING_FOR_INDEXES`、`COMPACTING`、`WAITING_FOR_COMPACTION`、`WAITING_FOR_INDEX_REBUILD`、`REFRESHING_LOAD`、`CANCELLED`。

### OptimizeResp\{#optimizeresp}

**メソッド:**

- `String getStatus()`

    操作のステータスを返します。

- `String getCollectionName()`

    最適化されたコレクションの名前を返します。

- `Long getCompactionId()`

    Compaction ID を返します。

- `String getTargetSize()`

    ターゲットセグメントサイズを返します。

- `List<String> getProgress()`

    進行状況メッセージを返します。

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合にスローされる例外です。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.OptimizeReq;
import io.milvus.v2.service.utility.OptimizeTask;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

OptimizeTask task = client.optimize(OptimizeReq.builder()
        .collectionName("my_collection")
        .targetSize("512MB")
        .build());
```
