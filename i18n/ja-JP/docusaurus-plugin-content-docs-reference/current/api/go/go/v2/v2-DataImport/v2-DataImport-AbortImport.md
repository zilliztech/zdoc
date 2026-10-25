---
title: "AbortImport | Go | v2"
slug: /go/go/v2-DataImport-AbortImport
sidebar_label: "AbortImport"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、RESTful インポート API を使用して一括インポートジョブを中止します。 | Go | v2"
type: docx
token: MYVqdXiLjoYbB2xQeQHcjrf1nmu
sidebar_position: 10
keywords: 
  - ハイブリッドベクトル検索
  - 動画重複排除
  - 動画類似検索
  - ベクトル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - AbortImport
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# AbortImport

この操作は、RESTful インポート API を使用して一括インポートジョブを中止します。

<Admonition type="info" title="Notes">

進行中のインポートジョブを停止し、それまでにステージングされたデータを破棄する場合に使用します。

</Admonition>

<Admonition type="info" title="Notes">

`AbortImport()` は `github.com/milvus-io/milvus/client/v3/bulkwriter` 内のパッケージレベルの関数であり、`*milvusclient.Client` のメソッドではありません。REST エンドポイント `/v2/vectordb/jobs/import/abort` を直接使用するため、Milvus オープンソースクラスター（`NewAbortImportOption` を使用）と Zilliz Cloud（`NewCloudAbortImportOption` を使用）の両方で動作します。

</Admonition>

```go
func AbortImport(ctx context.Context, option *AbortImportOption) (*AbortImportResponse, error)
```

## リクエスト構文\{#request-syntax}

AbortImport() のリクエストを作成します。

```go
option := bulkwriter.NewAbortImportOption(uri, jobID).
    WithAPIKey(apiKey)

resp, err := bulkwriter.AbortImport(ctx, option)
```

**パラメーター:**

- **ctx** (*context.Context*) -

    キャンセルとデッドラインのためのコンテキストです。HTTP リクエストはこのコンテキストを継承するため、このコンテキストをキャンセルすると、進行中の呼び出しが中止されます。

- **option** (*AbortImportOption*) -

    セルフホストの Milvus 用に `NewAbortImportOption()` で、または Zilliz Cloud 用に `NewCloudAbortImportOption()` で作成した中止オプションです。`BulkImport()` から返されたジョブ ID が必要です。

**戻り値の型:**

&ast;*AbortImportResponse, error*

**戻り値:**

共通の `Status` フィールドと `Message` フィールドを埋め込む `AbortImportResponse` です。リクエストをマーシャリングできない場合、HTTP 呼び出しが失敗した場合、またはサーバーが 0 以外のステータスを返した場合は、エラーを返します。

```go
type AbortImportResponse struct {
    ResponseBase
}
```

**パラメーター:**

- **Status** (*int*) -

    `ResponseBase` から継承されます。値が `0` の場合は成功を示し、それ以外の値はエラーを示します。

- **Message** (*string*) -

    `ResponseBase` から継承されます。`Status` が 0 以外の場合の、人が読めるエラー説明です。

**エラーハンドリング:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。一般的な失敗には、不正な形式のオプションペイロード、ネットワークエラー、認証の拒否（`WithAPIKey` が正しく設定されていない場合）、およびレスポンスステータスを通じて返されるサーバー側の検証エラーが含まれます。

## 例\{#example}

AbortImport() の使用例を示します。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/bulkwriter"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "http://YOUR_CLUSTER_ENDPOINT"
jobID := "453291002847301"

option := bulkwriter.NewAbortImportOption(milvusAddr, jobID).
	WithAPIKey("YOUR_CLUSTER_TOKEN")

resp, err := bulkwriter.AbortImport(ctx, option)
if err != nil {
	log.Fatal(err)
}

if resp.Status != 0 {
	log.Fatalf("abort import failed: %s", resp.Message)
}
```
