---
title: "ListImportJobsResponse | Go | v2"
slug: /go/go/v2-DataImport-ListImportJobsResponse
sidebar_label: "ListImportJobsResponse"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "`ListImportJobs()` パッケージ関数によって返されるレスポンスを表すクラスです。ステータスフィールドのために `ResponseBase` を埋め込み、ネストされた `ListImportJobData` 構造体を通じてページ分割されたジョブリストを公開します。`Data.Records` の各エントリは、1 つの一括インポートジョブを記述する `ImportJobRecord` です。 | Go | v2"
type: docx
token: C6WkdFvLuon9i8xlu3FcomiDn0b
sidebar_position: 9
keywords: 
  - ベクトル検索
  - knn アルゴリズム
  - HNSW
  - 非構造化データとは
  - zilliz
  - zilliz cloud
  - クラウド
  - ListImportJobsResponse
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListImportJobsResponse

このクラスは、`ListImportJobs()` パッケージ関数によって返されるレスポンスを表します。ステータスフィールドのために `ResponseBase` を埋め込み、ネストされた `ListImportJobData` 構造体を通じてページ分割されたジョブリストを公開します。`Data.Records` の各エントリは、1 つの一括インポートジョブを記述する `ImportJobRecord` です。

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

**フィールド:**

- **Status** (*int*) -<br/>
  `ResponseBase` から継承されます。値が `0` の場合は成功を示します。

- **Message** (*string*) -<br/>
  `ResponseBase` から継承されます。`Status` が 0 以外の場合のエラー説明です。

- **Data.Records** (&lt;em>[]\</em>ImportJobRecord&ast;) -<br/>
  現在のページに対して返されるジョブレコードのスライスです。フィルターに一致するジョブがない場合は空になることがあります。

**ImportJobRecord のフィールド:**

- **JobID** (*string*) -<br/>
  インポートジョブの一意の識別子です。

- **CollectionName** (*string*) -<br/>
  ジョブが対象とするコレクションです。

- **State** (*string*) -<br/>
  現在のジョブ状態です。一般的な値には `Pending`、`Importing`、`Completed`、`Failed` があります。

- **Progress** (*int64*) -<br/>
  `[0, 100]` の範囲の完了率です。

- **Reason** (*string*) -<br/>
  `State == "Failed"` の場合の失敗理由です。それ以外の場合は空です。
