---
title: "CreateRole | Go | v2"
slug: /go/go/v2-Authentication-CreateRole
sidebar_label: "CreateRole"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、アクセス制御用の新しいロールを作成します。 | Go | v2"
type: docx
token: P8PRdHt2soM6rfxHbJacm4iWnYf
sidebar_position: 4
keywords: 
  - 情報検索
  - 次元削減
  - HNSW アルゴリズム
  - ベクトル類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - CreateRole
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# CreateRole

この操作は、アクセス制御用の新しいロールを作成します。

```go
func (c *Client) CreateRole(ctx context.Context, opt CreateRoleOption, callOpts ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

CreateRole() のリクエストを作成します。

```go
option := milvusclient.NewCreateRoleOption(roleName)

err := client.CreateRole(ctx, option)
```

**パラメーター:**

- **roleName** (*string*) -

    **[必須]**

    ロールの名前です。

**ビルダーメソッド:**

- `NewCreateRoleOption(roleName)`

    CreateRole() のリクエストを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示すエラーを返します。

**エラー処理:**

- **error**

    操作は失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

CreateRole() の使用例を示します。

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

err = cli.CreateRole(ctx, milvusclient.NewCreateRoleOption("my_role"))
if err != nil {
	// handle error
}
```
