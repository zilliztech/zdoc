---
title: "AlterRole | Go | v2"
slug: /go/go/v2-Authentication-AlterRole
sidebar_label: "AlterRole"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のロールの説明を変更します。 | Go | v2"
type: docx
token: HvS9dO1v7ofQuhx49Q3ceroCnmI
sidebar_position: 27
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
  - zilliz
  - zilliz cloud
  - cloud
  - AlterRole
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# AlterRole

この操作は、既存のロールの説明を変更します。

```go
func (c *Client) AlterRole(ctx context.Context, opt AlterRoleOption, callOpts ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

AlterRole() のリクエストを作成します。

```go
option := milvusclient.NewAlterRoleOption(roleName).
    WithDescription(description)

err := client.AlterRole(ctx, option)
```

**パラメーター:**

- **roleName** (*string*) -

    **必須**

    ロールを変更するためのオプションです。`NewAlterRoleOption` を使用して構築します。

**ビルダーメソッド:**

- `NewAlterRoleOption(roleName string)`

    ロールを変更するためのオプションを作成します。`roleName` は変更するロールを指定します。

- `WithDescription(description string)`

    ロールの説明を設定します。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil を返し、失敗した場合は問題の内容を示すエラーを返します。

**エラーハンドリング:**

- **error**

    操作は失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

AlterRole() の使用方法を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

err = cli.AlterRole(ctx, milvusclient.NewAlterRoleOption("my_role").
	WithDescription("read only role"))
if err != nil {
	// handle error
}
```
