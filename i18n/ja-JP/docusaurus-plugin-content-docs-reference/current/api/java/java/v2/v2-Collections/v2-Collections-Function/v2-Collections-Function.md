---
title: "Function | Java | v2"
slug: /java/java/v2-Collections-Function
sidebar_label: "Function"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "ユーザーが提供する生データから vector embeddings を生成したり、検索用の reranker を設定したりするための `Function` インスタンスです。 | Java | v2"
type: docx
token: CW06d3MZQo2AzuxIv2ycCFpsn4b
sidebar_position: 3
keywords: 
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
  - zilliz
  - zilliz cloud
  - cloud
  - Function
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# Function

ユーザーが提供する生データから vector embeddings を生成したり、検索用の reranker を設定したりするための `Function` インスタンスです。

```java
io.milvus.v2.service.collection.request.CreateCollectionReq.Function
```

## Constructor\{#constructor}

このコンストラクタは、ユーザーの生データを vector embeddings に変換したり、検索用の reranker を設定したりするための新しい `Function` インスタンスを初期化します。これは、類似検索操作を簡素化する自動化されたプロセスによって実現されます。

```java
CreateCollectionReq.Function.builder()
    .name(String name)
    .description(String description)
    .functionType(FunctionType functionType)
    .inputFieldNames(List<String> inputFieldNames)
    .outputFieldNames(List<String> outputFieldNames)
    .params(Map<String, String> params)
    .build()
```

**BUILDER METHODS:**

- `name(String name)`

    関数の名前です。この識別子は、クエリや collection 内で関数を参照するために使用されます。

- `description(String description)`

    関数の目的を簡潔に説明したものです。これは、より大規模なプロジェクトでのドキュメント化や明確化に役立ち、デフォルトは空文字列です。

- `functionType(FunctionType functionType)`

    生データを処理する関数のタイプです。指定可能な値:

    - `FunctionType.BM25`: `VARCHAR` フィールドから sparse embeddings を生成するために BM25 アルゴリズムを使用します。

- `inputFieldNames(List<String> inputFieldNames)`

    vector 表現への変換が必要な生データを含むフィールドの名前です。`FunctionType.BM25` を使用する関数では、このパラメータには 1 つのフィールド名のみ指定できます。

- `outputFieldNames(List<String> outputFieldNames)`

    生成された embeddings が保存されるフィールドの名前です。これは、collection schema で定義された vector フィールドに対応している必要があります。`FunctionType.BM25` を使用する関数では、このパラメータには 1 つのフィールド名のみ指定できます。

- `params(Map<String, String> params)`

    関数のプロパティを設定するキーと値のペアのセットです。

**RETURN TYPE:**

*Function*

**RETURNS:**

データ挿入時の自動 embedding 生成を容易にする、Milvus collection に登録可能な `Function` オブジェクトです。

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

## Example\{#example}

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;

import java.util.Collections;

CreateCollectionReq.Function.builder()
    .functionType(FunctionType.BM25)
    .name("text_bm25_emb")
    .inputFieldNames(Collections.singletonList("text"))
    .outputFieldNames(Collections.singletonList("vector"))
    .build());
```
