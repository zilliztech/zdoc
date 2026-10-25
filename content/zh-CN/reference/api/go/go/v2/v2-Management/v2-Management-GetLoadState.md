---
title: "GetLoadState | Go | v2"
slug: /go/go/v2-Management-GetLoadState
sidebar_label: "GetLoadState"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回 Collection 或 Partition 的当前加载状态和进度。 | Go | v2"
type: docx
token: GnxodY26PoUgOIxa5ihc2e0MnK0
sidebar_position: 12
keywords: 
  - Pinecone 向量 Database
  - 音频搜索
  - 什么是语义搜索
  - 嵌入模型
  - Zilliz
  - Zilliz Cloud
  - 云
  - GetLoadState
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GetLoadState

此操作返回 Collection 或 Partition 的当前加载状态和进度。

```go
func (c *Client) GetLoadState(ctx context.Context, option GetLoadStateOption, callOptions ...grpc.CallOption) (entity.LoadState, error)
```

## 请求语法\{#request-syntax}

创建 GetLoadState() 的请求。

```go
option := milvusclient.NewGetLoadStateOption(collectionName, partitionNames)

result, err := client.GetLoadState(ctx, option)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    目标 Collection 的名称。

- **partitionNames** （*...string*） -

    **[必需]**

    一个或多个 Partition 的名称。

**构建器方法：**

- `NewGetLoadStateOption(collectionName string, partitionNames ...string)`

    创建 GetLoadState() 的请求。

**返回类型：**

*Entity.LoadState, error*

**返回：**

Collection 或 Partition 的当前加载状态。如果操作失败，则返回错误。

```go
type LoadState struct {
    State LoadStateCode
    Progress int64
}
```

**参数：**

- **State** （*LoadStateCode*） -

    当前状态：LoadStateLoading、LoadStateLoaded、LoadStateUnloading 或 LoadStateNotLoad。

- **Progress** （*int64*） -

    进度百分比。

**异常：**

- **error**

    操作失败。检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 GetLoadState() 的用法。

```go
import (
	"context"
	"fmt"

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

loadState, err := cli.GetLoadState(ctx, milvusclient.NewGetLoadStateOption(collectionName))
if err != nil {
	// handle err
}
fmt.Println(loadState)
```
