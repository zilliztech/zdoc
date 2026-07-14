---
title: "alterCollectionFunction() | Java | v2"
slug: /java/java/v2-Collections-alterCollectionFunction
sidebar_label: "alterCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、コレクション内の既存の関数を新しい関数定義に置き換えることで変更します。 | Java | v2"
type: docx
token: A6Vld2dJToRXs8xhq0wcGdiRnDc
sidebar_position: 31
keywords: 
  - Embedding model
  - image similarity search
  - Context Window
  - Natural language search
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionFunction()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# alterCollectionFunction()

この操作は、コレクション内の既存の関数を新しい関数定義に置き換えることで変更します。

```java
public void alterCollectionFunction(AlterCollectionFunctionReq request)
```

## リクエスト構文\{#request-syntax}

```java
alterCollectionFunction(AlterCollectionFunctionReq.builder()
    .collectionName(String collectionName)
    .databaseName(String databaseName)
    .function(CreateCollectionReq.Function function)
    .build()
);
```

**ビルダーメソッド:**

- `collectionName(String collectionName)` -

    **[REQUIRED]**

    コレクションの名前。

- `databaseName(String databaseName)` -

    データベースの名前。指定しない場合は、現在のデータベースがデフォルトで使用されます。

- `function(CreateCollectionReq.Function function)` -

    **[REQUIRED]**

    既存の関数を置き換える新しい関数定義。

**戻り値:**

*void*

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.service.collection.request.AlterCollectionFunctionReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.common.clientenum.FunctionType;

CreateCollectionReq.Function updatedFunc = CreateCollectionReq.Function.builder()
    .name("bm25")
    .functionType(FunctionType.BM25)
    .inputFieldNames(Arrays.asList("text"))
    .outputFieldNames(Arrays.asList("sparse_vector"))
    .param("bm25_k1", "1.5")
    .param("bm25_b", "0.75")
    .build();

client.alterCollectionFunction(AlterCollectionFunctionReq.builder()
    .collectionName("my_collection")
    .function(updatedFunc)
    .build());
```
