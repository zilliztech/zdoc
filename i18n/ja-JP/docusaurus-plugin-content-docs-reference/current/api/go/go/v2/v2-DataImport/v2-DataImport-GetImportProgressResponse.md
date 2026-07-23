---
title: "GetImportProgressResponse | Go | v2"
slug: /go/go/v2-DataImport-GetImportProgressResponse
sidebar_label: "GetImportProgressResponse"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "`GetImportProgress()` パッケージ関数によって返されるレスポンスを表すクラスです。`ResponseBase` を埋め込み、全体のジョブ統計情報とファイルごとの `Details` スライスの両方を含む `ImportProgressData` を通じて詳細な進行状況ペイロードを公開します。 | Go | v2"
type: docx
token: ZasGdw9Szo9TQbxzHlYcLh1Rnyf
sidebar_position: 6
keywords: 
  - 安価なベクトルデータベース
  - マネージドベクトルデータベース
  - Pinecone ベクトルデータベース
  - オーディオ検索
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

このクラスは、`GetImportProgress()` パッケージ関数によって返されるレスポンスを表します。`ResponseBase` を埋め込み、全体のジョブ統計情報とファイルごとの `Details` スライスの両方を含む `ImportProgressData` を通じて詳細な進行状況ペイロードを公開します。

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

**FIELDS:**

- **Status** (*int*) -<br/>
  `ResponseBase` から継承されます。値 `0` は成功を示します。

- **Message** (*string*) -<br/>
  `ResponseBase` から継承されます。`Status` が 0 以外の場合のエラー説明です。

- **Data** (*\*ImportProgressData*) -<br/>
  要求されたジョブの進行状況ペイロードです。

**ImportProgressData fields:**

- **CollectionName** (*string*) -<br/>
  ジョブの対象となる collection です。

- **JobID** (*string*) -<br/>
  インポートジョブの一意識別子です。

- **State** (*string*) -<br/>
  現在のジョブ状態です。一般的な値には `Pending`、`Importing`、`Completed`、`Failed` があります。

- **Progress** (*int64*) -<br/>
  `[0, 100]` の範囲で表される全体の完了率です。

- **ImportedRows** (*int64*) -<br/>
  collection にすでにインポートされた行数です。

- **TotalRows** (*int64*) -<br/>
  すべてのソースファイルから想定される合計行数です。

- **FileSize** (*int64*) -<br/>
  すべてのソースファイルの合計サイズ（バイト単位）です。

- **CompleteTime** (*string*) -<br/>
  ジョブ完了時のタイムスタンプです。ジョブが終端状態に達するまでは空です。

- **Reason** (*string*) -<br/>
  `State == "Failed"` の場合の失敗理由です。それ以外の場合は空です。

- **Details** (*[]\ImportProgressDetail*) -<br/>
  各ファイルごとの進行状況エントリです。親フィールドと同じ構造を持ち、それぞれ1つのソースファイルに対応します。

