---
title: "listRefreshExternalCollectionJobs() | Java | v2"
slug: /java/java/v2-Management-listRefreshExternalCollectionJobs
sidebar_label: "listRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、必要に応じて collection 名でフィルタリングしながら、すべての external-collection 更新ジョブを一覧表示します。 | Java | v2"
type: docx
token: P9MFdEHMKoAfshxQhamcWrGknWg
sidebar_position: 30
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - listRefreshExternalCollectionJobs()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listRefreshExternalCollectionJobs()

この操作は、必要に応じて collection 名でフィルタリングしながら、すべての external-collection 更新ジョブを一覧表示します。

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

    データベースの名前です。指定しない場合は、現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)` -

    フィルタリング対象の collection 名です。空の場合、データベース内のすべての collection にまたがるジョブが返されます。

**戻り値:**

*ListRefreshExternalCollectionJobsResp*

レスポンスは `getJobs()` でアクセス可能な `List<RefreshExternalCollectionJobInfo>` をラップしています。各ジョブ情報エントリは `jobId`、`collectionName`、`state`、`progress`、`reason`、`externalSource`、`startTime`、`endTime` を公開します。これは `getRefreshExternalCollectionProgress()` によって返されるエントリと同じ構造です。

**例外:**

- **MilvusClientException**

    この例外は、この操作の実行中に何らかのエラーが発生した場合に送出されます。

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
