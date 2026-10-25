---
title: "dropSnapshot() | Java | v2"
slug: /java/java/v2-Snapshots-dropSnapshot
sidebar_label: "dropSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションからスナップショットを完全に削除します。 | Java | v2"
type: docx
token: EeWldhw4AoT5WqxO8GgcSfjEnpb
sidebar_position: 3
keywords: 
  - ベクトル検索
  - 音声類似検索
  - Elastic ベクトルデータベース
  - Pinecone vs Milvus
  - zilliz
  - zilliz cloud
  - クラウド
  - dropSnapshot()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropSnapshot()

この操作は、コレクションからスナップショットを完全に削除します。

```java
public void dropSnapshot(DropSnapshotReq request)
```

## リクエスト構文\{#request-syntax}

```java
dropSnapshot(DropSnapshotReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .snapshotName(String snapshotName)
    .build()
)
```

**ビルダーメソッド:**

- `databaseName(String databaseName)`

    コレクションを含むデータベースの名前です。省略した場合、現在のデータベースが使用されます。

- `collectionName(String collectionName)`

    スナップショット操作に関連付けられたコレクションの名前です。

- `snapshotName(String snapshotName)`

    スナップショットの名前です。

**例外:**

- **MilvusClientException**

    必須パラメーターが欠けている場合、数値パラメーターが範囲外の場合、またはサーバーがこの操作に対してエラーを返した場合に、この例外が発生します。

## 例\{#example}

```java
import io.milvus.v2.service.snapshot.request.DropSnapshotReq;

DropSnapshotReq request = DropSnapshotReq.builder()
    .databaseName("default")
    .collectionName("book_chunks")
    .snapshotName("book_chunks_backup")
    .build();

client.dropSnapshot(request);
```
