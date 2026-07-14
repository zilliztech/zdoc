---
title: "renameCollection() | Java | v2"
slug: /java/java/v2-Collections-renameCollection
sidebar_label: "renameCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は既存のコレクションの名前を変更します。 | Java | v2"
type: docx
token: U7Ipdm0FTo8FCVxaxbZcwMygnWd
sidebar_position: 21
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - renameCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# renameCollection()

この操作は既存のコレクションの名前を変更します。

```java
public void renameCollection(RenameCollectionReq request)
```

## Request Syntax\{#request-syntax}

```java
renameCollection(RenameCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .newCollectionName(String newCollectionName)
    .targetDbName(String targetDbName)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    データベースの名前です。指定しない場合は現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)` -

    対象のコレクションの名前です。

- `newCollectionName(String newCollectionName)` -

    コレクションの新しい名前です。

- `targetDbName(String targetDbName)` -

    対象データベースの名前です。名前変更後のコレクションを別のデータベースに移動する場合に設定します。

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    この操作中にエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.RenameCollectionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Rename collection "test" to "test2"
RenameCollectionReq renameCollectionReq = RenameCollectionReq.builder()
        .collectionName("test")
        .newCollectionName("test2")
        .build();
client.renameCollection(renameCollectionReq);
```
