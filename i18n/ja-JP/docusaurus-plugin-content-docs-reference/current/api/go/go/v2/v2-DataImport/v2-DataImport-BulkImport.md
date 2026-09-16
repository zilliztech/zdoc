---
title: "BulkImport() | Go | v2"
slug: /go/go/v2-DataImport-BulkImport
sidebar_label: "BulkImport()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この関数は、RESTful import API を介して Milvus または Zilliz Cloud クラスターに一括インポートジョブを送信します。オブジェクトストレージにすでにステージングされている大規模データセット、またはファイルパスのリストでアクセスできる大規模データセットをロードする必要がある場合に使用します。この呼び出しはジョブ ID を返して直ちに終了します。ジョブの進行状況は `GetImportProgress()` で追跡し、未完了のジョブは `ListImportJobs()` で一覧表示します。 | Go | v2"
type: docx
token: KrkGdWfDqoZjS1xmQM5cA3xGnbE
sidebar_position: 1
keywords: 
  - Elastic ベクトルデータベース
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy ベクトル検索
  - zilliz
  - zilliz cloud
  - cloud
  - BulkImport()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# BulkImport()

この関数は、RESTful import API を介して Milvus または Zilliz Cloud クラスターに一括インポートジョブを送信します。オブジェクトストレージにすでにステージングされている大規模データセット、またはファイルパスのリストでアクセスできる大規模データセットをロードする必要がある場合に使用します。この呼び出しはジョブ ID を返して直ちに終了します。ジョブの進行状況は `GetImportProgress()` で追跡し、未完了のジョブは `ListImportJobs()` で一覧表示します。

<Admonition type="info" title="Notes">

`BulkImport()` は `*milvusclient.Client` のメソッドではなく、`github.com/milvus-io/milvus/client/v2/bulkwriter` 内のパッケージレベルの関数です。REST `/v2/vectordb/jobs/import/create` エンドポイントを直接呼び出すため、Milvus オープンソースクラスター（`NewBulkImportOption` を使用）と Zilliz Cloud（`NewCloudBulkImportOption` を使用）の両方で動作します。

</Admonition>

```go
func BulkImport(ctx context.Context, option *BulkImportOption) (*BulkImportResponse, error)
```

## リクエスト構文\{#request-syntax}

```go
option := bulkwriter.NewBulkImportOption(uri, collectionName, files).
    WithPartition(partitionName).
    WithAPIKey(apiKey)

resp, err := bulkwriter.BulkImport(ctx, option)
```

**パラメーター:**

- **ctx** (*context.Context*) -<br/>
  キャンセルとデッドラインのためのコンテキストです。HTTP リクエストはこのコンテキストを継承するため、これをキャンセルすると進行中の呼び出しが中断されます。

- **option** (*BulkImportOption*) -<br/>
  セルフホスト型 Milvus には `NewBulkImportOption()` を、Zilliz Cloud には `NewCloudBulkImportOption()` を使用して作成された、すべての項目が設定済みのインポートオプションです。必須です。

**戻り値の型:**

&lt;em>\</em>BulkImportResponse, error&ast;

**戻り値:**

`Data.JobID` に割り当てられたジョブ ID を含む `BulkImportResponse` を返します。リクエストをマーシャリングできない場合、HTTP 呼び出しが失敗した場合、またはサーバーがゼロ以外のステータスを返した場合は、エラーを返します。

**例外:**

- **error**

    失敗の詳細については、`err != nil` を確認してください。よくある失敗には、不正な形式のオプションペイロード、ネットワークエラー、認証の拒否（`WithAPIKey` が正しく設定されていない場合）、およびレスポンスのステータスを通じて通知されるサーバー側のバリデーションエラーが含まれます。

## 例\{#example}

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v2/bulkwriter"
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
