---
title: "DropUser | Go | v2"
slug: /go/go/v2-Authentication-DropUser
sidebar_label: "DropUser"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はシステムからユーザーを削除します。 | Go | v2"
type: docx
token: DwNPdAshLoAsYvxrs4lcQCe0n4g
sidebar_position: 10
keywords: 
  - セマンティック検索
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - zilliz
  - zilliz cloud
  - cloud
  - DropUser
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropUser

この操作はシステムからユーザーを削除します。

```go
func (c *Client) DropUser(ctx context.Context, opt DropUserOption, callOpts ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

DropUser() のリクエストを作成します。

```go
option := milvusclient.NewDropUserOption(userName)

err := client.DropUser(ctx, option)
```

**パラメーター:**

- **userName** (*string*) -

    **[必須]**

    ユーザーの名前です。

**ビルダーメソッド:**

- `NewDropUserOption(userName string)`

    DropUser() のリクエストを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示すエラーを返します。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

DropUser() の使用例を示します。

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

err = cli.DropUser(ctx, milvusclient.NewDropUserOption("my_user"))
if err != nil {
	// handle error
}
```
