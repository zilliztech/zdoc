---
title: "ListRoles() | Go | v2"
slug: /go/go/v2-Authentication-ListRoles
sidebar_label: "ListRoles()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Milvus インスタンス内のすべてのロールを一覧表示します。 | Go | v2"
type: docx
token: QSmmdf6jgoi8rFxzDnzcqr3cnMe
sidebar_position: 15
keywords: 
  - レコメンダーシステム
  - 情報検索
  - 次元削減
  - hnsw algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - ListRoles()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListRoles()

この操作は、Milvus インスタンス内のすべてのロールを一覧表示します。

```go
func (c *Client) ListRoles(ctx context.Context, opt ListRoleOption, callOpts ...grpc.CallOption) ([]string, error)
```

**RETURN TYPE:**

*[]string, error*

**RETURNS:**

名前の一覧です。操作が失敗した場合はエラーを返します。

**EXCEPTIONS:**

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

roles, err := cli.ListRoles(ctx, milvusclient.NewListRoleOption())
if err != nil {
	// handle error
}
fmt.Println(roles)
```
