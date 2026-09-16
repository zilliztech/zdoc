---
title: "GetCompactionState() | Go | v2"
slug: /go/go/v2-Management-GetCompactionState
sidebar_label: "GetCompactionState()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回 Compaction 操作的当前状态。 | Go | v2"
type: docx
token: LLYvdMBa6osxRQx90sHcm02Kn2b
sidebar_position: 11
keywords: 
  - 向量 Database 教程
  - 向量 Database 如何工作
  - 向量 Database 比较
  - OpenAI 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - GetCompactionState()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetCompactionState()

此操作返回 Compaction 操作的当前状态。

```go
func (c *Client) GetCompactionState(ctx context.Context, option GetCompactionStateOption, callOptions ...grpc.CallOption) (entity.CompactionState, error)
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewGetCompactionStateOption(compactionID)

result, err := client.GetCompactionState(ctx, option)
```

**参数：**

- **compactionID** （*int64*）

    Compaction 的 ID 值。

**返回类型：**

*Entity.CompactionState, error*

**返回：**

Compaction 操作的当前状态。如果操作失败，则返回错误。

**异常：**

- **error**

    查看 `err != nil` 了解失败详情。

## 示例\{#example}

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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
