---
title: "getRefreshExternalCollectionProgress() | Java | v2"
slug: /java/java/v2-Management-getRefreshExternalCollectionProgress
sidebar_label: "getRefreshExternalCollectionProgress()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、以前に開始された external collection refresh ジョブの進行状況と現在の状態を返します。 | Java | v2"
type: docx
token: FzEydqTwRoajhnxZOftcKxKpndg
sidebar_position: 27
keywords: 
  - 語彙検索
  - 最近傍探索
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - クラウド
  - getRefreshExternalCollectionProgress()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getRefreshExternalCollectionProgress()

この操作は、以前に開始された external collection refresh ジョブの進行状況と現在の状態を返します。

```java
public GetRefreshExternalCollectionProgressResp getRefreshExternalCollectionProgress(GetRefreshExternalCollectionProgressReq request)
```

## リクエスト構文\{#request-syntax}

```java
getRefreshExternalCollectionProgress(GetRefreshExternalCollectionProgressReq.builder()
    .jobId(long jobId)
    .build()
);
```

**BUILDER メソッド:**

- `jobId(long jobId)` -

    **[REQUIRED]**

    `refreshExternalCollection()` によって返されるジョブ ID。

**戻り値:**

*GetRefreshExternalCollectionProgressResp*

レスポンスは `getJobInfo()` でアクセス可能な単一の `RefreshExternalCollectionJobInfo` をラップします。ジョブ情報のフィールド:

- `jobId` (*long*) - ジョブ識別子。

- `collectionName` (*String*) - 対象コレクション名。

- `state` (*String*) - 現在のジョブ状態（例: `"PENDING"`、`"RUNNING"`、`"SUCCEEDED"`、`"FAILED"`）。

- `progress` (*int*) - 完了率（0～100）。

- `reason` (*String*) - `state` が `"FAILED"` の場合の失敗理由。それ以外の場合は空です。

- `externalSource` (*String*) - ジョブで使用される外部ソース。

- `startTime` (*long*) - ジョブ開始タイムスタンプ（epoch ミリ秒）。

- `endTime` (*long*) - ジョブ終了タイムスタンプ（epoch ミリ秒）。まだ実行中の場合は 0。

**例外:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```java
import io.milvus.v2.service.utility.request.GetRefreshExternalCollectionProgressReq;
import io.milvus.v2.service.utility.response.GetRefreshExternalCollectionProgressResp;
import io.milvus.v2.service.utility.response.RefreshExternalCollectionJobInfo;

GetRefreshExternalCollectionProgressResp resp = client.getRefreshExternalCollectionProgress(
    GetRefreshExternalCollectionProgressReq.builder()
        .jobId(jobId)
        .build()
);
RefreshExternalCollectionJobInfo info = resp.getJobInfo();
System.out.println(info.getState() + " " + info.getProgress() + "%");
```
