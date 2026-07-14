---
title: "ListImportJobs() | Go | v2"
slug: /go/go/v2-DataImport-ListImportJobs
sidebar_label: "ListImportJobs()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この関数は、RESTful API を介して指定されたコレクションの一括インポートジョブを一覧表示します。保留中および完了済みのインポートジョブの監視、ジョブ履歴のページネーション、またはコレクション名によるフィルタリングに使用できます。レスポンス内の各レコードには、ジョブ ID、現在の状態、進行率、および失敗理由が含まれます。 | Go | v2"
type: docx
token: YmqKdQyDDo2Yyjx5rkMcQBGvnEg
sidebar_position: 7
keywords: 
  - ANN Search
  - ベクトル埋め込みとは
  - ベクトルデータベースチュートリアル
  - ベクトルデータベースはどのように動作するか
  - zilliz
  - zilliz cloud
  - クラウド
  - ListImportJobs()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListImportJobs()

この関数は、RESTful API を介して指定されたコレクションの一括インポートジョブを一覧表示します。保留中および完了済みのインポートジョブの監視、ジョブ履歴のページネーション、またはコレクション名によるフィルタリングに使用できます。レスポンス内の各レコードには、ジョブ ID、現在の状態、進行率、および失敗理由が含まれます。

<Admonition type="info" icon="📘" title="注意">

`ListImportJobs()` は `github.com/milvus-io/milvus/client/v2/bulkwriter` にあるパッケージレベル関数です。REST `/v2/vectordb/jobs/import/list` エンドポイントを呼び出し、Milvus オープンソースクラスターと Zilliz Cloud の両方で動作します。

</Admonition>

```go
func ListImportJobs(ctx context.Context, option *ListImportJobsOption) (*ListImportJobsResponse, error)
```

## リクエスト構文\{#request-syntax}

```go
option := bulkwriter.NewListImportJobsOption(uri, collectionName).
    WithAPIKey(apiKey).
    WithPageSize(pageSize).
    WithCurrentPage(currentPage)

resp, err := bulkwriter.ListImportJobs(ctx, option)
```

**パラメーター:**

- **ctx** (*context.Context*) -
キャンセルとデッドラインのためのコンテキストです。HTTP リクエストはこのコンテキストを継承するため、これをキャンセルすると進行中の呼び出しは中止されます。

- **option** (*ListImportJobsOption*) -
`NewListImportJobsOption()` で作成される一覧オプションです。`WithCurrentPage()` または `WithPageSize()` で変更しない場合、デフォルトは `CurrentPage: 1, PageSize: 10` です。必須です。

**戻り値の型:**

*\*ListImportJobsResponse, error*

**戻り値:**

`Data.Records` スライスにジョブごとの `ImportJobRecord` を含む `ListImportJobsResponse` を返します。各レコードには、ジョブ ID、状態、進行状況が含まれます。リクエストをマーシャリングできない場合、HTTP 呼び出しが失敗した場合、またはサーバーが非ゼロのステータスを返した場合はエラーを返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。失敗には、不正なオプション、ネットワークの問題、認証エラー、およびレスポンスステータスを通じて報告されるサーバー側エラーが含まれます。

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

option := bulkwriter.NewListImportJobsOption(milvusAddr, collectionName).
	WithAPIKey("YOUR_CLUSTER_TOKEN").
	WithPageSize(20).
	WithCurrentPage(1)

resp, err := bulkwriter.ListImportJobs(ctx, option)
if err != nil {
	log.Fatal(err)
}

for _, job := range resp.Data.Records {
	fmt.Printf("%s\t%s\t%d%%\n", job.JobID, job.State, job.Progress)
}
```
