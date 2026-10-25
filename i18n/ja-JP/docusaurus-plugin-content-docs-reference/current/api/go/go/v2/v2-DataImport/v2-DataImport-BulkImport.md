---
title: "BulkImport | Go | v2"
slug: /go/go/v2-DataImport-BulkImport
sidebar_label: "BulkImport"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、RESTful import API を介して Milvus または Zilliz Cloud クラスターに一括インポートジョブを送信します。オブジェクトストレージにすでにステージングされている大規模データセット、またはファイルパスのリストでアクセスできる大規模データセットをロードする必要がある場合に使用します。この呼び出しはジョブ ID を返して直ちに終了します。ジョブの進行状況は `GetImportProgress()` で追跡し、未完了のジョブは `ListImportJobs()` で一覧表示します。 | Go | v2"
type: docx
token: Dgy5deK30oq5pVxoy7lcgt9InPg
sidebar_position: 1
keywords: 
  - 最近傍検索
  - Agentic RAG
  - RAG LLM アーキテクチャ
  - プライベート LLM
  - zilliz
  - zilliz cloud
  - cloud
  - BulkImport
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# BulkImport

この操作は、RESTful import API を介して Milvus または Zilliz Cloud クラスターに一括インポートジョブを送信します。オブジェクトストレージにすでにステージングされている大規模データセット、またはファイルパスのリストでアクセスできる大規模データセットをロードする必要がある場合に使用します。この呼び出しはジョブ ID を返して直ちに終了します。ジョブの進行状況は `GetImportProgress()` で追跡し、未完了のジョブは `ListImportJobs()` で一覧表示します。

<Admonition type="info" title="Notes">

`BulkImport()` は `*milvusclient.Client` のメソッドではなく、`github.com/milvus-io/milvus/client/v3/bulkwriter` 内のパッケージレベルの関数です。REST `/v2/vectordb/jobs/import/create` エンドポイントを直接呼び出すため、Milvus オープンソースクラスター（`NewBulkImportOption` を使用）と Zilliz Cloud（`NewCloudBulkImportOption` を使用）の両方で動作します。

</Admonition>

```go
func BulkImport(ctx context.Context, option *BulkImportOption) (*BulkImportResponse, error)
```

## リクエスト構文\{#request-syntax}

BulkImport() のリクエストを作成します。

```go
option := bulkwriter.NewBulkImportOption(uri, collectionName, files).
    WithPartition(partitionName).
    WithAPIKey(apiKey)

resp, err := bulkwriter.BulkImport(ctx, option)
```

**パラメーター:**

- **ctx** (*context.Context*) -

    キャンセルとデッドラインのためのコンテキストです。HTTP リクエストはこのコンテキストを継承するため、これをキャンセルすると進行中の呼び出しが中断されます。

- **option** ([BulkImportOption](./v2-DataImport-BulkImportOption)) -

    セルフホスト型 Milvus には `NewBulkImportOption()` を、Zilliz Cloud には `NewCloudBulkImportOption()` を使用して作成された、すべての項目が設定済みのインポートオプションです。必須です。

**戻り値の型:**

&ast;*BulkImportResponse, error*

**戻り値:**

`Data.JobID` に割り当てられたジョブ ID を含む `BulkImportResponse` を返します。リクエストをマーシャリングできない場合、HTTP 呼び出しが失敗した場合、またはサーバーがゼロ以外のステータスを返した場合は、エラーを返します。

```go
type BulkImportResponse struct {
    ResponseBase
    Data struct {
        JobID string `json:"jobId"`
    } `json:"data"`
}
```

**パラメーター:**

- **Status** (*int*) -

    `ResponseBase` から継承されます。値が `0` の場合は成功を示し、それ以外の値はエラーを示します。

- **Message** (*string*) -

    `ResponseBase` から継承されます。`Status` が 0 以外の場合の、人が読める形式のエラー説明です。

- **Data.JobID** (*string*) -

    送信された一括インポートジョブに割り当てられる一意の識別子です。完了状況を追跡するには、これを `GetImportProgress()` に渡します。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。よくある失敗には、不正な形式のオプションペイロード、ネットワークエラー、認証の拒否（`WithAPIKey` が正しく設定されていない場合）、およびレスポンスのステータスを通じて通知されるサーバー側のバリデーションエラーが含まれます。

## 例\{#example}

BulkImport() の使用例を示します。

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/bulkwriter"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "http://YOUR_CLUSTER_ENDPOINT"
collectionName := "quick_setup"
files := [][]string{
	{"data/part_001.json"},
	{"data/part_002.json"},
}

option := bulkwriter.NewBulkImportOption(milvusAddr, collectionName, files).
	WithAPIKey("YOUR_CLUSTER_TOKEN")

resp, err := bulkwriter.BulkImport(ctx, option)
if err != nil {
	log.Fatal(err)
}

fmt.Println(resp.Data.JobID)
```
