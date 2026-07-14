---
title: "listRefreshExternalCollectionJobs() | Java | v2"
slug: /java/java/v2-Management-listRefreshExternalCollectionJobs
sidebar_label: "listRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、必要に応じて collection 名でフィルタリングし、すべての external-collection refresh job を一覧表示します。 | Java | v2"
type: docx
token: P9MFdEHMKoAfshxQhamcWrGknWg
sidebar_position: 28
keywords: 
  - Retrieval Augmented Generation
  - 大規模言語モデル
  - ベクトル化
  - k 近傍法アルゴリズム
  - zilliz
  - zilliz cloud
  - クラウド
  - listRefreshExternalCollectionJobs()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listRefreshExternalCollectionJobs()

この操作は、必要に応じて collection 名でフィルタリングし、すべての external-collection refresh job を一覧表示します。

```java
public ListRefreshExternalCollectionJobsResp listRefreshExternalCollectionJobs(ListRefreshExternalCollectionJobsReq request)
```

## Request Syntax\{#request-syntax}

```java
listRefreshExternalCollectionJobs(ListRefreshExternalCollectionJobsReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    データベースの名前です。指定しない場合は現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)` -

    フィルタリング対象の collection 名です。空の場合、データベース内のすべての collection にまたがる job が返されます。

**RETURNS:**

*ListRefreshExternalCollectionJobsResp*

レスポンスは `getJobs()` を通じてアクセス可能な `List<RefreshExternalCollectionJobInfo>` をラップします。各 job info エントリには `jobId`、`collectionName`、`state`、`progress`、`reason`、`externalSource`、`startTime`、`endTime` が含まれます。これは `getRefreshExternalCollectionProgress()` によって返されるエントリと同じ形式です。

**EXCEPTIONS:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## Example\{#example}

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
