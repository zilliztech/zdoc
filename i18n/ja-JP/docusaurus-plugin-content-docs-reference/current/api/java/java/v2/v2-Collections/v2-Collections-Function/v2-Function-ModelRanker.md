---
title: "ModelRanker | Java | v2"
slug: /java/java/v2-Function-ModelRanker
sidebar_label: "ModelRanker"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "ModelRanker クラスは Function クラスを継承し、追加のパラメータを提供します。 | Java | v2"
type: docx
token: IW5SdBOhUop0P8xBslCc6OHLnse
sidebar_position: 5
keywords: 
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
  - zilliz
  - zilliz cloud
  - cloud
  - ModelRanker
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# ModelRanker

**ModelRanker** クラスは **Function** クラスを継承し、追加のパラメータを提供します。

```java
public class ModelRanker extends CreateCollectionReq.Function
```

## リクエスト構文\{#request-syntax}

```java
ModelRanker.builder()
    .name(String name)
    .description(String description)
    .inputFieldNames(List<String> inputFieldNames)
    .params(Map<String, String> params)
    .provider(String provider)
    .queries(List<String> queries)
    .endpoint(String endpoint)
    .build()
```

**BUILDER メソッド:**

- `name(String name)`

    関数の名前です。この識別子は、query および collection 内で関数を参照するために使用されます。

- `description(String description)`

    関数の目的を簡潔に説明します。これはドキュメント化や大規模なプロジェクトでの明確化に役立ち、デフォルトでは空文字列です。

- `inputFieldNames(List<String> inputFieldNames)`

    vector 表現への変換が必要な生データを含むフィールド名です。`FunctionType.RERANK` を使用する関数では、このパラメータは 1 つのフィールド名のみを受け付けます。

- `params(Map<String, String> params)`

    関数のプロパティを設定するキーと値のペアのセットです。

    - `max_client_batch_size`(int) -

        1 回のバッチで処理するドキュメントの最大数です。値を大きくするとスループットは向上しますが、より多くのメモリが必要になります。デフォルト値は `32` です。

- `provider(String provider)`

    reranking model provider の名前です。使用可能な値については、 を参照してください。

- `queries(List<String> queries)`

    reranking model が関連性スコアを計算するために使用する query 文字列のリストです。query 文字列の数は、検索操作内の query 数と正確に一致している必要があります（テキストの代わりに query vector を使用する場合でも同様です）。そうでない場合、エラーが報告されます。

- `endpoint(String endpoint)`

    model service の URL です。

**戻り値の型:**

*ModelRanker*

**戻り値:**

model ranker インスタンス。

## 例:\{#examples}

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;
import io.milvus.v2.service.vector.request.ranker.ModelRanker
import java.util.Collections;

// use the ModelRanker class
ModelRanker.builder()
    .function("tei")
    .name("TEI ranker")
    .inputFieldNames(Collections.singletonList("document"))
    .provider("tei")
    .queries("[\"machine learning for time series\"]")
    .endpoint("http://model-service:8080")
    .build());
    
// Instead, you can use the Function class as well
CreateCollectionReq.Function rr = CreateCollectionReq.Function.builder()
    .functionType(FunctionType.RERANK)
    .name("semantic_ranker")
    .description("semantic ranker")
    .inputFieldNames(Collections.singletonList("document"))
    .param("reranker", "model")
    .param("provider", "tei")
    .param("queries", "[\"machine learning for time series\"]")
    .param("endpoint", "http://model-service:8080")
    .build();
```

