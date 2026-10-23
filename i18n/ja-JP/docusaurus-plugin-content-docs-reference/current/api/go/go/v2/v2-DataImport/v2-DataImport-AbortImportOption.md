---
title: "AbortImportOption | Go | v2"
slug: /go/go/v2-DataImport-AbortImportOption
sidebar_label: "AbortImportOption"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "AbortImportOption インスタンスは、RESTful API を介して一括インポートジョブを中断するリクエストを構成します。 | Go | v2"
type: docx
token: DJ3VdUmf7o3QCdx1mTecsDaunHf
sidebar_position: 11
keywords: 
  - レコメンダーシステム
  - 情報検索
  - 次元削減
  - HNSW アルゴリズム
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - AbortImportOption
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AbortImportOption

AbortImportOption インスタンスは、RESTful API を介して一括インポートジョブを中断するリクエストを構成します。

<Admonition type="info" title="Notes">

セルフホスト型 Milvus の場合は `NewAbortImportOption()` で、Zilliz Cloud の場合は `NewCloudAbortImportOption()` で構築します。

</Admonition>

<Admonition type="info" title="Notes">

`WithAPIKey()` をチェーンして認可トークンを追加します。

</Admonition>

```go
type AbortImportOption struct {
    URL string
    JobID string
    ClusterID string
    APIKey string
}
```

**フィールド：**

- **URL** (*string*) -

    Milvus または Zilliz Cloud クラスターのベース URL です。パスは含めないでください。関数は `/v2/vectordb/jobs/import/abort` を自動的に追加します。

- **JobID** (*string*) -

    中断するインポートジョブの一意の識別子です。`BulkImport()` から返される値を渡します。必須です。

- **ClusterID** (*string*) -

    Zilliz Cloud のクラスター ID です。省略可能です。クラウドインポートでのみ使用されます。

- **APIKey** (*string*) -

    `Bearer` ヘッダーとして送信される認可トークンです。省略可能です。サーバーがトークンベースの認証を適用する場合は必須です。

**ビルダーメソッド：**

- `WithAPIKey(key string)`

    `Bearer` ヘッダーとして送信する認可トークンを設定します。

- `NewAbortImportOption(uri string, jobID string)`

    AbortImport() 用のリクエストを作成します。

- `NewCloudAbortImportOption(uri string, jobID string, apiKey string, clusterID string)`

    Zilliz Cloud に対する AbortImport() 用のリクエストを作成します。

**メソッド：**

- `GetRequest() ([]byte, error)`

## 例\{#example}

AbortImportOption の使用例を示します。

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

err := cli.AbortImport(ctx, milvusclient.NewAbortImportOption("<jobId>"))
if err != nil {
	// handle error
}
```
