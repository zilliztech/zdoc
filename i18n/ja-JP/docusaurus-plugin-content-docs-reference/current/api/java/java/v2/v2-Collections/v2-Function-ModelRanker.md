---
title: "ModelRanker | Java | v2"
slug: /java/java/v2-Function-ModelRanker
sidebar_label: "ModelRanker"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ModelRanker インスタンスは、言語モデルを使用してクエリとドキュメント間の関連性スコアを計算するリランク関数であり、追加のパラメーターで Function クラスを拡張します。 | Java | v2"
type: docx
token: ZKj1dLHd2otxtAxRL33cxVZznDb
sidebar_position: 44
keywords: 
  - ベクトルデータベース比較
  - OpenAI ベクトルデータベース
  - 自然言語処理データベース
  - 低コストのベクトルデータベース
  - zilliz
  - Zilliz Cloud
  - クラウド
  - ModelRanker
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# ModelRanker

ModelRanker インスタンスは、言語モデルを使用してクエリとドキュメント間の関連性スコアを計算するリランク関数であり、追加のパラメーターで **Function** クラスを拡張します。

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

**ビルダーメソッド:**

- `name(String name)`

    関数の名前です。この識別子は、クエリおよびコレクション内で関数を参照するために使用されます。

- `description(String description)`

    関数の目的の簡単な説明です。ドキュメント化や大規模プロジェクトでの明確化に役立ちます。デフォルトは空の文字列です。

- `inputFieldNames(List<String> inputFieldNames)`

    ベクトル表現への変換が必要な生データを含むフィールドの名前です。`FunctionType.RERANK` を使用する関数では、このパラメーターは 1 つのフィールド名のみを受け入れます。

- `params(Map<String, String> params)`

    関数のプロパティを構成するキーと値のペアのセットです。

- `max_client_batch_size`(int) -

    1 回のバッチで処理するドキュメントの最大数です。値を大きくするとスループットが向上しますが、より多くのメモリが必要になります。デフォルト値は `32` です。

- `provider(String provider)`

    リランキングモデルプロバイダーの名前です。指定可能な値については、ニーズに合わせたモデルプロバイダーの選択を参照してください。

- `queries(List<String> queries)`

    リランキングモデルが関連性スコアを計算するために使用するクエリ文字列のリストです。クエリ文字列の数は、検索操作内のクエリの数と完全に一致する必要があります（テキストの代わりにクエリベクトルを使用する場合でも）。一致しない場合は、エラーが報告されます。

- `endpoint(String endpoint)`

    モデルサービスの URL です。

**戻り値の型:**

*ModelRanker*

**戻り値:**

モデルランカーのインスタンスです。

**パラメーター:**

- **functionType** (*FunctionType*) -

    このランカーの関数タイプです。常に `RERANK` です。

- **provider** (*String*) -

    リランキングモデルプロバイダーの名前です（例：`tei` または `vllm`）。

- **queries** (*List&lt;String&gt;*) -

    モデルが関連性スコアを計算するために使用するクエリ文字列です。

- **endpoint** (*String*) -

    デプロイされたリランクモデルサービスの URL です。

## 例:\{#examples}

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.ranker.ModelRanker;

import java.util.Collections;

// use the ModelRanker class
ModelRanker ranker = ModelRanker.builder()
    .name("TEI ranker")
    .inputFieldNames(Collections.singletonList("document"))
    .provider("tei")
    .queries(Collections.singletonList("machine learning for time series"))
    .endpoint("http://model-service:8080")
    .build();

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
