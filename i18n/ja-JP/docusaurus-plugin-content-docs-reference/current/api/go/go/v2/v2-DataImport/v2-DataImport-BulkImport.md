---
title: "BulkImport() | Go | v2"
slug: /go/go/v2-DataImport-BulkImport
sidebar_label: "BulkImport()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この関数は、RESTful import API を介して Milvus または Zilliz Cloud cluster に bulk import ジョブを送信します。すでに object storage にステージングされている、またはファイルパスのリストでアクセス可能な大規模データセットを読み込む必要がある場合に使用します。呼び出しはジョブ ID を返してすぐに完了します。`GetImportProgress()` でジョブの進行状況を追跡し、`ListImportJobs()` で未完了のジョブを一覧表示できます。 | Go | v2"
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

この関数は、RESTful import API を介して Milvus または Zilliz Cloud cluster に bulk import ジョブを送信します。すでに object storage にステージングされている、またはファイルパスのリストでアクセス可能な大規模データセットを読み込む必要がある場合に使用します。呼び出しはジョブ ID を返してすぐに完了します。`GetImportProgress()` でジョブの進行状況を追跡し、`ListImportJobs()` で未完了のジョブを一覧表示できます。

<Admonition type="info" icon="📘" title="注意">

`BulkImport()` は `*milvusclient.Client` のメソッドではなく、`github.com/milvus-io/milvus/client/v2/bulkwriter` のパッケージレベル関数です。これは REST `/v2/vectordb/jobs/import/create` エンドポイントと直接通信するため、Milvus オープンソース cluster（`NewBulkImportOption` を使用）と Zilliz Cloud（`NewCloudBulkImportOption` を使用）の両方で動作します。

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

- **ctx** (*context.Context*) -
キャンセルおよび期限のための context です。HTTP リクエストはこの context を継承するため、これをキャンセルすると進行中の呼び出しは中断されます。

- **option** (*BulkImportOption*) -
セルフホスト型 Milvus 用の `NewBulkImportOption()` または Zilliz Cloud 用の `NewCloudBulkImportOption()` で作成された、完全に設定済みの import option です。必須です。

**戻り値の型:**

*\*BulkImportResponse, error*

**戻り値:**

`Data.JobID` に割り当てられたジョブ ID を含む `BulkImportResponse`。リクエストをマーシャリングできない場合、HTTP 呼び出しが失敗した場合、またはサーバーがゼロ以外のステータスを返した場合はエラーを返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。一般的な失敗には、不正な option ペイロード、ネットワークエラー、認証拒否（`WithAPIKey` が誤って設定されている場合）、およびレスポンスステータスを通じて通知されるサーバー側の検証エラーが含まれます。

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
