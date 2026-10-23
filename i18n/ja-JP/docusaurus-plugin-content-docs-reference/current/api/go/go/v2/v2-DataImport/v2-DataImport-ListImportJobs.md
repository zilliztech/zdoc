---
title: "ListImportJobs | Go | v2"
slug: /go/go/v2-DataImport-ListImportJobs
sidebar_label: "ListImportJobs"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、RESTful API を介して指定したコレクションの一括インポートジョブを一覧表示します。進行中および完了したインポートジョブを監視したり、ジョブ履歴をページネーションしたり、コレクション名でフィルタリングしたりするために使用します。レスポンス内の各レコードには、ジョブ ID、現在の状態、進捗率、および失敗理由が含まれます。 | Go | v2"
type: docx
token: IgHEdnojtokdftxqWfrckpZ1nCg
sidebar_position: 7
keywords: 
  - Milvus の仕組み
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - 非構造化データ
  - zilliz
  - zilliz cloud
  - クラウド
  - ListImportJobs
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListImportJobs

この操作は、RESTful API を介して指定したコレクションの一括インポートジョブを一覧表示します。進行中および完了したインポートジョブを監視したり、ジョブ履歴をページネーションしたり、コレクション名でフィルタリングしたりするために使用します。レスポンス内の各レコードには、ジョブ ID、現在の状態、進捗率、および失敗理由が含まれます。

<Admonition type="info" title="Notes">

`ListImportJobs()` は `github.com/milvus-io/milvus/client/v3/bulkwriter` のパッケージレベルの関数です。REST の `/v2/vectordb/jobs/import/list` エンドポイントを呼び出し、Milvus オープンソースクラスターと Zilliz Cloud の両方で動作します。

</Admonition>

```go
func ListImportJobs(ctx context.Context, option *ListImportJobsOption) (*ListImportJobsResponse, error)
```

## リクエスト構文\{#request-syntax}

ListImportJobs() のリクエストを作成します。

```go
option := bulkwriter.NewListImportJobsOption(uri, collectionName).
    WithAPIKey(apiKey).
    WithPageSize(pageSize).
    WithCurrentPage(currentPage)

resp, err := bulkwriter.ListImportJobs(ctx, option)
```

**パラメーター：**

- **ctx** (*context.Context*) -

    キャンセルとデッドラインのためのコンテキストです。HTTP リクエストはこのコンテキストを継承するため、これをキャンセルすると実行中の呼び出しが中止されます。

- **option** ([ListImportJobsOption](./v2-DataImport-ListImportJobsOption)) -

    `NewListImportJobsOption()` で作成される一覧オプションです。`WithCurrentPage()` または `WithPageSize()` で変更しない場合、デフォルトは `CurrentPage: 1, PageSize: 10` です。必須です。

**ビルダーメソッド：**

- `NewListImportJobsOption(uri string, collectionName string)`

    ListImportJobs() のリクエストを作成します。

**戻り値の型：**

&ast;*ListImportJobsResponse, error*

**戻り値：**

`Data.Records` スライスに、ジョブごとに 1 つの `ImportJobRecord` を含む `ListImportJobsResponse` を返します。各レコードには、ジョブ ID、状態、および進捗が含まれます。リクエストをマーシャリングできない場合、HTTP 呼び出しが失敗した場合、またはサーバーがゼロ以外のステータスを返した場合は、エラーを返します。

**パラメーター：**

- **result** (&ast;*ListImportJobsResponse*) -

    ListImportJobs() によって返される &ast;ListImportJobsResponse 値です。

**エラー処理：**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。失敗には、不正な形式のオプション、ネットワークの問題、認証エラー、およびレスポンスステータスを通じて報告されるサーバー側エラーが含まれます。

## 例\{#example}

ListImportJobs() の使用方法を示します。

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
