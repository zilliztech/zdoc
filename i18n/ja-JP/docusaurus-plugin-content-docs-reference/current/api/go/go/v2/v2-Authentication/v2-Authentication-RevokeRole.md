---
title: "RevokeRole() | Go | v2"
slug: /go/go/v2-Authentication-RevokeRole
sidebar_label: "RevokeRole()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はユーザーからロールを削除します。 | Go | v2"
type: docx
token: PKWMdOpDkoIXhFxDsgrc8oQVnIf
sidebar_position: 23
keywords: 
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - ベクトルデータベースチュートリアル
  - zilliz
  - zilliz cloud
  - cloud
  - RevokeRole()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RevokeRole()

この操作はユーザーからロールを削除します。

```go
func (c *Client) RevokeRole(ctx context.Context, opt RevokeRoleOption, callOpts ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewRevokeRoleOption(userName, roleName)

err := client.RevokeRole(ctx, option)
```

**パラメーター:**

- **userName** (*string*)

    ユーザーの名前。

- **roleName** (*string*)

    ロールの名前。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示す error を返します。

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

err = cli.RevokeRole(ctx, milvusclient.NewRevokeRoleOption("my_user", "my_role"))
if err != nil {
	// handle error
}
```
