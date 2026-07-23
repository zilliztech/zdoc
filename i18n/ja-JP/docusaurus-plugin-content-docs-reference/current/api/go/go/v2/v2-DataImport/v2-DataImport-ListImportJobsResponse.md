---
title: "ListImportJobsResponse | Go | v2"
slug: /go/go/v2-DataImport-ListImportJobsResponse
sidebar_label: "ListImportJobsResponse"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "このクラスは、`ListImportJobs()` パッケージ関数によって返されるレスポンスを表します。ステータスフィールド用に `ResponseBase` を埋め込み、ネストされた `ListImportJobData` 構造体を通じてページネーションされたジョブ一覧を公開します。`Data.Records` の各エントリは、1 つの一括インポートジョブを説明する `ImportJobRecord` です。 | Go | v2"
type: docx
token: C6WkdFvLuon9i8xlu3FcomiDn0b
sidebar_position: 9
keywords: 
  - ベクトル検索
  - knn algorithm
  - HNSW
  - 非構造化データとは
  - zilliz
  - zilliz cloud
  - cloud
  - ListImportJobsResponse
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListImportJobsResponse

このクラスは、`ListImportJobs()` パッケージ関数によって返されるレスポンスを表します。ステータスフィールド用に `ResponseBase` を埋め込み、ネストされた `ListImportJobData` 構造体を通じてページネーションされたジョブ一覧を公開します。`Data.Records` の各エントリは、1 つの一括インポートジョブを説明する `ImportJobRecord` です。

```go
type ListImportJobsResponse struct {
    ResponseBase
    Data *ListImportJobData `json:"data"`
}

type ListImportJobData struct {
    Records []*ImportJobRecord `json:"records"`
}

type ImportJobRecord struct {
    JobID          string `json:"jobId"`
    CollectionName string `json:"collectionName"`
    State          string `json:"state"`
    Progress       int64  `json:"progress"`
    Reason         string `json:"reason"`
}
```

**FIELDS:**

- **Status** (*int*) -<br/>
  `ResponseBase` から継承されます。値が `0` の場合は成功を示します。

- **Message** (*string*) -<br/>
  `ResponseBase` から継承されます。`Status` がゼロ以外の場合のエラー説明です。

- **Data.Records** (*[]\*ImportJobRecord*) -<br/>
  現在のページに対して返されるジョブレコードのスライスです。フィルターに一致するジョブがない場合は空になることがあります。

**ImportJobRecord fields:**

- **JobID** (*string*) -<br/>
  インポートジョブの一意の識別子です。

- **CollectionName** (*string*) -<br/>
  ジョブの対象となる collection です。

- **State** (*string*) -<br/>
  現在のジョブ状態です。一般的な値には `Pending`、`Importing`、`Completed`、`Failed` があります。

- **Progress** (*int64*) -<br/>
  完了率を `[0, 100]` の範囲で示します。

- **Reason** (*string*) -<br/>
  `State == "Failed"` の場合の失敗理由です。それ以外の場合は空です。

