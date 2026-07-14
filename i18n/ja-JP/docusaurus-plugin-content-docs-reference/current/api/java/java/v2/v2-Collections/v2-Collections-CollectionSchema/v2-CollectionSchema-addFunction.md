---
title: "addFunction() | Java | v2"
slug: /java/java/v2-CollectionSchema-addFunction
sidebar_label: "addFunction()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、生データを vector 表現に変換する関数を追加します。 | Java | v2"
type: docx
token: WI76dwejQosQWcxuhkccHOl7nXf
sidebar_position: 4
keywords: 
  - IVF
  - knn
  - Image Search
  - LLMs
  - zilliz
  - zilliz cloud
  - cloud
  - addFunction()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addFunction()

この操作は、生データを vector 表現に変換する関数を追加します。

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

**ビルダーメソッド:**

- `functionType(FunctionType functionType)`

    生データを処理する関数のタイプ。指定可能な値:

    - `FunctionType.BM25`: `VARCHAR` フィールドから sparse embedding を生成するために BM25 アルゴリズムを使用します。

- `name(String name)`

    関数名です。この識別子は、クエリおよび collection 内で関数を参照するために使用されます。

- `inputFieldNames(List<String> inputFieldNames)`

    vector 表現への変換が必要な生データを含むフィールド名です。`FunctionType.BM25` を使用する関数では、このパラメータは 1 つのフィールド名のみ受け付けます。

- `outputFieldNames(List<String> outputFieldNames)`

    生成された embedding が保存されるフィールド名です。これは collection schema で定義された vector フィールドに対応している必要があります。`FunctionType.BM25` を使用する関数では、このパラメータは 1 つのフィールド名のみ受け付けます。

- `description(String description)`

    関数の目的を簡潔に説明します。これは、より大きなプロジェクトでドキュメント化や明確化に役立ち、デフォルトは空文字列です。

**戻り値の型:**

*Function*

**戻り値:**

`Function` オブジェクト

**例外:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

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
