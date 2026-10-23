---
title: "CommitImport | Go | v2"
slug: /go/go/v2-DataImport-CommitImport
sidebar_label: "CommitImport"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、RESTful import API を介して一括インポートジョブをコミットします。データを先にステージングして最後にコミットするインポートモードに使用します。たとえば、インポートしたデータをクエリ可能にする前に、インポートジョブで明示的な最終コミットが必要な場合です。 | Go | v2"
type: docx
token: YimZdGvFVoS8k6xn4yWczFxqnwg
sidebar_position: 13
keywords: 
  - 近似最近傍探索
  - LLM 評価
  - スパースと密ベクトル
  - 密ベクトル
  - zilliz
  - zilliz cloud
  - クラウド
  - CommitImport
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CommitImport

この操作は、RESTful import API を介して一括インポートジョブをコミットします。データを先にステージングして最後にコミットするインポートモードに使用します。たとえば、インポートしたデータをクエリ可能にする前に、インポートジョブで明示的な最終コミットが必要な場合です。

<Admonition type="info" title="Notes">

`CommitImport()` は `github.com/milvus-io/milvus/client/v3/bulkwriter` 内のパッケージレベルの関数であり、`*milvusclient.Client` のメソッドではありません。REST `/v2/vectordb/jobs/import/commit` エンドポイントを直接呼び出すため、Milvus オープンソースクラスター（`NewCommitImportOption` を使用）と Zilliz Cloud（`NewCloudCommitImportOption` を使用）の両方で動作します。

</Admonition>

```go
func CommitImport(ctx context.Context, option *CommitImportOption) (*CommitImportResponse, error)
```

## リクエスト構文\{#request-syntax}

CommitImport() のリクエストを作成します。

```go
option := bulkwriter.NewCommitImportOption(uri, jobID).
    WithAPIKey(apiKey)

resp, err := bulkwriter.CommitImport(ctx, option)
```

**パラメーター:**

- **ctx** (*context.Context*) -

    キャンセルとデッドラインのためのコンテキストです。HTTP リクエストはこのコンテキストを継承するため、これをキャンセルすると進行中の呼び出しが中断されます。

- **option** (*CommitImportOption*) -

    セルフホスト型 Milvus で `NewCommitImportOption()` を使用するか、Zilliz Cloud で `NewCloudCommitImportOption()` を使用して作成するコミットオプションです。`BulkImport()` から返されるジョブ ID が必須です。

**戻り値の型:**

&ast;*CommitImportResponse, error*

**戻り値:**

共通の `Status` および `Message` フィールドを埋め込む `CommitImportResponse` です。リクエストをマーシャリングできない場合、HTTP 呼び出しが失敗した場合、またはサーバーがゼロ以外のステータスを返した場合は、エラーを返します。

```go
type CommitImportResponse struct {
    ResponseBase
}
```

**パラメーター:**

- **Status** (*int*) -

    `ResponseBase` から継承されます。値が `0` の場合は成功を示し、それ以外の値はエラーを示します。

- **Message** (*string*) -

    `ResponseBase` から継承されます。`Status` がゼロ以外の場合の、人が読める形式のエラー説明です。

**エラー処理:**

- **error**

    操作は失敗します。失敗の詳細については、`err != nil` を確認してください。よくある失敗には、不正な形式のオプションペイロード、ネットワークエラー、認証の拒否（`WithAPIKey` が正しく設定されていない場合）、およびレスポンスのステータスを通じて通知されるサーバー側のバリデーションエラーが含まれます。

## 例\{#example}

CommitImport() の使用例を示します。

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

option := bulkwriter.NewCommitImportOption(milvusAddr, jobID).
	WithAPIKey("YOUR_CLUSTER_TOKEN")

resp, err := bulkwriter.CommitImport(ctx, option)
if err != nil {
	log.Fatal(err)
}

if resp.Status != 0 {
	log.Fatalf("commit import failed: %s", resp.Message)
}
```
