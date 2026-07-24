---
title: "addCollectionFunction() | Java | v2"
slug: /java/java/v2-Collections-addCollectionFunction
sidebar_label: "addCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "既存の collection に関数定義を追加します。Milvus 3.0 では、関数の出力フィールドとその index を一緒に追加する必要がある場合は `addFunctionField()` を使用してください。 | Java | v2"
type: docx
token: Qbvcd9DG1ofMpuxVdEqcToU1nIb
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

既存の collection に関数定義を追加します。Milvus 3.0 では、関数の出力フィールドとその index を一緒に追加する必要がある場合は [`addFunctionField()`](./v2-Collections-addFunctionField) を使用してください。

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

- `collectionName(String collectionName)`

    対象の collection の名前です。

- `databaseName(String databaseName)`

    データベース名です。省略した場合は、現在のデータベースがデフォルトで使用されます。

- `function(CreateCollectionReq.Function function)`

    既存の collection フィールドに追加する関数定義です。

**RETURNS:**

*void*

この操作は値を返しません。

**EXCEPTIONS:**

- **MilvusClientException**

    リクエストの検証、転送、またはサーバー実行が失敗した場合に発生します。正確な失敗理由については、例外メッセージを確認してください。

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
