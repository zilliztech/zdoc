---
title: "CommitImportResponse | Go | v2"
slug: /go/go/v2-DataImport-CommitImportResponse
sidebar_label: "CommitImportResponse"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "CommitImportResponse インスタンスは、`CommitImport()` パッケージ関数によって返されるレスポンスです。共通の `Status` フィールドと `Message` フィールド用に `ResponseBase` を埋め込みます。呼び出しが成功したことを確認するには、埋め込みの `CheckStatus()` メソッドを使用します。 | Go | v2"
type: docx
token: LW1QdbAnlocdjuxaVa8c401Wnyv
sidebar_position: 15
keywords: 
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
  - zilliz
  - zilliz cloud
  - クラウド
  - CommitImportResponse
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# CommitImportResponse

CommitImportResponse インスタンスは、`CommitImport()` パッケージ関数によって返されるレスポンスです。共通の `Status` フィールドと `Message` フィールド用に `ResponseBase` を埋め込みます。呼び出しが成功したことを確認するには、埋め込みの `CheckStatus()` メソッドを使用します。

```go
type CommitImportResponse struct {
    ResponseBase
}
```

**フィールド:**

- **Status** (*int*) -

    `ResponseBase` から継承されます。値が `0` の場合は成功を示し、それ以外の値はエラーを示します。

- **Message** (*string*) -

    `ResponseBase` から継承されます。`Status` が 0 以外の場合の、人間が読める形式のエラー説明です。

**ビルダーメソッド:**

- `CheckStatus()`

    レスポンスのステータスを検証します。`Status == 0` の場合は nil を返し、それ以外の場合は `Status` と `Message` を含む整形済みのエラーを返します。

## 例\{#example}

CommitImportResponse の使用例を示します。

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

resp, err := milvusclient.CommitImport(ctx, milvusclient.NewCommitImportOption("<jobId>", "https://example.com/rows.json"))
if err != nil {
	// handle error
}
if err := resp.CheckStatus(); err != nil {
	// handle non-zero status
}
```
