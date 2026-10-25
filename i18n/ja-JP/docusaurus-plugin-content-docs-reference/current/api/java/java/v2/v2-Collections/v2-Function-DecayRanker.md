---
title: "DecayRanker | Java | v2"
slug: /java/java/v2-Function-DecayRanker
sidebar_label: "DecayRanker"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "DecayRanker インスタンスは、数値フィールドの値に基づいて検索ランキングを調整するリランク関数であり、追加のパラメーターを使用して Function クラスを拡張します。 | Java | v2"
type: docx
token: Knf4dT9GFopG6Hx89JKcl9CLnWN
sidebar_position: 40
keywords: 
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - zilliz
  - zilliz cloud
  - クラウド
  - DecayRanker
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# DecayRanker

DecayRanker インスタンスは、数値フィールドの値に基づいて検索ランキングを調整するリランク関数であり、追加のパラメーターを使用して **Function** クラスを拡張します。

```java
public class DecayRanker extends CreateCollectionReq.Function
```

## コンストラクター\{#constructor}

このコンストラクターは、新しい DecayRanker インスタンスを初期化します。

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

**ビルダーメソッド:**

- `name(String name)`

    関数の名前です。この識別子は、クエリおよびコレクション内で関数を参照するために使用されます。

- `description(String description)`

    関数の目的を簡潔に説明するものです。ドキュメント化や大規模プロジェクトでの明確化に役立ち、デフォルトは空の文字列です。

- `functionType(FunctionType functionType)`

    生データを処理する関数のタイプです。**DecayRanker** の場合は、これを `FunctionType.RERANK` に設定します。

- `inputFieldNames(List<String> inputFieldNames)`

    ベクトル表現への変換が必要な生データを含むフィールドの名前です。`FunctionType.RERANK` を使用する関数では、このパラメーターは 1 つのフィールド名のみを受け付けます。

- `params(Map<String, String> params)`

    関数のプロパティを構成するキーと値のペアのセットです。

- `function(String function)`

    作成する減衰ランカーのタイプです。指定可能な値は `gauss`、`exp`、`linear` です。

- `origin(Number origin)`

    減衰スコアの計算基準となる参照ポイントです。この値にあるアイテムは最大の関連性スコアを受け取ります。時間ベースの減衰では、時間単位がコレクションデータと一致している必要があります。

- `scale(Number scale)`

    関連性が `decay` の値まで低下する距離または時間です。関連性が低下する速さを制御します。時間ベースの減衰では、時間単位がコレクションデータと一致している必要があります。値が大きいほど関連性の低下が緩やかになり、値が小さいほど急になります。

- `offset(Number offset)`

    `origin` の周囲にある「減衰なしゾーン」で、アイテムは完全なスコア（減衰スコア = 1.0）を維持します。

    時間ベースの減衰では、時間単位がコレクションデータと一致している必要があります。

    `origin` のこの範囲内にあるアイテムは、最大の関連性を維持します。

- `decay(Number decay)`

    曲線の急峻さを制御する、scale 距離でのスコア値です。値が小さいほど低下曲線が急になり、値が大きいほど低下曲線が緩やかになります。

    0 から 1 の間である必要があります。

**戻り値の型:**

*DecayRanker*

**戻り値:**

減衰ランカーインスタンスです。

**パラメーター:**

- **functionType** (*FunctionType*) -

    このランカーの関数タイプです。常に `RERANK` です。

- **function** (*String*) -

    適用する減衰関数です。`gauss`、`exp`、`linear` のいずれかです。

- **origin** (*Number*) -

    減衰スコアの計算基準となる参照ポイントです。

- **offset** (*Number*) -

    スコアが減衰しない `origin` 周辺の範囲です。

- **scale** (*Number*) -

    関連性が `decay` の値まで低下する距離または時間です。

- **decay** (*Number*) -

    関連性が低下する速さを制御する、`scale` 距離での減衰率です。

## 例:\{#examples}

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.ranker.DecayRanker;

import java.util.Collections;

// use the DecayRanker class
DecayRanker decay = DecayRanker.builder()
    .function("gauss")
    .name("time decay")
    .inputFieldNames(Collections.singletonList("timestamp"))
    .origin(1000)
    .scale(10000)
    .offset(24)
    .decay(0.5)
    .build();

// Instead, you can use the Function class as well
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
