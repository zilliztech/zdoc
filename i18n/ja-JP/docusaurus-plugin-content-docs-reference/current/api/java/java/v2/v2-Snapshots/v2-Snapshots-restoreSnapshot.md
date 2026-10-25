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
  - LLM-as-a-Judge
  - ハイブリッドベクトル検索
  - 動画の重複排除
  - 動画の類似検索
  - zilliz
  - Zilliz Cloud
  - クラウド
  - restoreSnapshot()
  - javaV230
displayed_sidebar: javaSidebar

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

**ビルダーメソッド：**

- `snapshotName(String snapshotName)`

    スナップショットの名前です。

- `sourceCollectionName(String sourceCollectionName)`

    スナップショットの作成元コレクションの名前です。

- `targetCollectionName(String targetCollectionName)`

    スナップショットの復元先コレクションの名前です。

- `sourceDbName(String sourceDbName)`

    ソースコレクションを含むデータベースです。省略した場合は、現在のデータベースが使用されます。

- `targetDbName(String targetDbName)`

    復元されたコレクションを作成するデータベースです。省略した場合は、現在のデータベースが使用されます。

**戻り値の型：**

*RestoreSnapshotResp*

**戻り値：**

復元スナップショットジョブの ID を含むレスポンスです。

**パラメーター：**

- **jobId** (*Long*) -

    復元スナップショットジョブの ID です。

**例外：**

- **MilvusClientException**

    必須パラメーターが不足している場合、数値パラメーターが範囲外である場合、またはサーバーがこの操作に対してエラーを返した場合に発生します。

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
