---
title: "GetImportProgressResponse | Go | v2"
slug: /go/go/v2-DataImport-GetImportProgressResponse
sidebar_label: "GetImportProgressResponse"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "`GetImportProgress()` パッケージ関数によって返されるレスポンスを表すクラスです。`ResponseBase` を埋め込み、全体のジョブ統計情報とファイルごとの `Details` スライスの両方を含む `ImportProgressData` を通じて詳細な進捗ペイロードを公開します。 | Go | v2"
type: docx
token: ZasGdw9Szo9TQbxzHlYcLh1Rnyf
sidebar_position: 6
keywords: 
  - 安価な vector database
  - マネージド vector database
  - Pinecone vector database
  - 音声検索
  - zilliz
  - zilliz cloud
  - cloud
  - GetImportProgressResponse
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetImportProgressResponse

このクラスは、`GetImportProgress()` パッケージ関数によって返されるレスポンスを表します。`ResponseBase` を埋め込み、全体のジョブ統計情報とファイルごとの `Details` スライスの両方を含む `ImportProgressData` を通じて詳細な進捗ペイロードを公開します。

```go
type GetImportProgressResponse struct {
    ResponseBase
    Data *ImportProgressData `json:"data"`
}

type ImportProgressData struct {
    CollectionName string                  `json:"collectionName"`
    JobID          string                  `json:"jobId"`
    CompleteTime   string                  `json:"completeTime"`
    State          string                  `json:"state"`
    Progress       int64                   `json:"progress"`
    ImportedRows   int64                   `json:"importedRows"`
    TotalRows      int64                   `json:"totalRows"`
    Reason         string                  `json:"reason"`
    FileSize       int64                   `json:"fileSize"`
    Details        []*ImportProgressDetail `json:"details"`
}

type ImportProgressDetail struct {
    FileName     string `json:"fileName"`
    FileSize     int64  `json:"fileSize"`
    Progress     int64  `json:"progress"`
    CompleteTime string `json:"completeTime"`
    State        string `json:"state"`
    ImportedRows int64  `json:"importedRows"`
    TotalRows    int64  `json:"totalRows"`
}
```

**フィールド:**

- **Status** (*int*) -
`ResponseBase` から継承されます。`0` の値は成功を示します。

- **Message** (*string*) -
`ResponseBase` から継承されます。`Status` が 0 以外の場合のエラー説明です。

- **Data** (*\*ImportProgressData*) -
要求されたジョブの進捗ペイロードです。

**ImportProgressData のフィールド:**

- **CollectionName** (*string*) -
ジョブの対象となる collection です。

- **JobID** (*string*) -
インポートジョブの一意の識別子です。

- **State** (*string*) -
現在のジョブ状態です。一般的な値には `Pending`、`Importing`、`Completed`、`Failed` が含まれます。

- **Progress** (*int64*) -
`[0, 100]` の範囲における全体の完了率です。

- **ImportedRows** (*int64*) -
collection にすでにインポートされた行数です。

- **TotalRows** (*int64*) -
すべてのソースファイルから想定される総行数です。

- **FileSize** (*int64*) -
すべてのソースファイルの合計サイズ（バイト）です。

- **CompleteTime** (*string*) -
ジョブ完了のタイムスタンプです。ジョブが終端状態に達するまでは空です。

- **Reason** (*string*) -
`State == "Failed"` の場合の失敗理由です。それ以外は空です。

- **Details** (*[]\ImportProgressDetail*) -
親フィールドと同じ構造を持つファイルごとの進捗エントリで、それぞれ 1 つのソースファイルに対応します。

