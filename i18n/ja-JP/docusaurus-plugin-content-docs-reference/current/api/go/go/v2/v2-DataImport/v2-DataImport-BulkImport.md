---
title: "BulkImport() | Go | v2"
slug: /go/go/v2-DataImport-BulkImport
sidebar_label: "BulkImport()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この関数は、RESTful import API を介して Milvus または Zilliz Cloud cluster に bulk import ジョブを送信します。オブジェクトストレージにすでに配置済み、またはファイルパスのリストでアクセス可能な大規模データセットをロードする必要がある場合に使用します。この呼び出しはジョブ ID を返して直ちに終了します。ジョブの進行状況は `GetImportProgress()` で追跡し、保留中のジョブは `ListImportJobs()` で一覧表示できます。 | Go | v2"
type: docx
token: KrkGdWfDqoZjS1xmQM5cA3xGnbE
sidebar_position: 1
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
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

この関数は、RESTful import API を介して Milvus または Zilliz Cloud cluster に bulk import ジョブを送信します。オブジェクトストレージにすでに配置済み、またはファイルパスのリストでアクセス可能な大規模データセットをロードする必要がある場合に使用します。この呼び出しはジョブ ID を返して直ちに終了します。ジョブの進行状況は `GetImportProgress()` で追跡し、保留中のジョブは `ListImportJobs()` で一覧表示できます。

<Admonition type="info" icon="📘" title="注意">

`BulkImport()` は `*milvusclient.Client` のメソッドではなく、`github.com/milvus-io/milvus/client/v2/bulkwriter` 内のパッケージレベル関数です。これは REST `/v2/vectordb/jobs/import/create` エンドポイントを直接利用するため、Milvus オープンソース cluster（`NewBulkImportOption` を使用）と Zilliz Cloud（`NewCloudBulkImportOption` を使用）の両方で動作します。

</Admonition>

```go
func BulkImport(ctx context.Context, option *BulkImportOption) (*BulkImportResponse, error)
```

## Request Syntax\{#request-syntax}

```go
option := bulkwriter.NewBulkImportOption(uri, collectionName, files).
    WithPartition(partitionName).
    WithAPIKey(apiKey)

resp, err := bulkwriter.BulkImport(ctx, option)
```

**PARAMETERS:**

- **ctx** (*context.Context*) -<br/>
  キャンセルとデッドラインのための context です。HTTP リクエストはこの context を継承するため、これをキャンセルすると進行中の呼び出しは中断されます。

- **option** (*BulkImportOption*) -<br/>
  セルフホスト型 Milvus 用に `NewBulkImportOption()`、または Zilliz Cloud 用に `NewCloudBulkImportOption()` で作成された、完全に設定済みの import option です。必須です。

**RETURN TYPE:**

*\*BulkImportResponse, error*

**RETURNS:**

`Data.JobID` に割り当てられたジョブ ID を含む `BulkImportResponse` を返します。リクエストをマーシャリングできない場合、HTTP 呼び出しが失敗した場合、またはサーバーがゼロ以外のステータスを返した場合はエラーを返します。

**EXCEPTIONS:**

- **error**

    失敗の詳細は `err != nil` を確認してください。一般的な失敗には、不正な option ペイロード、ネットワークエラー、認証拒否（`WithAPIKey` が誤って設定されている場合）、およびレスポンスステータスを通じて示されるサーバー側のバリデーションエラーが含まれます。

## Example\{#example}

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
