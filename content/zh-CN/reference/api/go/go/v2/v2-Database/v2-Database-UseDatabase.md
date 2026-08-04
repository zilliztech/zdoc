---
title: "UseDatabase() | Go | v2"
slug: /go/go/v2-Database-UseDatabase
sidebar_label: "UseDatabase()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会切换当前客户端连接的活动数据库。 | Go | v2"
type: docx
token: GbIAdIuWsoumzoxHWpOcVjVbnle
sidebar_position: 8
keywords: 
  - 向量存储
  - 开源向量数据库
  - 向量索引
  - 开源向量数据库
  - zilliz
  - zilliz cloud
  - cloud
  - UseDatabase()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# UseDatabase()

此操作会切换当前客户端连接的活动数据库。

```go
func (c *Client) UseDatabase(ctx context.Context, option UseDatabaseOption) error
```

**返回类型：**

*error*

**返回：**

成功时返回 nil，失败时返回描述错误原因的 error。

**异常：**

- **error**

    检查 `err != nil` 以获取失败详情。

## 示例\{#example}

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
	// handle err
}
defer cli.Close(ctx)

err = cli.UseDatabase(ctx, milvusclient.NewUseDatabaseOption("my_database"))
if err != nil {
	// handle err
}
```
