---
title: "dropCollectionFunction() | Java | v2"
slug: /java/java/v2-Collections-dropCollectionFunction
sidebar_label: "dropCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "出力フィールドを削除せずに、既存の collection から関数定義を削除します。両方を削除するには `dropFunctionField()` を使用します。 | Java | v2"
type: docx
token: K0wedJ57uoHCyXxOFtNc673tnuA
sidebar_position: 33
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollectionFunction()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropCollectionFunction()

出力フィールドを削除せずに、既存の collection から関数定義を削除します。両方を削除するには [`dropFunctionField()`](./v2-Collections-dropFunctionField) を使用します。

```java
public void dropCollectionFunction(DropCollectionFunctionReq request)
```

## リクエスト構文\{#request-syntax}

```java
DropCollectionFunctionReq.builder()
    .collectionName(collectionName)
    .databaseName(databaseName)
    .functionName(functionName)
    .build();
```

**BUILDER メソッド:**

- `collectionName(String collectionName)`

    対象の collection の名前。

- `databaseName(String databaseName)`

    database の名前。省略した場合は現在の database がデフォルトで使用されます。

- `functionName(String functionName)`

    削除する関数定義の名前。

**戻り値:**

*void*

この操作は値を返しません。

**例外:**

- **MilvusClientException**

    リクエストの検証、転送、またはサーバー実行が失敗した場合に発生します。正確な失敗理由については例外メッセージを確認してください。

## 例\{#example}

```java
client.dropCollectionFunction(DropCollectionFunctionReq.builder()
    .collectionName("books")
    .functionName("bm25")
    .build());
```
