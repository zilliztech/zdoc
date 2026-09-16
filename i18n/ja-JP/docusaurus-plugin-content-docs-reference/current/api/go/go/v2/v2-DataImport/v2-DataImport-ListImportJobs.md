---
title: "ListImportJobs() | Go | v2"
slug: /go/go/v2-DataImport-ListImportJobs
sidebar_label: "ListImportJobs()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この関数は、RESTful API を介して指定したコレクションの一括インポートジョブを一覧表示します。この関数を使用して、進行中および完了したインポートジョブを監視し、ジョブ履歴をページネーションし、またはコレクション名でフィルタリングできます。レスポンス内の各レコードには、ジョブ ID、現在の状態、進捗率、および失敗理由が含まれます。 | Go | v2"
type: docx
token: YmqKdQyDDo2Yyjx5rkMcQBGvnEg
sidebar_position: 7
keywords: 
  - ANN 検索
  - ベクトル埋め込みとは
  - ベクトルデータベースのチュートリアル
  - ベクトルデータベースの仕組み
  - zilliz
  - zilliz cloud
  - cloud
  - ListImportJobs()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListImportJobs()

この関数は、RESTful API を介して指定したコレクションの一括インポートジョブを一覧表示します。この関数を使用して、進行中および完了したインポートジョブを監視し、ジョブ履歴をページネーションし、またはコレクション名でフィルタリングできます。レスポンス内の各レコードには、ジョブ ID、現在の状態、進捗率、および失敗理由が含まれます。

<Admonition type="info" title="Notes">

`ListImportJobs()` は `github.com/milvus-io/milvus/client/v2/bulkwriter` のパッケージレベルの関数です。REST `/v2/vectordb/jobs/import/list` エンドポイントを呼び出し、Milvus オープンソースクラスターと Zilliz Cloud の両方で動作します。

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

- **ctx** (*context.Context*) -<br/>
  キャンセルおよびデッドラインのためのコンテキストです。HTTP リクエストはこのコンテキストを継承するため、これをキャンセルすると進行中の呼び出しは中止されます。

- **option** (*ListImportJobsOption*) -<br/>
  `NewListImportJobsOption()` で作成される一覧オプションです。`WithCurrentPage()` または `WithPageSize()` で変更しない場合、デフォルトは `CurrentPage: 1, PageSize: 10` です。必須です。

**戻り値の型:**

&lt;em>\</em>ListImportJobsResponse, error&ast;

**戻り値:**

`Data.Records` スライスに、ジョブごとに 1 つの `ImportJobRecord` を含む `ListImportJobsResponse` を返します。各レコードには、ジョブ ID、状態、進捗が含まれます。リクエストをマーシャリングできない場合、HTTP 呼び出しが失敗した場合、またはサーバーがゼロ以外のステータスを返した場合はエラーを返します。

**例外:**

- **error**

    失敗の詳細については、`err != nil` を確認してください。失敗には、不正なオプション、ネットワークの問題、認証エラー、およびレスポンスステータスを通じて報告されるサーバー側エラーが含まれます。

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
