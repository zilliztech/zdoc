---
title: "addCollectionFunction() | Java | v2"
slug: /java/java/v2-Collections-addCollectionFunction
sidebar_label: "addCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作はコレクションに関数を追加します。関数を使用すると、BM25 スコアリングや埋め込み生成などのカスタム処理ロジックを定義できます。 | Java | v2"
type: docx
token: AIRDdrhZloIQCrxCfc8cvxe4nmh
sidebar_position: 30
keywords: 
  - sentence transformers
  - レコメンダーシステム
  - 情報検索
  - 次元削減
  - zilliz
  - zilliz cloud
  - cloud
  - addCollectionFunction()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addCollectionFunction()

この操作はコレクションに関数を追加します。関数を使用すると、BM25 スコアリングや埋め込み生成などのカスタム処理ロジックを定義できます。

```java
public void addCollectionFunction(AddCollectionFunctionReq request)
```

## Request Syntax\{#request-syntax}

```java
addCollectionFunction(AddCollectionFunctionReq.builder()
    .collectionName(String collectionName)
    .databaseName(String databaseName)
    .function(CreateCollectionReq.Function function)
    .build()
);
```

**BUILDER METHODS:**

- `collectionName(String collectionName)` -

    **[REQUIRED]**

    コレクションの名前。

- `databaseName(String databaseName)` -

    データベースの名前。指定しない場合は現在のデータベースがデフォルトになります。

- `function(CreateCollectionReq.Function function)` -

    **[REQUIRED]**

    追加する関数。`CreateCollectionReq.Function.builder()` を使用して、name、description、functionType、inputFieldNames、outputFieldNames、および params を指定して構築します。

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```java
import io.milvus.v2.service.collection.request.AddCollectionFunctionReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.common.clientenum.FunctionType;

CreateCollectionReq.Function bm25Func = CreateCollectionReq.Function.builder()
    .name("bm25")
    .functionType(FunctionType.BM25)
    .inputFieldNames(Arrays.asList("text"))
    .outputFieldNames(Arrays.asList("sparse_vector"))
    .build();

client.addCollectionFunction(AddCollectionFunctionReq.builder()
    .collectionName("my_collection")
    .function(bm25Func)
    .build());
```
