---
title: "createSnapshot() | Java | v2"
slug: /java/java/v2-Snapshots-createSnapshot
sidebar_label: "createSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションのスナップショットを作成します。 | Java | v2"
type: docx
token: JhCEdppKrowJIqxFusBc2TXsnSg
sidebar_position: 1
keywords: 
  - hnsw algorithm
  - ベクトル類似検索
  - 近似最近傍探索
  - DiskANN
  - zilliz
  - zilliz cloud
  - クラウド
  - createSnapshot()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createSnapshot()

この操作は、コレクションのスナップショットを作成します。

```java
public void createSnapshot(CreateSnapshotReq request)
```

## リクエスト構文\{#request-syntax}

```java
createSnapshot(CreateSnapshotReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .snapshotName(String snapshotName)
    .description(String description)
    .compactionProtectionSeconds(Long compactionProtectionSeconds)
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

- `description(String description)`

    スナップショットを人間が読める形式で説明したものです。

- `compactionProtectionSeconds(Long compactionProtectionSeconds)`

    Compaction からスナップショットを保護する秒数です。保護期間が不要な場合は `0L` を使用します。

**例外:**

- **MilvusClientException**

    必須パラメーターが不足している場合、数値パラメーターが範囲外である場合、またはこの操作に対してサーバーがエラーを返した場合に、この例外が発生します。

## 例\{#example}

```java
import io.milvus.v2.service.snapshot.request.CreateSnapshotReq;

CreateSnapshotReq request = CreateSnapshotReq.builder()
    .databaseName("default")
    .collectionName("book_chunks")
    .snapshotName("book_chunks_backup")
    .description("Backup before schema migration")
    .compactionProtectionSeconds(3600L)
    .build();

client.createSnapshot(request);
```
