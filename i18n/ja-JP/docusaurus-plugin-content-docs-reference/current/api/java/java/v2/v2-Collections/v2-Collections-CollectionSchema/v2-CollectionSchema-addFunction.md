---
title: "addFunction() | Java | v2"
slug: /java/java/v2-CollectionSchema-addFunction
sidebar_label: "addFunction()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、生データをベクトル表現に変換する関数を追加します。 | Java | v2"
type: docx
token: WI76dwejQosQWcxuhkccHOl7nXf
sidebar_position: 4
keywords: 
  - IVF
  - knn
  - 画像検索
  - LLMs
  - zilliz
  - zilliz cloud
  - クラウド
  - addFunction()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# addFunction()

この操作は、生データをベクトル表現に変換する関数を追加します。

```java
public CollectionSchema addFunction(Function function)
```

## リクエスト構文\{#request-syntax}

```java
addFunction(Function.builder()
        .functionType(FunctionType functionType)
        .name(String name)
        .inputFieldNames(List<String> inputFieldNames)
        .outputFieldNames(List<String> outputFieldNames)
        .description(String description)
        .build());
```

**ビルダーメソッド：**

- `functionType(FunctionType functionType)`

    生データを処理する関数の型です。指定可能な値は以下の通りです。

    - `FunctionType.BM25`: `VARCHAR` フィールドからスパース埋め込みを生成するために BM25 アルゴリズムを使用します。

- `name(String name)`

    関数の名前です。この識別子は、クエリおよびコレクション内で関数を参照するために使用されます。

- `inputFieldNames(List<String> inputFieldNames)`

    ベクトル表現への変換が必要な生データを含むフィールドの名前です。`FunctionType.BM25` を使用する関数では、このパラメーターはフィールド名を 1 つだけ受け付けます。

- `outputFieldNames(List<String> outputFieldNames)`

    生成された埋め込みが格納されるフィールドの名前です。これは、コレクションスキーマで定義されたベクトルフィールドに対応している必要があります。`FunctionType.BM25` を使用する関数では、このパラメーターはフィールド名を 1 つだけ受け付けます。

- `description(String description)`

    関数の目的の簡単な説明です。これは、ドキュメント作成や大規模プロジェクトでの明確化に役立ちます。デフォルト値は空の文字列です。

**戻り値の型：**

*Function*

**戻り値：**

`Function` オブジェクトです。

**Function** オブジェクトには次のフィールドが含まれます：

**パラメーター：**

- **name** (*String*) -

    関数の名前です。この識別子は、クエリおよびコレクション内で関数を参照するために使用されます。デフォルト値は空の文字列です。

- **description** (*String*) -

    関数の目的の簡単な説明です。デフォルト値は空の文字列です。

- **functionType** (*FunctionType*) -

    関数の型です。たとえば、`FunctionType.BM25` は、`VARCHAR` フィールドからスパース埋め込みを生成するために BM25 アルゴリズムを使用します。

- **inputFieldNames** (*List&lt;String&gt;*) -

    ベクトル表現への変換が必要な生データを含むフィールドの名前です。`FunctionType.BM25` を使用する関数では、フィールド名を 1 つだけ受け付けます。

- **outputFieldNames** (*List&lt;String&gt;*) -

    生成された出力が格納されるフィールドの名前です。これは、コレクションスキーマで定義されたベクトルフィールドに対応している必要があります。`FunctionType.BM25` を使用する関数では、フィールド名を 1 つだけ受け付けます。

- **params** (*Map&lt;String, String&gt;*) -

    BM25 関数のアナライザーパラメーターなど、サーバーに渡される関数固有のパラメーターです。

**例外：**

- **MilvusClientExceptions**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;

import java.util.Collections;

schema.addFunction(Function.builder()
        .functionType(FunctionType.BM25)
        .name("text_bm25_emb")
        .inputFieldNames(Collections.singletonList("text"))
        .outputFieldNames(Collections.singletonList("vector"))
        .build());
```
