---
title: "RRFRanker | Java | v2"
slug: /java/java/v2-Function-RRFRanker
sidebar_label: "RRFRanker"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "RRFRanker インスタンスは、複数の検索結果を Reciprocal Rank Fusion によって統合するリランク関数であり、追加のパラメーターで Function クラスを拡張します。 | Java | v2"
type: docx
token: AVK9dgWG5oqvmgxYkxocGKLqnWb
sidebar_position: 45
keywords: 
  - milvus
  - Zilliz
  - milvus ベクトルデータベース
  - milvus データベース
  - zilliz
  - zilliz cloud
  - クラウド
  - RRFRanker
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# RRFRanker

RRFRanker インスタンスは、Reciprocal Rank Fusion によって複数の検索の結果を統合するリランク関数であり、追加のパラメーターで **Function** クラスを拡張します。

```java
public class RRFRanker extends CreateCollectionReq.Function
```

## リクエスト構文\{#request-syntax}

```java
RRFRanker.builder()
    .name(String name)
    .description(String description)
    .params(Map<String, String> params)
    .k(int k)
    .build()
```

**ビルダーメソッド:**

- `name(String name)`

    関数の名前です。この識別子は、クエリおよびコレクション内で関数を参照するために使用します。

- `description(String description)`

    関数の目的の簡単な説明です。ドキュメント化や大規模プロジェクトでの明確化に役立ち、デフォルトは空の文字列です。

- `params(Map<String, String> params)`

    関数のプロパティを設定するキーと値のペアのセットです。

- `k(int k)`

    文書のランクの影響を制御する平滑化パラメーターです。`k` が大きいほど、上位ランクへの感度が低下します。値の範囲は `1` から `16383` で、デフォルトは `60` です。

**戻り値の型:**

*RRFRanker*

**戻り値:**

RRF ランカーのインスタンスです。

**パラメーター:**

- **functionType** (*FunctionType*) -

    このランカーの関数タイプです。常に `RERANK` です。

- **k** (*int*) -

    文書のランクの影響を制御する平滑化パラメーターで、範囲は `1` から `16383` です。

## 例：\{#examples}

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.ranker.RRFRanker;

// use the RRFRanker class
RRFRanker rrf = RRFRanker.builder()
    .k(60)
    .build();

// Instead, you can use the Function class as well
CreateCollectionReq.Function rr = CreateCollectionReq.Function.builder()
    .functionType(FunctionType.RERANK)
    .param("strategy", "rrf")
    .param("params", "{\"k\": 60}")
    .build();
```
