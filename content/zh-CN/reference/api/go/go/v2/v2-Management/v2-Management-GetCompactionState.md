---
title: "GetCompactionState | Go | v2"
slug: /go/go/v2-Management-GetCompactionState
sidebar_label: "GetCompactionState"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回 Compaction 操作的当前状态。 | Go | v2"
type: docx
token: Uql8dQNxAoemIOxWgoLcORJenKe
sidebar_position: 11
keywords: 
  - Milvus 如何工作
  - Zilliz 向量 Database
  - Zilliz Database
  - 非结构化数据
  - zilliz
  - zilliz cloud
  - 云
  - GetCompactionState
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetCompactionState

此操作返回 Compaction 操作的当前状态。

```go
func (c *Client) GetCompactionState(ctx context.Context, option GetCompactionStateOption, callOptions ...grpc.CallOption) (entity.CompactionState, error)
```

## 请求语法\{#request-syntax}

创建 GetCompactionState() 的请求。

```go
option := milvusclient.NewGetCompactionStateOption(compactionID)

result, err := client.GetCompactionState(ctx, option)
```

**参数：**

- **compactionID** （*int64*） -

    **[必需]**

    Compaction 的 ID 值。

**构建器方法：**

- `NewGetCompactionStateOption(compactionID int64)`

    创建 GetCompactionState() 的请求。

**返回类型：**

*Entity.CompactionState, error*

**返回：**

Compaction 操作的当前状态。如果操作失败，则返回错误。

**参数：**

- **CompactionStateRunning** （*Entity.CompactionState*） -

    Compaction 当前正在执行（对应底层的 CompactionState_Executing 状态）。

- **CompactionStateCompleted** （*Entity.CompactionState*） -

    Compaction 已完成（对应底层的 CompactionState_Completed 状态）。

**异常：**

- **error**

    操作失败。检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 GetCompactionState() 的用法。

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

compactID := int64(123)

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

state, err := cli.GetCompactionState(ctx, milvusclient.NewGetCompactionStateOption(compactID))
if err != nil {
	// handle err
}
fmt.Println(state)
```
