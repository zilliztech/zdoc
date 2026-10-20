---
title: "BoostRanker | Java | v2"
slug: /java/java/v2-Function-BoostRanker
sidebar_label: "BoostRanker"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "BoostRanker インスタンスは、フィルター式に一致するエンティティのスコアをブーストする再ランク関数であり、Function クラスを追加パラメーターで拡張します。 | Java | v2"
type: docx
token: Gl75dvp4MoxJRAxNsPYcdtunnFc
sidebar_position: 39
keywords: 
  - what is milvus
  - milvus データベース
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - BoostRanker
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# BoostRanker

BoostRanker インスタンスは、フィルター式に一致するエンティティのスコアをブーストする再ランク関数であり、**Function** クラスを追加パラメーターで拡張します。

```java
public class BoostRanker extends CreateCollectionReq.Function
```

## リクエスト構文\{#request-syntax}

```java
BoostRanker.builder()
    .name(String name)
    .description(String description)
    .inputFieldNames(List<String> inputFieldNames)
    .params(Map<String, String> params)
    .filter(String filter)
    .weight(Float weight)
    .randomScoreSeed(Long randomScoreSeed)
    .randomScoreField(String randomScoreField)
    .build()
```

**ビルダーメソッド:**

- `name(String name)`

    関数の名前です。この識別子は、クエリおよびコレクション内で関数を参照するために使用します。

- `description(String description)`

    関数の目的の簡単な説明です。ドキュメント化や大規模プロジェクトでの明確化に役立ち、デフォルトは空の文字列です。

- `inputFieldNames(List<String> inputFieldNames)`

    ベクトル表現への変換が必要な生データを含むフィールドの名前です。`FunctionType.RERANK` を使用する関数では、このパラメーターは 1 つのフィールド名のみを受け入れます。

- `params(Map<String, String> params)`

    関数のプロパティを設定するキーと値のペアのセットです。

- `filter(String filter)`

    検索結果のエンティティの中から一致するものを特定するために使用するフィルター式です。Filtering Explained に記載されている任意の有効な基本フィルター式を使用できます。

    `==`、`>`、`<` などの基本演算子のみを使用してください。`text_match` や `phrase_match` などの高度な演算子を使用すると、検索パフォーマンスが低下します。

- `weight(Float weight)`

    生の検索結果で一致するエンティティのスコアに乗算される重みです。

    値は浮動小数点数である必要があります。

    - 一致するエンティティの重要度を強調するには、スコアを引き上げる値を設定します。

    - 一致するエンティティを降格するには、スコアを下げる値をこのパラメーターに割り当てます。

- `randomScoreSeed(Long randomScoreSeed)`

    `randomScoreField(String randomScoreField)` と連携して、`0` から `1` の間の値をランダムに生成するランダム関数です。

    疑似乱数生成器（PRNG）を開始するための初期値を指定してください。

- `randomScoreField(String randomScoreField)`

    `randomScoreSeed(Long randomScoreSeed)` と連携して、`0` から `1` の間の値をランダムに生成するランダム関数です。

    乱数の生成時にランダム要因として値が使用されるフィールドの名前を指定してください。一意の値を持つフィールドで十分です。

**戻り値の型:**

*BoostRanker*

**戻り値:**

ブーストランカーのインスタンスです。

**パラメーター:**

- **functionType**（*FunctionType*）-

    このランカーの関数タイプです。常に `RERANK` です。

- **filter**（*String*）-

    ブースト対象のエンティティを選択するフィルター式です。

- **weight**（*Float*）-

    ブーストされるエンティティのスコアに適用される重みです。

- **randomScoreSeed**（*Long*）-

    ランダムブーストが有効な場合にランダムスコアに使用されるシードです。

- **randomScoreField**（*String*）-

    ランダムスコアの基準として使用されるフィールドです。

## 例:\{#examples}

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.ranker.BoostRanker;

// use the BoostRanker class
BoostRanker boost = BoostRanker.builder()
    .name("xxx_boost")
    .description("boost on xxx")
    .filter("xxx == 2")
    .weight(0.5f)
    .randomScoreSeed(123L)
    .randomScoreField("id")
    .build();

// Instead, you can use the Function class as well
CreateCollectionReq.Function boostFn = CreateCollectionReq.Function.builder()
    .functionType(FunctionType.RERANK)
    .name("xxx_boost")
    .description("boost on xxx")
    .param("reranker", "boost")
    .param("filter", "xxx == 2")
    .param("weight", "0.5")
    .param("random_score", "{\"seed\": 123, \"field\": \"id\"}")
    .build();
```
