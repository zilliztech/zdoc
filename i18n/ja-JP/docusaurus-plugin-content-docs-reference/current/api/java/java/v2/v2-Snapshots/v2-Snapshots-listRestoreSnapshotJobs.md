---
title: "listRestoreSnapshotJobs() | Java | v2"
slug: /java/java/v2-Snapshots-listRestoreSnapshotJobs
sidebar_label: "listRestoreSnapshotJobs()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、必要に応じてデータベースとコレクションの範囲に限定して、復元スナップショットジョブを一覧表示します。 | Java | v2"
type: docx
token: I98vddTeco48kYxHEkOccG9ynYe
sidebar_position: 5
keywords: 
  - LLM ハルシネーション
  - ハイブリッド検索
  - レキシカル検索
  - 最近傍検索
  - zilliz
  - zilliz cloud
  - クラウド
  - listRestoreSnapshotJobs()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listRestoreSnapshotJobs()

この操作は、必要に応じてデータベースとコレクションの範囲に限定して、復元スナップショットジョブを一覧表示します。

```java
public ListRestoreSnapshotJobsResp listRestoreSnapshotJobs(ListRestoreSnapshotJobsReq request)
```

## リクエスト構文\{#request-syntax}

```java
listRestoreSnapshotJobs(ListRestoreSnapshotJobsReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
)
```

**BUILDER メソッド:**

- `databaseName(String databaseName)`

    コレクションを含むデータベースの名前です。省略した場合は、現在のデータベースが使用されます。

- `collectionName(String collectionName)`

    スナップショット操作に関連付けられたコレクションの名前です。

**戻り値の型:**

*ListRestoreSnapshotJobsResp*

**戻り値:**

リクエストフィルターに一致する復元スナップショットジョブを含むレスポンスです。

**パラメーター:**

- **jobs** (*List&lt;RestoreSnapshotJobInfo&gt;*) -

    復元スナップショットジョブのリストです。各ジョブは、以下のフィールドを含む **RestoreSnapshotJobInfo** オブジェクトです。

    - **jobId** (*Long*) -

        復元スナップショットジョブの ID です。

    - **snapshotName** (*String*) -

        復元対象のスナップショットの名前です。

    - **dbName** (*String*) -

        対象データベースの名前です。

    - **collectionName** (*String*) -

        対象コレクションの名前です。

    - **state** (*String*) -

        復元ジョブの現在の状態です。値は RestoreSnapshotNone、RestoreSnapshotPending、RestoreSnapshotExecuting、RestoreSnapshotCompleted、RestoreSnapshotFailed のいずれかです。

    - **progress** (*Integer*) -

        復元ジョブの進行状況をパーセンテージで示します。

    - **reason** (*String*) -

        ジョブが失敗した場合の失敗理由です。

    - **startTime** (*Long*) -

        復元ジョブの開始時刻です。

    - **timeCost** (*Long*) -

        復元ジョブの所要時間です。

**例外:**

- **MilvusClientException**

    必須パラメーターが不足している場合、数値パラメーターが範囲外の場合、またはこの操作に対してサーバーがエラーを返した場合に、この例外が発生します。

## 例\{#example}

```java
import io.milvus.v2.service.snapshot.request.ListRestoreSnapshotJobsReq;
import io.milvus.v2.service.snapshot.response.ListRestoreSnapshotJobsResp;

ListRestoreSnapshotJobsReq request = ListRestoreSnapshotJobsReq.builder()
    .databaseName("default")
    .collectionName("book_chunks")
    .build();

ListRestoreSnapshotJobsResp response = client.listRestoreSnapshotJobs(request);
```
