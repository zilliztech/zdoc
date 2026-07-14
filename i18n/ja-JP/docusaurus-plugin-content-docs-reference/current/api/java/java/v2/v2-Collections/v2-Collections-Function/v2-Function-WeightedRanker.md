---
title: "WeightedRanker | Java | v2"
slug: /java/java/v2-Function-WeightedRanker
sidebar_label: "WeightedRanker"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "WeightedRanker クラスは Function クラスを拡張し、追加のパラメータを提供します。 | Java | v2"
type: docx
token: V9YUdnfxDoc5Gmx80Wec9P6Sn2d
sidebar_position: 7
keywords: 
  - milvus open source
  - milvus はどのように動作するか
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - WeightedRanker
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# WeightedRanker

**WeightedRanker** クラスは **Function** クラスを拡張し、追加のパラメータを提供します。

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

**BUILDER メソッド:**

- `name(String name)`

    関数の名前です。この識別子は、query および collection 内で関数を参照するために使用されます。

- `description(String description)`

    関数の目的を簡潔に説明します。これは大規模なプロジェクトでドキュメント化や明確化に役立ち、デフォルトは空文字列です。

- `params(Map<String, String> params)`

    関数のプロパティを設定するキーと値のペアのセットです。

- `weights(List<Float> weights)`

    各検索パスに対応する重みの配列です。配列内の各値の範囲は `0` から `1` です。

**戻り値の型:**

*WeightedRanker*

**戻り値:**

重み付きランカーのインスタンス。

## 例:\{#examples}

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;
import io.milvus.v2.service.vector.request.ranker.WeightedRanker
import java.util.Collections;

// use the WeightedRanker class
WeightedRanker.builder()
    .weights([0.4, 0.6])
    .build());
    
// Instead, you can use the Function class as well
CreateCollectionReq.Function rr = CreateCollectionReq.Function.builder()
    .functionType(FunctionType.RERANK)
    .param("strategy", "weighted")
    .param("params", "{\"weights\": [0.4, 0.6]}")
    .build();
```

