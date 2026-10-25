---
title: "WeightedRanker | Java | v2"
slug: /java/java/v2-Function-WeightedRanker
sidebar_label: "WeightedRanker"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "WeightedRanker インスタンスは、複数の検索パスの重み付きスコアを平均して結果を再スコアリングする再ランク関数であり、Function クラスを追加パラメータで拡張します。 | Java | v2"
type: docx
token: WNqcdscscoj64pxr24jcITJKnLb
sidebar_position: 46
keywords: 
  - Milvus オープンソース
  - Milvus の仕組み
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - zilliz
  - zilliz cloud
  - クラウド
  - WeightedRanker
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# WeightedRanker

WeightedRanker インスタンスは、複数の検索パスの重み付きスコアを平均して結果を再スコアリングする再ランク関数であり、**Function** クラスを追加パラメータで拡張します。

```java
public class WeightedRanker extends CreateCollectionReq.Function
```

## リクエスト構文\{#request-syntax}

```java
WeightedRanker.builder()
    .name(String name)
    .description(String description)
    .functionType(FunctionType functionType)
    .params(Map<String, String> params)
    .weights(List<Float> weights)
    .build()    
```

**BUILDER METHODS:**

- `name(String name)`

    関数の名前です。この識別子は、クエリおよびコレクション内で関数を参照するために使用されます。

- `description(String description)`

    関数の目的を簡潔に説明します。ドキュメント作成時や、大規模なプロジェクトで明確にする際に役立ちます。デフォルトは空の文字列です。

- `params(Map<String, String> params)`

    関数のプロパティを設定するキーと値のペアのセットです。

- `weights(List<Float> weights)`

    各検索パスに対応する重みの配列です。配列内の各値の範囲は `0` から `1` です。

**RETURN TYPE:**

*WeightedRanker*

**RETURNS:**

重み付きランカーのインスタンスです。

**PARAMETERS:**

- **functionType** (*FunctionType*) -

    このランカーの関数タイプです。常に `RERANK` です。

- **weights** (*List&lt;Float&gt;*) -

    検索パスの重みです。各値の範囲は `0` から `1` です。

## 例：\{#examples}

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.ranker.WeightedRanker;

import java.util.Arrays;

// use the WeightedRanker class
WeightedRanker weighted = WeightedRanker.builder()
    .weights(Arrays.asList(0.4f, 0.6f))
    .build();

// Instead, you can use the Function class as well
CreateCollectionReq.Function rr = CreateCollectionReq.Function.builder()
    .functionType(FunctionType.RERANK)
    .param("strategy", "weighted")
    .param("params", "{\"weights\": [0.4, 0.6]}")
    .build();
```
