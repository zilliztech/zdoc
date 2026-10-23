---
title: "RefreshLoad | Go | v2"
slug: /go/go/v2-Management-RefreshLoad
sidebar_label: "RefreshLoad"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会重新加载 Collection，以便将新插入的数据包含在搜索结果中。 | Go | v2"
type: docx
token: Ava5d8VRjo9lM2x0fJccDqi5nHd
sidebar_position: 22
keywords: 
  - Zilliz Database
  - 非结构化数据
  - 向量 Database
  - IVF
  - Zilliz
  - Zilliz Cloud
  - 云
  - RefreshLoad
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RefreshLoad

此操作会重新加载 Collection，以便将新插入的数据包含在搜索结果中。

```go
func (c *Client) RefreshLoad(ctx context.Context, option RefreshLoadOption, callOptions ...grpc.CallOption) (LoadTask, error)
```

## 请求语法\{#request-syntax}

创建 RefreshLoad() 的请求。

```go
option := milvusclient.NewRefreshLoadOption(collectionName)

result, err := client.RefreshLoad(ctx, option)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    目标 Collection 的名称。

**构建器方法：**

- `NewRefreshLoadOption(collectionName string)`

    创建 RefreshLoad() 的请求。

**返回类型：**

*LoadTask, error*

**返回：**

返回一个 LoadTask，可用于等待加载操作完成。如果操作失败，则返回错误。

**方法：**

- **Await** （*error*） -

    阻塞直至刷新后的加载被确认完成，并按任务的检查间隔轮询服务器，直到刷新进度报告为 100 或上下文被取消。

**异常：**

- **error**

    操作失败。请查看 `err != nil` 了解失败详情。

## 示例\{#example}

演示 RefreshLoad() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

collectionName := `customized_setup_1`

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

loadTask, err := cli.RefreshLoad(ctx, milvusclient.NewRefreshLoadOption(collectionName))
if err != nil {
	// handle err
}
err = loadTask.Await(ctx)
if err != nil {
	// handler err
}
```
