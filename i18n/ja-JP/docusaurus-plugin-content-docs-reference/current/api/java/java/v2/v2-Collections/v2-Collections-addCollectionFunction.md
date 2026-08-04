---
title: "addCollectionFunction() | Java | v2"
slug: /java/java/v2-Collections-addCollectionFunction
sidebar_label: "addCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "既存のコレクションに関数定義を追加します。Milvus 3.0 では、関数の出力フィールドとそのインデックスをまとめて追加する必要がある場合は `addFunctionField()` を使用します。 | Java | v2"
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

既存のコレクションに関数定義を追加します。Milvus 3.0 では、関数の出力フィールドとそのインデックスをまとめて追加する必要がある場合は [`addFunctionField()`](./v2-Collections-addFunctionField) を使用します。

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

    対象のコレクションの名前。

- `databaseName(String databaseName)`

    データベースの名前。省略した場合は現在のデータベースがデフォルトで使用されます。

- `function(CreateCollectionReq.Function function)`

    既存のコレクションフィールドに追加する関数定義。

**RETURNS:**

*void*

この操作は値を返しません。

**EXCEPTIONS:**

- **MilvusClientException**

    リクエストの検証、トランスポート、またはサーバー実行が失敗したときに発生します。正確な失敗理由については例外メッセージを確認してください。

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
