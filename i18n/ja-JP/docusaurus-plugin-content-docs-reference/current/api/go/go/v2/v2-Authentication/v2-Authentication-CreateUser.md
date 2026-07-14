---
title: "CreateUser() | Go | v2"
slug: /go/go/v2-Authentication-CreateUser
sidebar_label: "CreateUser()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ユーザー名とパスワードを使用して新しいユーザーを作成します。 | Go | v2"
type: docx
token: Liv8dqreJo6t26xf3UWcC8ePnpe
sidebar_position: 5
keywords: 
  - ニューラルネットワーク
  - ディープラーニング
  - ナレッジベース
  - 自然言語処理
  - zilliz
  - zilliz cloud
  - クラウド
  - CreateUser()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateUser()

この操作は、ユーザー名とパスワードを使用して新しいユーザーを作成します。

```go
func (c *Client) CreateUser(ctx context.Context, opt CreateUserOption, callOpts ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewCreateUserOption(userName, password)

err := client.CreateUser(ctx, option)
```

**パラメータ:**

- **userName** (*string*)

    ユーザーの名前。

- **password** (*string*)

    ユーザーのパスワード。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil、失敗時は問題の内容を示す error を返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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
