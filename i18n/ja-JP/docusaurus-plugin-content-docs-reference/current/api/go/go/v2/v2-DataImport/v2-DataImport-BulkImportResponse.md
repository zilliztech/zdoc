---
title: "BulkImportResponse | Go | v2"
slug: /go/go/v2-DataImport-BulkImportResponse
sidebar_label: "BulkImportResponse"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "BulkImportResponse インスタンスは、`BulkImport()` パッケージ関数から返されるレスポンスです。共通の `Status` フィールドと `Message` フィールドを提供する `ResponseBase` を埋め込み、割り当てられたインポートジョブ ID を `Data.JobID` で公開します。`Data` を読み取る前に、埋め込みの `CheckStatus()` メソッドを使用して呼び出しが成功したことを確認してください。 | Go | v2"
type: docx
token: IeoJdXXQHo2E0Vx9l0CczMKAnSv
sidebar_position: 3
keywords: 
  - 動画類似検索
  - ベクトル検索
  - 音声類似検索
  - Elastic ベクトル データベース
  - zilliz
  - zilliz cloud
  - cloud
  - BulkImportResponse
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# BulkImportResponse

BulkImportResponse インスタンスは、`BulkImport()` パッケージ関数から返されるレスポンスです。共通の `Status` フィールドと `Message` フィールドを提供する `ResponseBase` を埋め込み、割り当てられたインポートジョブ ID を `Data.JobID` で公開します。`Data` を読み取る前に、埋め込みの `CheckStatus()` メソッドを使用して呼び出しが成功したことを確認してください。

```go
type BulkImportResponse struct {
    ResponseBase
    Data struct {
    JobID string
}
```

**FIELDS:**

- **Status** (*int*) -

    `ResponseBase` から継承されます。値が `0` の場合は成功を示し、それ以外の値はエラーを示します。

- **Message** (*string*) -

    `ResponseBase` から継承されます。`Status` が 0 以外の場合に、人が読める形式でエラーを説明します。

- **Data.JobID** (*string*) -

    送信された一括インポートジョブに割り当てられる一意の識別子です。完了状況を追跡するには、これを `GetImportProgress()` に渡します。

**BUILDER METHODS:**

- `CheckStatus()`

    これはレスポンスのステータスを検証します。`Status == 0` の場合は nil を返し、それ以外の場合は `Status` と `Message` を含む整形済みのエラーを返します。

## Example\{#example}

BulkImportResponse の使用例を示します。

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

resp, err := milvusclient.BulkImport(ctx, milvusclient.NewBulkImportOption("milvus-bulk-imp", "https://example.com/rows.json"))
if err != nil {
	// handle error
}
if err := resp.CheckStatus(); err != nil {
	// handle non-zero status
}
fmt.Println(resp.Data.JobID)
```
