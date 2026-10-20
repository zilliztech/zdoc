---
title: "getRefreshExternalCollectionProgress() | Java | v2"
slug: /java/java/v2-Management-getRefreshExternalCollectionProgress
sidebar_label: "getRefreshExternalCollectionProgress()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、以前に開始された外部コレクションのリフレッシュジョブの進捗状況と現在の状態を返します。 | Java | v2"
type: docx
token: FzEydqTwRoajhnxZOftcKxKpndg
sidebar_position: 29
keywords: 
  - レキシカル検索
  - 最近傍検索
  - Agentic RAG
  - RAG LLM アーキテクチャ
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

この操作は、以前に開始された外部コレクションのリフレッシュジョブの進捗状況と現在の状態を返します。

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

**ビルダーメソッド：**

- `jobId(long jobId)` -

    **［必須］**

    `refreshExternalCollection()` から返されるジョブ ID です。

**戻り値の型：**

*GetRefreshExternalCollectionProgressResp*

**戻り値：**

**GetRefreshExternalCollectionProgressResp** オブジェクトは、`getJobInfo()` を介してアクセスできる単一の `RefreshExternalCollectionJobInfo` をラップします。ジョブ情報には次のフィールドが含まれます。

**パラメーター：**

- **jobInfo**（*RefreshExternalCollectionJobInfo*） -

    外部コレクションのリフレッシュジョブに関する情報で、次のフィールドが含まれます。

    - **jobId**（*long*） -

        リフレッシュジョブの ID です。

    - **collectionName**（*String*） -

        対象コレクションの名前です。

    - **state**（*String*） -

        現在のジョブ状態（例：`"PENDING"`、`"RUNNING"`、`"SUCCEEDED"`、`"FAILED"`）。

    - **progress**（*int*） -

        完了率（0-100）。

    - **reason**（*String*） -

        ジョブ状態が `"FAILED"` の場合は失敗理由、それ以外の場合は空です。

    - **externalSource**（*String*） -

        ジョブで使用される外部ソースです。

    - **externalSpec**（*String*） -

        外部データソースの仕様です。

    - **startTime**（*long*） -

        ジョブの開始タイムスタンプ（エポックミリ秒）。

    - **endTime**（*long*） -

        ジョブの終了タイムスタンプ（エポックミリ秒）。まだ実行中の場合は 0 です。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

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
