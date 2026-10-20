---
title: "getRestoreSnapshotState() | Java | v2"
slug: /java/java/v2-Snapshots-getRestoreSnapshotState
sidebar_label: "getRestoreSnapshotState()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、スナップショット復元ジョブの状態と進捗を取得します。 | Java | v2"
type: docx
token: KXdUdGpt7oD3dkxHZcfcIAQBnNg
sidebar_position: 4
keywords: 
  - 画像検索
  - LLMs
  - 機械学習
  - RAG
  - zilliz
  - zilliz cloud
  - cloud
  - getRestoreSnapshotState()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getRestoreSnapshotState()

この操作は、スナップショット復元ジョブの状態と進捗を取得します。

```java
public GetRestoreSnapshotStateResp getRestoreSnapshotState(GetRestoreSnapshotStateReq request)
```

## リクエスト構文\{#request-syntax}

```java
getRestoreSnapshotState(GetRestoreSnapshotStateReq.builder()
    .jobId(Long jobId)
    .build()
)
```

**BUILDER メソッド:**

- `jobId(Long jobId)`

    `restoreSnapshot()` によって返されるスナップショット復元ジョブ ID です。

**戻り値の型:**

*GetRestoreSnapshotStateResp*

**戻り値:**

復元ジョブの状態、進捗、理由、タイミング、およびコレクションメタデータを含むレスポンスです。

**パラメーター:**

- **jobInfo** (*RestoreSnapshotJobInfo*) -

    スナップショット復元ジョブの情報です。ジョブ情報には以下のフィールドが含まれます。

    - **jobId** (*Long*) -

        スナップショット復元ジョブの ID です。

    - **snapshotName** (*String*) -

        復元するスナップショットの名前です。

    - **dbName** (*String*) -

        対象データベースの名前です。

    - **collectionName** (*String*) -

        対象コレクションの名前です。

    - **state** (*String*) -

        復元ジョブの現在の状態です。RestoreSnapshotNone、RestoreSnapshotPending、RestoreSnapshotExecuting、RestoreSnapshotCompleted、または RestoreSnapshotFailed のいずれかです。

    - **progress** (*Integer*) -

        復元ジョブの進捗をパーセンテージで表します。

    - **reason** (*String*) -

        ジョブが失敗した場合の失敗理由です。

    - **startTime** (*Long*) -

        復元ジョブの開始時刻です。

    - **timeCost** (*Long*) -

        復元ジョブの所要時間です。

**例外:**

- **MilvusClientException**

    必須パラメーターが不足している場合、数値パラメーターが範囲外である場合、またはこの操作に対してサーバーがエラーを返した場合に、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.service.snapshot.request.GetRestoreSnapshotStateReq;
import io.milvus.v2.service.snapshot.response.GetRestoreSnapshotStateResp;

GetRestoreSnapshotStateReq request = GetRestoreSnapshotStateReq.builder()
    .jobId(123456789L)
    .build();

GetRestoreSnapshotStateResp response = client.getRestoreSnapshotState(request);
```
