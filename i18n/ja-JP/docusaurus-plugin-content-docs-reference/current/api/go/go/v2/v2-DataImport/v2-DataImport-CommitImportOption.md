---
title: "CommitImportOption | Go | v2"
slug: /go/go/v2-DataImport-CommitImportOption
sidebar_label: "CommitImportOption"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "CommitImportOption インスタンスは、RESTful API を介して一括インポートジョブをコミットするリクエストを構成します。セルフホスト型 Milvus では `NewCommitImportOption()`、Zilliz Cloud では `NewCloudCommitImportOption()` を使用して構築します。認可トークンを追加するには `WithAPIKey()` をチェーンします。 | Go | v2"
type: docx
token: BS6adI4NSoFJgyxp7dDcSbitnnb
sidebar_position: 14
keywords: 
  - 音声類似検索
  - Elastic ベクトルデータベース
  - Pinecone と Milvus の比較
  - Chroma と Milvus の比較
  - zilliz
  - zilliz cloud
  - クラウド
  - CommitImportOption
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CommitImportOption

CommitImportOption インスタンスは、RESTful API を介して一括インポートジョブをコミットするリクエストを構成します。セルフホスト型 Milvus では `NewCommitImportOption()`、Zilliz Cloud では `NewCloudCommitImportOption()` を使用して構築します。認可トークンを追加するには `WithAPIKey()` をチェーンします。

```go
type CommitImportOption struct {
    URL string
    JobID string
    ClusterID string
    APIKey string
}
```

**FIELDS:**

- **URL** (*string*) -

    Milvus または Zilliz Cloud クラスターのベース URL です。パスは含めないでください。関数が自動的に `/v2/vectordb/jobs/import/commit` を追加します。

- **JobID** (*string*) -

    コミットするインポートジョブの一意の識別子です。`BulkImport()` から返される値を渡します。必須です。

- **ClusterID** (*string*) -

    Zilliz Cloud クラスター ID です。任意です。クラウドインポートでのみ使用されます。

- **APIKey** (*string*) -

    `Bearer` ヘッダーとして送信される認可トークンです。任意です。サーバーでトークンベース認証が強制されている場合は必須です。

**BUILDER METHODS:**

- `WithAPIKey(key string)`

    これは、`Bearer` ヘッダーとして送信される認可トークンを設定します。

- `NewCommitImportOption(uri string, jobID string)`

    CommitImport() のリクエストを作成します。

- `NewCloudCommitImportOption(uri string, jobID string, apiKey string, clusterID string)`

    Zilliz Cloud に対して CommitImport() のリクエストを作成します。

**METHODS:**

- `GetRequest() ([]byte, error)`

## 例\{#example}

CommitImportOption の使用例を示します。

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

err := cli.CommitImport(ctx, milvusclient.NewCommitImportOption("<jobId>", "https://example.com/rows.json"))
if err != nil {
	// handle error
}
```
