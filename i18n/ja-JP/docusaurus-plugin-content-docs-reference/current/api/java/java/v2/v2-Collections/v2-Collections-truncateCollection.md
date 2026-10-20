---
title: "truncateCollection() | Java | v2"
slug: /java/java/v2-Collections-truncateCollection
sidebar_label: "truncateCollection()"
beta: false
added_since: v2.6.16
last_modified: v2.6.16
deprecate_since: false
notebook: false
description: "この操作は、コレクションのスキーマ、インデックス、エイリアスを保持したまま、コレクションからすべてのデータを削除します。 | Java | v2"
type: docx
token: JiLLdfLlPoKWL6xEgOAcdCU3nol
sidebar_position: 35
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - ナレッジベース
  - zilliz
  - zilliz cloud
  - クラウド
  - truncateCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# truncateCollection()

この操作は、コレクションのスキーマ、インデックス、エイリアスを保持したまま、コレクションからすべてのデータを削除します。

```java
client.truncateCollection(TruncateCollectionReq request)
```

## リクエスト構文\{#request-syntax}

```java
TruncateCollectionReq.builder()
    .collectionName(String collectionName)
    .databaseName(String databaseName)
    .build()
```

**BUILDER METHODS:**

- `collectionName(String collectionName)` -

    **[REQUIRED]**

    データを削除するコレクションの名前。

- `databaseName(String databaseName)` -

    コレクションを含むデータベースの名前。指定しない場合は、デフォルトのデータベースが使用されます。

**EXCEPTIONS:**

- **MilvusClientException** - 指定されたコレクションが存在しないか、サーバーに到達できません。

## 例\{#example}

```java
import io.milvus.v2.service.collection.request.TruncateCollectionReq;

TruncateCollectionReq req = TruncateCollectionReq.builder()
    .collectionName("my_collection")
    .build();

client.truncateCollection(req);
```
