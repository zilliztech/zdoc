---
title: "GrantRole | Go | v2"
slug: /go/go/v2-Authentication-GrantRole
sidebar_label: "GrantRole"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ユーザーにロールを割り当てます。 | Go | v2"
type: docx
token: PXoWdX9cPoJapOxK9kbcE2S6nVh
sidebar_position: 13
keywords: 
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction
  - zilliz
  - zilliz cloud
  - cloud
  - GrantRole
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GrantRole

この操作は、ユーザーにロールを割り当てます。

```go
func (c *Client) GrantRole(ctx context.Context, opt GrantRoleOption, callOpts ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

GrantRole() のリクエストを作成します。

```go
option := milvusclient.NewGrantRoleOption(userName, roleName)

err := client.GrantRole(ctx, option)
```

**パラメーター:**

- **userName** (*string*) -

    **[必須]**

    ユーザーの名前。

- **roleName** (*string*) -

    **[必須]**

    ロールの名前。

**ビルダーメソッド:**

- `NewGrantRoleOption(userName string, roleName string)`

    GrantRole() のリクエストを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil を返し、失敗した場合は問題の内容を示す error を返します。

**エラー処理:**

- **error**

    操作に失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

GrantRole() の使用例を示します。

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

err = cli.GrantRole(ctx, milvusclient.NewGrantRoleOption("my_user", "my_role"))
if err != nil {
	// handle error
}
```
