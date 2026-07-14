---
title: "ListUsers() | Go | v2"
slug: /go/go/v2-Authentication-ListUsers
sidebar_label: "ListUsers()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Milvus インスタンス内のすべてのユーザーを一覧表示します。 | Go | v2"
type: docx
token: S3Vndkuxco3965xyea6cN406nWc
sidebar_position: 16
keywords: 
  - milvus はどのように動作するか
  - Zilliz vector database
  - Zilliz database
  - 非構造化データ
  - zilliz
  - zilliz cloud
  - cloud
  - ListUsers()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListUsers()

この操作は、Milvus インスタンス内のすべてのユーザーを一覧表示します。

```go
func (c *Client) ListUsers(ctx context.Context, opt ListUserOption, callOpts ...grpc.CallOption) ([]string, error)
```

**戻り値の型:**

*[]string, error*

**戻り値:**

名前のリスト。操作が失敗した場合はエラーを返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## Example\{#example}

```go
import (
	"context"
	"fmt"

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

users, err := cli.ListUsers(ctx, milvusclient.NewListUserOption())
if err != nil {
	// handle error
}
fmt.Println(users)
```
