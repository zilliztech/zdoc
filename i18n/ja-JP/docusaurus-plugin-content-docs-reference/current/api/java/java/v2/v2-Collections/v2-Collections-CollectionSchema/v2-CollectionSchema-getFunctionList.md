---
title: "getFunctionList() | Java | v2"
slug: /java/java/v2-CollectionSchema-getFunctionList
sidebar_label: "getFunctionList()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションスキーマで定義された関数のリストを返します。 | Java | v2"
type: docx
token: UJg8dnXiUoB6FnxanBicIzcLnsb
sidebar_position: 6
keywords: 
  - 埋め込みモデル
  - 画像類似検索
  - コンテキストウィンドウ
  - 自然言語検索
  - zilliz
  - zilliz cloud
  - クラウド
  - getFunctionList()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getFunctionList()

この操作は、コレクションスキーマで定義された関数のリストを返します。

```java
public List<CreateCollectionReq.Function> getFunctionList()
```

**戻り値の型：**

*List&lt;CreateCollectionReq.Function&gt;*

**戻り値：**

**CreateCollectionReq.Function** オブジェクトのリストです。各 **CreateCollectionReq.Function** オブジェクトには、以下のフィールドが含まれます：

**パラメーター：**

- **name** (*String*) -

    関数の名前です。この識別子は、クエリおよびコレクション内で関数を参照するために使用されます。デフォルトは空の文字列です。

- **description** (*String*) -

    関数の目的の簡単な説明です。デフォルトは空の文字列です。

- **functionType** (*FunctionType*) -

    関数の型です。たとえば、`FunctionType.BM25` は BM25 アルゴリズムを使用して、`VARCHAR` フィールドからスパース埋め込みを生成します。

- **inputFieldNames** (*List&lt;String&gt;*) -

    ベクトル表現への変換が必要な生データを含むフィールドの名前です。`FunctionType.BM25` を使用する関数では、フィールド名を 1つだけ受け入れます。

- **outputFieldNames** (*List&lt;String&gt;*) -

    生成された出力が格納されるフィールドの名前です。これは、コレクションスキーマで定義されたベクトルフィールドに対応している必要があります。`FunctionType.BM25` を使用する関数では、フィールド名を 1つだけ受け入れます。

- **params** (*Map&lt;String, String&gt;*) -

    BM25 関数のアナライザーパラメーターなど、サーバーに渡される関数固有のパラメーターです。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
CollectionSchema schema = CollectionSchema.builder().build();
List<CreateCollectionReq.Function> functions = schema.getFunctionList();
```
