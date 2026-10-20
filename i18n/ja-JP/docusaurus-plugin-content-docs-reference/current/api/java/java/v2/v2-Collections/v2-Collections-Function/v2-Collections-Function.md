---
title: "Function | Java | v2"
slug: /java/java/v2-Collections-Function
sidebar_label: "Function"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Function インスタンスは、ユーザーが提供する生データからベクトル埋め込みを生成するため、または検索用のリランカーを設定するために使用されます。 | Java | v2"
type: docx
token: FktXdVmoQoR9pcxSzlgcp3Iknjh
sidebar_position: 1
keywords: 
  - RAG
  - NLP
  - ニューラルネットワーク
  - ディープラーニング
  - zilliz
  - zilliz cloud
  - クラウド
  - Function
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# Function

Function インスタンスは、ユーザーが提供する生データからベクトル埋め込みを生成するため、または検索用のリランカーを設定するために使用されます。

```java
io.milvus.v2.service.collection.request.CreateCollectionReq.Function
```

## コンストラクター\{#constructor}

このコンストラクターは、ユーザーの生データをベクトル埋め込みに変換するため、または検索用のリランカーを設定するために設計された新しい `Function` インスタンスを初期化します。これは、類似検索操作を簡素化する自動化されたプロセスによって実現されます。

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

**ビルダーメソッド：**

- `name(String name)`

    関数の名前です。この識別子は、クエリおよびコレクション内で関数を参照するために使用します。

- `description(String description)`

    関数の目的の簡単な説明です。これは、ドキュメント化や大規模なプロジェクトでの明確化に役立ち、デフォルトは空の文字列です。

- `functionType(FunctionType functionType)`

    生データを処理する関数の型です。指定可能な値：

    - `FunctionType.BM25`：`VARCHAR` フィールドからスパース埋め込みを生成するために BM25 アルゴリズムを使用します。

- `inputFieldNames(List<String> inputFieldNames)`

    ベクトル表現への変換が必要な生データを含むフィールドの名前です。`FunctionType.BM25` を使用する関数では、このパラメーターは 1 つのフィールド名のみを受け付けます。

- `outputFieldNames(List<String> outputFieldNames)`

    生成された埋め込みが格納されるフィールドの名前です。これは、コレクションスキーマで定義されたベクトルフィールドに対応している必要があります。`FunctionType.BM25` を使用する関数では、このパラメーターは 1 つのフィールド名のみを受け付けます。

- `params(Map<String, String> params)`

    関数のプロパティを設定するキーと値のペアのセットです。

**戻り値の型：**

*Function*

**戻り値：**

データ挿入時に自動埋め込み生成を容易にする、Milvus コレクションに登録可能な `Function` オブジェクトです。

**パラメーター：**

- **name** (*String*) -

    関数の名前です。クエリおよびコレクション内で関数を参照するために使用します。

- **description** (*String*) -

    関数の目的の簡単な説明です。デフォルトは空の文字列です。

- **functionType** (*FunctionType*) -

    生データを処理する関数の型です（例：`FunctionType.BM25`）。

- **inputFieldNames** (*List&lt;String&gt;*) -

    ベクトル表現に変換する生データを含むフィールドの名前です。

- **outputFieldNames** (*List&lt;String&gt;*) -

    生成された埋め込みが格納されるベクトルフィールドの名前です。

- **params** (*Map&lt;String, String&gt;*) -

    関数のプロパティを設定するキーと値のペアです。

**例外：**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

import java.util.Collections;

CreateCollectionReq.Function function = CreateCollectionReq.Function.builder()
    .functionType(FunctionType.BM25)
    .name("text_bm25_emb")
    .inputFieldNames(Collections.singletonList("text"))
    .outputFieldNames(Collections.singletonList("vector"))
    .build();
```
