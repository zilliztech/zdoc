---
title: "GetImportProgress | Go | v2"
slug: /go/go/v2-DataImport-GetImportProgress
sidebar_label: "GetImportProgress"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、RESTful API を介して単一の bulk import ジョブの詳細な進行状況を取得します。`BulkImport()` によって送信されたジョブを、その `State` が `Completed` または `Failed` に達するまでポーリングするために使用します。レスポンスには、全体の進行状況、インポート済み行数と想定行数の合計（imported/expected）、ファイルサイズ、およびファイルごとの進行状況の詳細が含まれます。 | Go | v2"
type: docx
token: XwEZdXtExoaU4IxWu4yc6HiQnph
sidebar_position: 4
keywords: 
  - 大規模言語モデル
  - ベクトル化
  - k 近傍法アルゴリズム
  - ANNS
  - zilliz
  - zilliz cloud
  - cloud
  - GetImportProgress
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetImportProgress

この操作は、RESTful API を介して単一の bulk import ジョブの詳細な進行状況を取得します。`BulkImport()` によって送信されたジョブを、その `State` が `Completed` または `Failed` に達するまでポーリングするために使用します。レスポンスには、全体の進行状況、インポート済み行数と想定行数の合計（imported/expected）、ファイルサイズ、およびファイルごとの進行状況の詳細が含まれます。

<Admonition type="info" title="Notes">

`GetImportProgress()` は、`github.com/milvus-io/milvus/client/v3/bulkwriter` のパッケージレベルの関数です。REST `/v2/vectordb/jobs/import/describe` エンドポイントを呼び出し、Milvus オープンソースクラスター（`NewGetImportProgressOption` を使用）と Zilliz Cloud（`NewCloudGetImportProgressOption` を使用）の両方で動作します。

</Admonition>

```go
func GetImportProgress(ctx context.Context, option *GetImportProgressOption) (*GetImportProgressResponse, error)
```

## リクエスト構文\{#request-syntax}

GetImportProgress() のリクエストを作成します。

```go
option := bulkwriter.NewGetImportProgressOption(uri, jobID).
    WithAPIKey(apiKey)

resp, err := bulkwriter.GetImportProgress(ctx, option)
```

**パラメーター:**

- **ctx** (*context.Context*) -

    キャンセルとデッドラインのためのコンテキストです。HTTP リクエストはこのコンテキストを継承するため、これをキャンセルすると実行中の呼び出しが中断されます。

- **option** ([GetImportProgressOption](./v2-DataImport-GetImportProgressOption)) -

    セルフホスト型 Milvus では `NewGetImportProgressOption()`、Zilliz Cloud では `NewCloudGetImportProgressOption()` で作成された進行状況オプションです。`BulkImport()` が返すジョブ ID が必要です。必須です。

**ビルダーメソッド:**

- `NewGetImportProgressOption(uri string, jobID string)`

    GetImportProgress() のリクエストを作成します。

- `NewCloudGetImportProgressOption(uri string, jobID string, apiKey string, clusterID string)`

    Zilliz Cloud に対して GetImportProgress() のリクエストを作成します。

**戻り値の型:**

&ast;*GetImportProgressResponse, error*

**戻り値:**

`Data` フィールドに、全体の進行状況、行数、完了時刻、およびファイルごとの `Details` を含む `ImportProgressData` を持つ `GetImportProgressResponse` を返します。リクエストをマーシャリングできない場合、HTTP 呼び出しが失敗した場合、またはサーバーがゼロ以外のステータスを返した場合はエラーを返します。

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

**パラメーター:**

- **Status** (*int*) -

    `ResponseBase` から継承されます。値が `0` の場合は成功を示します。

- **Message** (*string*) -

    `ResponseBase` から継承されます。`Status` がゼロ以外の場合のエラー説明です。

- **Data** (&ast;*ImportProgressData*) -

    要求されたジョブの進行状況ペイロードです。**ImportProgressData のフィールド:**。

- **CollectionName** (*string*) -

    ジョブの対象となるコレクションです。

- **JobID** (*string*) -

    インポートジョブの一意の識別子です。

- **State** (*string*) -

    現在のジョブの状態です。一般的な値には `Pending`、`Importing`、`Completed`、`Failed` があります。

- **Progress** (*int64*) -

    `[0, 100]` の範囲の全体的な完了率です。

- **ImportedRows** (*int64*) -

    コレクションにすでにインポートされた行数です。

- **TotalRows** (*int64*) -

    すべてのソースファイルから想定される合計行数です。

- **FileSize** (*int64*) -

    すべてのソースファイルの合計サイズ（バイト単位）です。

- **CompleteTime** (*string*) -

    ジョブの完了タイムスタンプです。ジョブが終了状態に達するまでは空です。

- **Reason** (*string*) -

    `State == "Failed"` の場合の失敗理由です。それ以外の場合は空です。

- **Details** (*[]\ImportProgressDetail*) -

    親フィールドと同じ構造を持ち、それぞれ 1 つのソースファイルを対象とする、ファイルごとの進行状況エントリです。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。失敗には、不正なオプション、ネットワークの問題、不明または期限切れのジョブ ID、およびレスポンスステータスを通じて報告されるサーバー側のエラーが含まれます。

## 例\{#example}

GetImportProgress() の使用例を示します。

```go
import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/milvus-io/milvus/client/v3/bulkwriter"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "http://YOUR_CLUSTER_ENDPOINT"
jobID := "453291002847301"

option := bulkwriter.NewGetImportProgressOption(milvusAddr, jobID).
	WithAPIKey("YOUR_CLUSTER_TOKEN")

for {
	resp, err := bulkwriter.GetImportProgress(ctx, option)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("State=%s Progress=%d%% Rows=%d/%d\n",
		resp.Data.State, resp.Data.Progress, resp.Data.ImportedRows, resp.Data.TotalRows)

	if resp.Data.State == "Completed" || resp.Data.State == "Failed" {
		break
	}
	time.Sleep(2 * time.Second)
}
```
