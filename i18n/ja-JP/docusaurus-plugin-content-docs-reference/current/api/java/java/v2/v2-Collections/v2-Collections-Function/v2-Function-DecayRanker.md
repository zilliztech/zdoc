---
title: "DecayRanker | Java | v2"
slug: /java/java/v2-Function-DecayRanker
sidebar_label: "DecayRanker"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "DecayRanker クラスは Function クラスを継承し、追加のパラメータを提供します。 | Java | v2"
type: docx
token: QIpldgpB1oP5IYxNSSdcyRNcn1c
sidebar_position: 2
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - vector embeddings とは何か
  - zilliz
  - zilliz cloud
  - cloud
  - DecayRanker
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# DecayRanker

**DecayRanker** クラスは **Function** クラスを継承し、追加のパラメータを提供します。

```java
public class DecayRanker extends CreateCollectionReq.Function
```

## Constructor\{#constructor}

このコンストラクタは、decay ranker インスタンスを作成するための新しい `DecayRanker` インスタンスを初期化します。

```java
DecayRanker.builder()
    .name(String name)
    .description(String description)
    .functionType(FunctionType functionType)
    .inputFieldNames(List<String> inputFieldNames)
    .params(Map<String, String> params)
    .function(String function)
    .origin(Number origin)
    .scale(Number scale)
    .offset(Number offset)
    .decay(Number decay)
    .build();
```

**BUILDER METHODS:**

- `name(String name)`

    関数の名前です。この識別子は、query および collection 内で関数を参照するために使用されます。

- `description(String description)`

    関数の目的を簡潔に説明したものです。これはドキュメント化や大規模プロジェクトでの明確化に役立ち、デフォルトは空文字列です。

- `functionType(FunctionType functionType)`

    生データを処理するための関数タイプです。**DecayRanker** では、これを `FunctionType.RERANK` に設定します。

- `inputFieldNames(List<String> inputFieldNames)`

    vector 表現への変換が必要な生データを含むフィールド名です。`FunctionType.RERANK` を使用する関数では、このパラメータは 1 つのフィールド名のみを受け入れます。

- `params(Map<String, String> params)`

    関数のプロパティを設定するキーと値のペアのセットです。

- `function(String function)`

    作成する decay ranker のタイプです。指定可能な値は `gauss`、`exp`、`linear` です。

- `origin(Number origin)`

    decay スコアが計算される基準点です。この値にある項目は最大の関連性スコアを受け取ります。時間ベースの decay の場合、時間単位は collection データと一致している必要があります。

- `scale(Number scale)`

    関連性が `decay` 値まで低下する距離または時間です。関連性がどれだけ速く低下するかを制御します。時間ベースの decay の場合、時間単位は collection データと一致している必要があります。値が大きいほど関連性の低下は緩やかになり、値が小さいほど急峻になります。

- `offset(Number offset)`

    `origin` の周囲にある「decay しないゾーン」で、この範囲内の項目は完全なスコア（decay score = 1.0）を維持します。

    時間ベースの decay の場合、時間単位は collection データと一致している必要があります。

    `origin` からこの範囲内にある項目は最大の関連性を維持します。

- `decay(Number decay)`

    `scale` 距離におけるスコア値で、カーブの急峻さを制御します。値が低いほど低下カーブは急峻になり、値が高いほど緩やかになります。

    0 から 1 の間でなければなりません。

**RETURN TYPE:**

*DecayRanker*

**RETURNS:**

decay ranker インスタンス。

## Examples:\{#examples}

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;
import io.milvus.v2.service.vector.request.ranker.DecayRanker
import java.util.Collections;

// DecayRanker クラスを使用
DecayRanker.builder()
    .function("gauss")
    .name("time decay")
    .inputFieldNames(Collections.singletonList("timestamp"))
    .origin(1000)
    .scale(10000)
    .offset(24)
    .decay(0.5)
    .build());
    
// 代わりに、Function クラスを使用することもできます
CreateCollectionReq.Function rr = CreateCollectionReq.Function.builder()
    .functionType(FunctionType.RERANK)
    .name("time_decay")
    .description("time decay")
    .inputFieldNames(Collections.singletonList("timestamp"))
    .param("reranker", "decay")
    .param("function", "gauss")
    .param("origin", "1000")
    .param("scale", "10000")
    .param("offset", "24")
    .param("decay", "0.5")
    .build();
```
