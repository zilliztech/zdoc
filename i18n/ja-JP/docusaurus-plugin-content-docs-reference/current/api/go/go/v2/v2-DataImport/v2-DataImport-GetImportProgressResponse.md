---
title: "GetImportProgressResponse | Go | v2"
slug: /go/go/v2-DataImport-GetImportProgressResponse
sidebar_label: "GetImportProgressResponse"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "GetImportProgressResponse インスタンスは、`GetImportProgress()` パッケージ関数によって返されるレスポンスです。`ResponseBase` を埋め込み、`ImportProgressData` を通じて詳細な進行状況ペイロードを公開します。これには、ジョブ全体の統計情報と、ファイルごとの `Details` スライスの両方が含まれます。 | Go | v2"
type: docx
token: UATqdiZsKo3HahxZYhQcZp6GnKg
sidebar_position: 6
keywords: 
  - 安価なベクトルデータベース
  - マネージドベクトルデータベース
  - Pinecone ベクトルデータベース
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

GetImportProgressResponse インスタンスは、`GetImportProgress()` パッケージ関数によって返されるレスポンスです。`ResponseBase` を埋め込み、`ImportProgressData` を通じて詳細な進行状況ペイロードを公開します。これには、ジョブ全体の統計情報と、ファイルごとの `Details` スライスの両方が含まれます。

```go
type GetImportProgressResponse struct {
    ResponseBase
    Data *ImportProgressData
}
```

**FIELDS:**

- **Status** (*int*) -

    `ResponseBase` から継承されます。値が `0` の場合は成功を示します。

- **Message** (*string*) -

    `ResponseBase` から継承されます。`Status` が 0 以外の場合のエラー説明です。

- **Data** (&ast;*ImportProgressData*) -

    要求されたジョブの進行状況ペイロードです。**ImportProgressData のフィールド：**

- **CollectionName** (*string*) -

    ジョブが対象とするコレクションです。

- **JobID** (*string*) -

    インポートジョブの一意の識別子です。

- **State** (*string*) -

    現在のジョブ状態です。一般的な値には `Pending`、`Importing`、`Completed`、`Failed` があります。

- **Progress** (*int64*) -

    `[0, 100]` の範囲で示される全体の完了率です。

- **ImportedRows** (*int64*) -

    コレクションにすでにインポートされた行数です。

- **TotalRows** (*int64*) -

    すべてのソースファイルから想定される合計行数です。

- **FileSize** (*int64*) -

    すべてのソースファイルの合計サイズ（バイト単位）です。

- **CompleteTime** (*string*) -

    ジョブの完了タイムスタンプです。ジョブが終端状態に達するまでは空です。

- **Reason** (*string*) -

    `State == "Failed"` の場合の失敗理由です。それ以外の場合は空です。

- **Details** (*[]\ImportProgressDetail*) -

    ファイルごとの進行状況エントリです。親フィールドと同じ構造を持ち、それぞれ1つのソースファイルを対象とします。

## 例\{#example}

GetImportProgressResponse の使用例を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

progress, err := milvusclient.GetImportProgress(ctx, milvusclient.NewGetImportProgressOption("<jobId>"))
if err != nil {
	// handle error
}
fmt.Println(progress.Data.State, progress.Data.ImportedRows, progress.Data.TotalRows)
```
