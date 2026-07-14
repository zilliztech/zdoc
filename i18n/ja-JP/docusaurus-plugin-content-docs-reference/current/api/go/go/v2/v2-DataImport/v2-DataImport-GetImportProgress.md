---
title: "GetImportProgress() | Go | v2"
slug: /go/go/v2-DataImport-GetImportProgress
sidebar_label: "GetImportProgress()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この関数は、RESTful API を介して単一の bulk import ジョブの詳細な進行状況を取得します。`BulkImport()` で送信したジョブを、その `State` が `Completed` または `Failed` に達するまでポーリングするために使用します。レスポンスには、全体の進行状況、インポート済み/想定総行数、ファイルサイズ、およびファイルごとの進行状況の詳細が含まれます。 | Go | v2"
type: docx
token: V05sd0bGjo33Cux0j9DcrNKTndh
sidebar_position: 4
keywords: 
  - 画像検索
  - LLMs
  - 機械学習
  - RAG
  - zilliz
  - zilliz cloud
  - cloud
  - GetImportProgress()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetImportProgress()

この関数は、RESTful API を介して単一の bulk import ジョブの詳細な進行状況を取得します。`BulkImport()` で送信したジョブを、その `State` が `Completed` または `Failed` に達するまでポーリングするために使用します。レスポンスには、全体の進行状況、インポート済み/想定総行数、ファイルサイズ、およびファイルごとの進行状況の詳細が含まれます。

<Admonition type="info" icon="📘" title="注意">

`GetImportProgress()` は `github.com/milvus-io/milvus/client/v2/bulkwriter` のパッケージレベル関数です。REST の `/v2/vectordb/jobs/import/describe` エンドポイントを呼び出し、Milvus オープンソース cluster（`NewGetImportProgressOption` を使用）と Zilliz Cloud（`NewCloudGetImportProgressOption` を使用）の両方で動作します。

</Admonition>

```go
func GetImportProgress(ctx context.Context, option *GetImportProgressOption) (*GetImportProgressResponse, error)
```

## Request Syntax\{#request-syntax}

```go
option := bulkwriter.NewGetImportProgressOption(uri, jobID).
    WithAPIKey(apiKey)

resp, err := bulkwriter.GetImportProgress(ctx, option)
```

**PARAMETERS:**

- **ctx** (*context.Context*) -
キャンセルとデッドラインのためのコンテキストです。HTTP リクエストはこのコンテキストを継承するため、これをキャンセルすると進行中の呼び出しは中止されます。

- **option** (*GetImportProgressOption*) -
セルフホスト型の Milvus には `NewGetImportProgressOption()`、Zilliz Cloud には `NewCloudGetImportProgressOption()` で作成された progress オプションです。`BulkImport()` によって返されたジョブ ID が必要です。必須です。

**RETURN TYPE:**

*\*GetImportProgressResponse, error*

**RETURNS:**

`Data` フィールドに、全体の進行状況、行数、完了時刻、およびファイルごとの `Details` を含む `ImportProgressData` を持つ `GetImportProgressResponse` を返します。リクエストをマーシャリングできない場合、HTTP 呼び出しが失敗した場合、またはサーバーがゼロ以外のステータスを返した場合はエラーを返します。

**EXCEPTIONS:**

- **error**

    失敗の詳細は `err != nil` を確認してください。失敗には、不正なオプション、ネットワークの問題、不明または期限切れのジョブ ID、レスポンスステータスを通じて報告されるサーバー側エラーが含まれます。

## Example\{#example}

```go
import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/milvus-io/milvus/client/v2/bulkwriter"
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
