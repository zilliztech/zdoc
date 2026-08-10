---
title: "ListUsers() | Go | v2"
slug: /go/go/v2-Authentication-ListUsers
sidebar_label: "ListUsers()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出 Milvus 实例中的所有用户。 | Go | v2"
type: docx
token: S3Vndkuxco3965xyea6cN406nWc
sidebar_position: 16
keywords: 
  - Milvus 如何工作
  - Zilliz 向量 Database
  - Zilliz Database
  - 非结构化数据
  - zilliz
  - zilliz cloud
  - 云
  - ListUsers()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListUsers()

此操作会列出 Milvus 实例中的所有用户。

```go
func (c *Client) ListUsers(ctx context.Context, opt ListUserOption, callOpts ...grpc.CallOption) ([]string, error)
```

**返回类型：**

*[]string, error*

**返回值：**

名称列表。如果操作失败，则返回错误。

**异常：**

- **error**

    有关失败详情，请查看 `err != nil`。

## 示例\{#example}

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
