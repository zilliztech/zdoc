---
title: "ListUsers | Go | v2"
slug: /go/go/v2-Authentication-ListUsers
sidebar_label: "ListUsers"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、Milvus インスタンス内のすべてのユーザーを一覧表示します。 | Go | v2"
type: docx
token: M6AhdT0bvoytK5x81QdciNKnnLd
sidebar_position: 16
keywords: 
  - 自然言語処理
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - zilliz
  - zilliz cloud
  - cloud
  - ListUsers
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ListUsers

この操作では、Milvus インスタンス内のすべてのユーザーを一覧表示します。

```go
func (c *Client) ListUsers(ctx context.Context, opt ListUserOption, callOpts ...grpc.CallOption) ([]string, error)
```

## Request Syntax\{#request-syntax}

ListUsers() のリクエストを作成します。

```go
option := milvusclient.NewListUserOption()

users, err := client.ListUsers(ctx, option)
```

**BUILDER METHODS:**

- `NewListUserOption()`

    ListUsers() のリクエストを作成します。

**RETURN TYPE:**

*[]string, error*

**RETURNS:**

名前のリストです。操作が失敗した場合は、エラーを返します。

**PARAMETERS:**

- **result** (*[]string*) -

    ListUsers() によって返される []string 値です。

**ERROR HANDLING:**

- **error**

    操作が失敗します。失敗の詳細を確認するには、`err != nil` を確認してください。

## Example\{#example}

ListUsers() の使用法を示します。

```go
import (
	"context"
	"fmt"

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

users, err := cli.ListUsers(ctx, milvusclient.NewListUserOption())
if err != nil {
	// handle error
}
fmt.Println(users)
```
