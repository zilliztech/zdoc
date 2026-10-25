---
title: "FunctionChain | Java | v2"
slug: /java/java/v2-Vector-FunctionChain
sidebar_label: "FunctionChain"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "FunctionChain インスタンスは、検索結果に適用される順序付けされた再ランク/refine プランです。`map`、`sort`、`limit` の各操作を組み合わせて、`search()` 呼び出しの結果列を後処理します。 | Java | v2"
type: docx
token: U0mKd1nlXoWkDqxf9zRcoURVnCb
sidebar_position: 1
keywords: 
  - ベクトルデータベースの例
  - RAG ベクトルデータベース
  - ベクトルデータベースとは
  - ベクトルデータベースとは何か
  - zilliz
  - zilliz cloud
  - クラウド
  - FunctionChain
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# FunctionChain

FunctionChain インスタンスは、検索結果に適用される順序付けされた再ランク/refine プランです。`map`、`sort`、`limit` の各操作を組み合わせて、`search()` 呼び出しの結果列を後処理します。

```java
io.milvus.v2.service.vector.request.FunctionChain
```

## コンストラクター\{#constructor}

このビルダーは、map、sort、limit の各操作から関数チェーンを構成します。

```java
FunctionChain.builder()
    .stage(FunctionChainStage stage)
    .name(String name)
    .map(String output, FunctionChainExpr expr)
    .sort(String by, boolean desc, String tieBreakCol)
    .limit(int limit)
    .limit(int limit, int offset)
    .build()
```

**ビルダーメソッド：**

- `stage(FunctionChainStage stage)`

    この関数チェーンが実行される実行ステージです。ステージが `null` の場合、`MilvusClientException` をスローします。

- `name(String name)`

    この関数チェーンの名前です。null が渡された場合は、空の文字列がデフォルトになります。

- `map(String output, FunctionChainExpr expr)`

    式から新しい出力列を計算する `map` 操作を追加します。

- `sort(String by, boolean desc, String tieBreakCol)`

    指定した列で結果を並べ替える `sort` 操作を追加します。タイブレーク列を省略するには、`tieBreakCol` に `null` を渡します。

- `limit(int limit)`

    先頭から指定した件数の結果のみを保持する `limit` 操作を追加します。

- `limit(int limit, int offset)`

    先頭の指定した件数の結果をスキップし、指定した件数の結果のみを保持する `limit` 操作を追加します。

**戻り値の型：**

*FunctionChain*

**戻り値：**

**FunctionChain** インスタンスです。

**パラメーター：**

- **stage** (*FunctionChainStage*) -

    この関数チェーンが実行される実行ステージです。

- **name** (*String*) -

    この関数チェーンの名前です。空の文字列がデフォルトです。

- **ops** (*List&lt;FunctionChainOp&gt;*) -

    この関数チェーンの操作の順序付きリストです。

**メソッド：**

- `FunctionChainStage getStage()`

    この関数チェーンが実行される実行ステージを返します。

- `String getName()`

    この関数チェーンの名前を返します。

- `List<FunctionChainOp> getOps()`

    この関数チェーンの操作の順序付きリストを返します。

## 例\{#example}

```java
FunctionChain chain = FunctionChain.builder()
        .stage(FunctionChainStage.L2_RERANK)
        .name("fresh_popular_rerank")
        .map("$score", FunctionChainExpr.builder()
                .name("num_combine")
                .arg(FunctionChainArg.col("$score"))
                .arg(FunctionChainArg.col("freshness"))
                .param("mode", "weighted")
                .param("weights", Arrays.asList(0.7, 0.2, 0.1))
                .build())
        .sort("$score", true, "$id")
        .limit(10)
        .build();

SearchResp response = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(queryVector))
        .annsField("vector")
        .functionChains(Collections.singletonList(chain))
        .build());
```
