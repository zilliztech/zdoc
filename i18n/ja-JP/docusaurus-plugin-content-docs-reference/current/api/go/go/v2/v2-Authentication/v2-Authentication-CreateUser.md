---
title: "CreateUser | Go | v2"
slug: /go/go/v2-Authentication-CreateUser
sidebar_label: "CreateUser"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、ユーザー名とパスワードを使用して新しいユーザーを作成します。 | Go | v2"
type: docx
token: OgksdyybIol0ZuxfGk5cptU6nQf
sidebar_position: 5
keywords: 
  - オープンソースベクトルデータベース
  - ベクトルデータベースの例
  - rag ベクトルデータベース
  - ベクトルデータベースとは
  - zilliz
  - zilliz cloud
  - cloud
  - CreateUser
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateUser

この操作では、ユーザー名とパスワードを使用して新しいユーザーを作成します。

```go
func (c *Client) CreateUser(ctx context.Context, opt CreateUserOption, callOpts ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

CreateUser() のリクエストを作成します。

```go
option := milvusclient.NewCreateUserOption(userName, password)

err := client.CreateUser(ctx, option)
```

**パラメーター：**

- **userName** (*string*) -

    **[必須]**

    ユーザーの名前です。

- **password** (*string*) -

    **[必須]**

    ユーザーのパスワードです。

**ビルダーメソッド：**

- `NewCreateUserOption(userName, password)`

    CreateUser() のリクエストを作成します。

**戻り値の型：**

*error*

**戻り値：**

成功した場合は nil を返し、失敗した場合は問題の内容を示すエラーを返します。

**エラー処理：**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

CreateUser() の使用例を示します。

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

err = cli.CreateUser(ctx, milvusclient.NewCreateUserOption("my_user", "P@ssw0rd"))
if err != nil {
	// handle error
}
```
