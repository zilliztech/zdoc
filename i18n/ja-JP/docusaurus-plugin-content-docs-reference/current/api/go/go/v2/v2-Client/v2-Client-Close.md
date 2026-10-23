---
title: "Close | Go | v2"
slug: /go/go/v2-Client-Close
sidebar_label: "Close"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、クライアントの gRPC 接続を閉じ、そのリソースを解放します。クライアントが不要になったときに、通常は `defer` を介して呼び出してください。 | Go | v2"
type: docx
token: W1r5dHqUioRaR7xOyWVcrYPLnvg
sidebar_position: 2
keywords: 
  - Annoy ベクトル検索
  - milvus
  - Zilliz
  - milvus ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - Close
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Close

この操作は、クライアントの gRPC 接続を閉じ、そのリソースを解放します。クライアントが不要になったとき、通常は `defer` を介して呼び出してください。

```go
func (c *Client) Close(ctx context.Context) error
```

## リクエスト構文\{#request-syntax}

Close() のリクエストを作成します。

````go
func (c *Client) Close(ctx context.Context) error
```

**PARAMETERS:**

- **ctx** (*context.Context*)

    The context for the closing operation. The context is used for cancellation and deadlines.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error if the underlying connection failed to close.

**EXCEPTIONS:**

- **error**

    Check `err != nil` for failure details.
````

**パラメーター:**

- **ctx**（*context.Context*） -

    終了操作のコンテキストです。コンテキストは、キャンセルとデッドラインに使用されます。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil を返し、基になる接続を閉じることに失敗した場合はエラーを返します。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

Close() の使用方法を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

defer cli.Close(ctx)
```
