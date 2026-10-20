---
title: "addCollectionFunction() | Java | v2"
slug: /java/java/v2-Collections-addCollectionFunction
sidebar_label: "addCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションに関数定義を追加します。Milvus 3.0 では、関数の出力フィールドとそのインデックスを同時に追加する必要がある場合に addFunctionField() を使用します。 | Java | v2"
type: docx
token: Qbvcd9DG1ofMpuxVdEqcToU1nIb
sidebar_position: 28
keywords: 
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction
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

この操作は、既存のコレクションに関数定義を追加します。Milvus 3.0 では、関数の出力フィールドとそのインデックスを同時に追加する必要がある場合に [addFunctionField()](./v2-Collections-addFunctionField) を使用します。

```java
public void addCollectionFunction(AddCollectionFunctionReq request)
```

## Request Syntax\{#request-syntax}

```java
AddCollectionFunctionReq.builder()
    .collectionName(collectionName)
    .databaseName(databaseName)
    .function(function)
    .build();
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`<br/>
  対象のコレクションの名前です。

- `databaseName(String databaseName)`<br/>
  データベースの名前です。省略した場合、現在のデータベースがデフォルトで使用されます。

- `function(CreateCollectionReq.Function function)`<br/>
  既存のコレクションフィールドに追加する関数定義です。

**EXCEPTIONS:**

- **MilvusClientException**

    リクエスト検証、トランスポート、またはサーバー実行が失敗した場合に発生します。正確な失敗理由については例外メッセージを確認してください。

## Example\{#example}

```java
CreateCollectionReq.Function bm25Function = CreateCollectionReq.Function.builder()
    .name("bm25")
    .functionType(FunctionType.BM25)
    .inputFieldNames(Collections.singletonList("text"))
    .outputFieldNames(Collections.singletonList("sparse"))
    .build();

client.addCollectionFunction(AddCollectionFunctionReq.builder()
    .collectionName("books")
    .function(bm25Function)
    .build());
```
