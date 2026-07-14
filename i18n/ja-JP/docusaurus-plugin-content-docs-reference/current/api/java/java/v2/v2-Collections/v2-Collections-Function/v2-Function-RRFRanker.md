---
title: "RRFRanker | Java | v2"
slug: /java/java/v2-Function-RRFRanker
sidebar_label: "RRFRanker"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "RRFRanker クラスは Function クラスを拡張し、追加のパラメータを提供します。 | Java | v2"
type: docx
token: FuSTdeSCdojDu0xSBEmcYgv9n4g
sidebar_position: 6
keywords: 
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - RRFRanker
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# RRFRanker

**RRFRanker** クラスは **Function** クラスを拡張し、追加のパラメータを提供します。

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

    関数の名前です。この識別子は、クエリおよび collection 内で関数を参照するために使用されます。

- `description(String description)`

    関数の目的の簡単な説明です。これは、より大きなプロジェクトでドキュメント化や明確化に役立ち、デフォルトは空文字列です。

- `params(Map<String, String> params)`

    関数のプロパティを設定するキーと値のペアのセットです。

- `k(int k)`

    ドキュメントのランクの影響を制御する平滑化パラメータです。`k` が大きいほど上位ランクへの感度が低くなります。値の範囲は `1` から `16383` で、デフォルト値は `60` です。 

**戻り値の型:**

*RRFRanker*

**戻り値:**

RRF ranker インスタンスです。

## 例:\{#examples}

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;
import io.milvus.v2.service.vector.request.ranker.RRFRanker
import java.util.Collections;

// use the RRFRanker class
RRFRanker.builder()
    .k(60)
    .build());
    
// Instead, you can use the Function class as well
CreateCollectionReq.Function rr = CreateCollectionReq.Function.builder()
    .functionType(FunctionType.RERANK)
    .param("strategy", "rrf")
    .param("params", "{\"k\": 60}")
    .build();
```

