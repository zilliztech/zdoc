---
title: "restoreSnapshot() | Java | v2"
slug: /java/java/v2-Snapshots-restoreSnapshot
sidebar_label: "restoreSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、スナップショットをターゲットコレクションに復元する非同期ジョブを開始します。 | Java | v2"
type: docx
token: SF5wdcArioRIsxxVzNjcgIhJnrc
sidebar_position: 8
keywords: 
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - restoreSnapshot()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# restoreSnapshot()

この操作は、スナップショットをターゲットコレクションに復元する非同期ジョブを開始します。

```java
public RestoreSnapshotResp restoreSnapshot(RestoreSnapshotReq request)
```

## リクエスト構文\{#request-syntax}

```java
restoreSnapshot(RestoreSnapshotReq.builder()
    .snapshotName(String snapshotName)
    .sourceCollectionName(String sourceCollectionName)
    .targetCollectionName(String targetCollectionName)
    .sourceDbName(String sourceDbName)
    .targetDbName(String targetDbName)
    .build()
)
```

**BUILDER メソッド:**

- `snapshotName(String snapshotName)`

    スナップショットの名前。

- `sourceCollectionName(String sourceCollectionName)`

    スナップショットの作成元となったコレクションの名前。

- `targetCollectionName(String targetCollectionName)`

    スナップショットを復元する先のコレクションの名前。

- `sourceDbName(String sourceDbName)`

    ソースコレクションを含むデータベース。省略した場合、現在のデータベースが使用されます。

- `targetDbName(String targetDbName)`

    復元されたコレクションを作成するデータベース。省略した場合、現在のデータベースが使用されます。

**戻り値:**

*RestoreSnapshotResp*

スナップショット復元ジョブ ID を含むレスポンス。

**例外:**

- **MilvusClientException**

    必須パラメータが不足している場合、数値パラメータが範囲外の場合、またはこの操作に対してサーバーがエラーを返した場合に、この例外が発生します。

## 例\{#example}

```java
import io.milvus.v2.service.snapshot.request.RestoreSnapshotReq;
import io.milvus.v2.service.snapshot.response.RestoreSnapshotResp;

RestoreSnapshotReq request = RestoreSnapshotReq.builder()
    .snapshotName("book_chunks_backup")
    .sourceCollectionName("book_chunks")
    .targetCollectionName("book_chunks_restored")
    .sourceDbName("default")
    .targetDbName("default")
    .build();

RestoreSnapshotResp response = client.restoreSnapshot(request);
```
