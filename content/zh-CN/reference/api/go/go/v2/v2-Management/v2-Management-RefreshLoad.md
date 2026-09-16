---
title: "RefreshLoad() | Go | v2"
slug: /go/go/v2-Management-RefreshLoad
sidebar_label: "RefreshLoad()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会重新加载 Collection，以便将新插入的数据包含在搜索结果中。 | Go | v2"
type: docx
token: VtZWdaMz6o9iYrxcEaMcsnJin0e
sidebar_position: 23
keywords: 
  - LLM 幻觉
  - 多模态搜索
  - 向量搜索算法
  - 问答系统
  - zilliz
  - zilliz cloud
  - 云
  - RefreshLoad()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RefreshLoad()

此操作会重新加载 Collection，以便将新插入的数据包含在搜索结果中。

```go
func (c *Client) RefreshLoad(ctx context.Context, option RefreshLoadOption, callOptions ...grpc.CallOption) (LoadTask, error)
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewRefreshLoadOption(collectionName)

result, err := client.RefreshLoad(ctx, option)
```

**参数：**

- **collectionName** (*string*)

    目标 Collection 的名称。

**返回类型：**

*LoadTask, error*

**返回：**

返回一个 LoadTask，可用于等待加载操作完成。如果操作失败，则返回错误。

**异常：**

- **error**

    查看 `err != nil` 了解失败详情。

## 示例\{#example}

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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
