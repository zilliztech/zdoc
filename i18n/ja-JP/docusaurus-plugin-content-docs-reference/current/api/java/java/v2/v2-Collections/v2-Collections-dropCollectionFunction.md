---
title: "dropCollectionFunction() | Java | v2"
slug: /java/java/v2-Collections-dropCollectionFunction
sidebar_label: "dropCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、collection から既存の function を削除します。 | Java | v2"
type: docx
token: A6dgdXJdRoxwKAxGB1hctKXvnZg
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

この操作は、collection から既存の function を削除します。

```java
public void dropCollectionFunction(DropCollectionFunctionReq request)
```

## リクエスト構文\{#request-syntax}

```java
dropCollectionFunction(DropCollectionFunctionReq.builder()
    .collectionName(String collectionName)
    .databaseName(String databaseName)
    .functionName(String functionName)
    .build()
);
```

**ビルダーメソッド:**

- `collectionName(String collectionName)` -

    **[必須]**

    collection の名前。

- `databaseName(String databaseName)` -

    database の名前。指定しない場合は、現在の database がデフォルトで使用されます。

- `functionName(String functionName)` -

    **[必須]**

    削除する function の名前。

**戻り値:**

*void*

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.service.collection.request.DropCollectionFunctionReq;

client.dropCollectionFunction(DropCollectionFunctionReq.builder()
    .collectionName("my_collection")
    .functionName("bm25")
    .build());
```
