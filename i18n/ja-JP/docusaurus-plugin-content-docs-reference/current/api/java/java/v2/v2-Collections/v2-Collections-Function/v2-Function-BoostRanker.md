---
title: "BoostRanker | Java | v2"
slug: /java/java/v2-Function-BoostRanker
sidebar_label: "BoostRanker"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "BoostRanker は Function クラスを拡張し、追加のパラメータを提供します。 | Java | v2"
type: docx
token: QO5ldltYOoo5uFxS4ZJc24JWnUh
sidebar_position: 1
keywords: 
  - Milvus とは
  - Milvus データベース
  - Milvus Lite
  - Milvus ベンチマーク
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - BoostRanker
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# BoostRanker

BoostRanker は **Function** クラスを拡張し、追加のパラメータを提供します。

```java
public class BoostRanker extends CreateCollectionReq.Function
```

## Request Syntax\{#request-syntax}

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

**BUILDER METHODS:**

- `name(String name)`

    関数の名前です。この識別子は、クエリや collection 内で関数を参照するために使用されます。

- `description(String description)`

    関数の目的についての簡潔な説明です。これはドキュメント化や大規模プロジェクトでの明確化に役立ち、デフォルトでは空文字列です。

- `inputFieldNames(List<String> inputFieldNames)`

    vector 表現への変換が必要な生データを含むフィールドの名前です。`FunctionType.RERANK` を使用する関数の場合、このパラメータは 1 つのフィールド名のみを受け入れます。

- `params(Map<String, String> params)`

    関数のプロパティを設定するキーと値のペアのセットです。

- `filter(String filter)`

    検索結果エンティティの中からエンティティを一致させるために使用されるフィルタ式です。[Filtering Explained](https://milvus.io/docs/boolean.md) で説明されている任意の有効な基本フィルタ式を使用できます。

    <Admonition type="info" icon="📘" title="注意">

    `==`、`>`、`<` などの基本演算子のみを使用してください。`text_match` や `phrase_match` などの高度な演算子を使用すると、検索パフォーマンスが低下します。

    </Admonition>

- `weight(Float weight)`

    生の検索結果内で一致したエンティティのスコアに乗算される重みです。

    値は浮動小数点数である必要があります。

    - 一致したエンティティの重要性を強調するには、スコアを高める値に設定します。

    - 一致したエンティティの順位を下げるには、このパラメータにスコアを低下させる値を設定します。

- `randomScoreSeed(Long randomScoreSeed)`

    `randomScoreField(String randomScoreField)` と組み合わせて動作し、`0` から `1` の間の値をランダムに生成する random 関数です。 

    疑似乱数生成器（PRNG）を開始するための初期値を指定する必要があります。

- `randomScoreField(String randomScoreField)`

    `randomScoreSeed(Long randomScoreSeed)` と組み合わせて動作し、`0` から `1` の間の値をランダムに生成する random 関数です。 

    乱数生成時のランダム要因として使用される値を持つフィールド名を指定する必要があります。一意の値を持つフィールドであれば十分です。

**RETURN TYPE:**

*BoostRanker*

**RETURNS:**

boost ranker インスタンス。

## Examples:\{#examples}

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;
import io.milvus.v2.service.vector.request.ranker.BoostRanker
import java.util.Collections;

// use the ModelRanker class
BoostRanker boost = BoostRanker.builder()
    .name("xxx_boost")
    .description("boost on xxx")
    .filter("xxx == 2")
    .weight(0.5)
    .randomScoreSeed(123)
    .randomScoreField("id")
    .build()
    
// Instead, you can use the Function class as well
CreateCollectionReq.Function boost = CreateCollectionReq.Function.builder()
    .functionType(FunctionType.RERANK)
    .name("xxx_boost")
    .description("boost on xxx")
    .param("reranker", "boost")
    .param("filter", "xxx == 2")
    .param("weight", "0.5")
    .param("random_score", "{\"seed\": 123, \"field\": \"id\"}")
    .build();
```

