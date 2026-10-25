---
title: "listRefreshExternalCollectionJobs() | Java | v2"
slug: /java/java/v2-Management-listRefreshExternalCollectionJobs
sidebar_label: "listRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、すべての外部コレクションリフレッシュジョブを一覧表示し、必要に応じてコレクション名でフィルタリングできます。 | Java | v2"
type: docx
token: P9MFdEHMKoAfshxQhamcWrGknWg
sidebar_position: 30
keywords: 
  - 検索拡張生成
  - 大規模言語モデル
  - ベクトル化
  - k 近傍アルゴリズム
  - zilliz
  - zilliz cloud
  - クラウド
  - listRefreshExternalCollectionJobs()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listRefreshExternalCollectionJobs()

この操作は、すべての外部コレクションリフレッシュジョブを一覧表示し、必要に応じてコレクション名でフィルタリングできます。

```java
public ListRefreshExternalCollectionJobsResp listRefreshExternalCollectionJobs(ListRefreshExternalCollectionJobsReq request)
```

## リクエスト構文\{#request-syntax}

```java
listRefreshExternalCollectionJobs(ListRefreshExternalCollectionJobsReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
);
```

**BUILDER メソッド:**

- `databaseName(String databaseName)` -

    データベースの名前です。指定しない場合は、現在のデータベースがデフォルトになります。

- `collectionName(String collectionName)` -

    フィルタリングに使用するコレクション名です。空の場合、データベース内のすべてのコレクションにわたるジョブが返されます。

**戻り値の型:**

*ListRefreshExternalCollectionJobsResp*

**戻り値:**

**ListRefreshExternalCollectionJobsResp** オブジェクトは、`getJobs()` でアクセスできる `List<RefreshExternalCollectionJobInfo>` をラップします。各ジョブ情報エントリは、**RefreshExternalCollectionJobInfo** オブジェクトのフィールドを公開します。

**パラメーター:**

- **jobs** (*List&lt;RefreshExternalCollectionJobInfo&gt;*) -

    外部コレクションのリフレッシュジョブのリストです。各ジョブは、次のフィールドを持つ **RefreshExternalCollectionJobInfo** オブジェクトです。

    - **jobId** (*long*) -

        リフレッシュジョブの ID です。

    - **collectionName** (*String*) -

        対象コレクションの名前です。

    - **state** (*String*) -

        現在のジョブ状態です（例：`"PENDING"`、`"RUNNING"`、`"SUCCEEDED"`、`"FAILED"`）。

    - **progress** (*int*) -

        完了率（0-100）です。

    - **reason** (*String*) -

        ジョブ状態が `"FAILED"` の場合は失敗理由、それ以外の場合は空です。

    - **externalSource** (*String*) -

        ジョブが使用する外部ソースです。

    - **externalSpec** (*String*) -

        外部データソースの仕様です。

    - **startTime** (*long*) -

        ジョブの開始タイムスタンプ（エポックミリ秒）です。

    - **endTime** (*long*) -

        ジョブの終了タイムスタンプ（エポックミリ秒）です。まだ実行中の場合は 0 です。

**例外:**

- **MilvusClientException**

    この操作の実行中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.service.utility.request.ListRefreshExternalCollectionJobsReq;
import io.milvus.v2.service.utility.response.ListRefreshExternalCollectionJobsResp;
import io.milvus.v2.service.utility.response.RefreshExternalCollectionJobInfo;

ListRefreshExternalCollectionJobsResp resp = client.listRefreshExternalCollectionJobs(
    ListRefreshExternalCollectionJobsReq.builder()
        .collectionName("my_collection")
        .build()
);
for (RefreshExternalCollectionJobInfo job : resp.getJobs()) {
    System.out.println(job.getJobId() + " " + job.getState());
}
```
