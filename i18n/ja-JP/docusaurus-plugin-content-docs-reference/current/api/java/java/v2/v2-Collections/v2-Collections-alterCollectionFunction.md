---
title: "alterCollectionFunction() | Java | v2"
slug: /java/java/v2-Collections-alterCollectionFunction
sidebar_label: "alterCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存の関数を新しい関数定義に置き換えることで、コレクション内の関数を変更します。 | Java | v2"
type: docx
token: DfZadsub8olf6gx6HIKc3QIVnAg
sidebar_position: 29
keywords: 
  - 埋め込みモデル
  - 画像類似検索
  - コンテキストウィンドウ
  - 自然言語検索
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionFunction()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# alterCollectionFunction()

この操作は、既存の関数を新しい関数定義に置き換えることで、コレクション内の関数を変更します。

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

    **[必須]**

    コレクションの名前です。

- `databaseName(String databaseName)` -

    データベースの名前です。指定しない場合は、現在のデータベースがデフォルトになります。

- `function(CreateCollectionReq.Function function)` -

    **[必須]**

    既存の関数定義を置き換える新しい関数定義です。

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.service.collection.request.AlterCollectionFunctionReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.common.clientenum.FunctionType;
import java.util.Arrays;

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
