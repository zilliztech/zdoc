---
title: "UpdatePassword | Go | v2"
slug: /go/go/v2-Authentication-UpdatePassword
sidebar_label: "UpdatePassword"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存ユーザーのパスワードを更新します。 | Go | v2"
type: docx
token: W0UgdXTMmoA1VVx5Cooc1Re8nnb
sidebar_position: 25
keywords: 
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似性検索
  - マルチモーダル RAG
  - zilliz
  - zilliz cloud
  - cloud
  - UpdatePassword
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# UpdatePassword

この操作は、既存ユーザーのパスワードを更新します。

```go
func (c *Client) UpdatePassword(ctx context.Context, opt UpdatePasswordOption, callOpts ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

UpdatePassword() のリクエストを作成します。

```go
option := milvusclient.NewUpdatePasswordOption(userName, oldPassword, newPassword)

err := client.UpdatePassword(ctx, option)
```

**パラメーター:**

- **userName** (*string*) -

    **[必須]**

    ユーザー名です。

- **oldPassword** (*string*) -

    **[必須]**

    検証用の現在のパスワードです。

- **newPassword** (*string*) -

    **[必須]**

    設定する新しいパスワードです。

**ビルダーメソッド:**

- `NewUpdatePasswordOption(userName string, oldPassword string, newPassword string)`

    UpdatePassword() のリクエストを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示すエラーを返します。

**エラーハンドリング:**

- **error**

    操作は失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

UpdatePassword() の使用例を示します。

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

err = cli.UpdatePassword(ctx, milvusclient.NewUpdatePasswordOption("my_user", "P@ssw0rd", "NewP@ssw0rd"))
if err != nil {
	// handle error
}
```
