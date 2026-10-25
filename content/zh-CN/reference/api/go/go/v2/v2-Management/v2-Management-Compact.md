---
title: "Compact | Go | v2"
slug: /go/go/v2-Management-Compact
sidebar_label: "Compact"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会触发 Compaction，将较小的数据 Segment 合并为较大的 Segment，以获得更好的性能。 | Go | v2"
type: docx
token: Tex5dSQ3FoaEWGxTo7xcMPISndc
sidebar_position: 2
keywords: 
  - AI 聊天机器人
  - 余弦距离
  - 什么是向量 Database
  - 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - Compact
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# Compact

此操作会触发 Compaction，将较小的数据 Segment 合并为较大的 Segment，以获得更好的性能。

```go
func (c *Client) Compact(ctx context.Context, option CompactOption, callOptions ...grpc.CallOption) (int64, error)
```

## 请求语法\{#request-syntax}

创建 Compact() 的请求。

```go
option := milvusclient.NewCompactOption(collectionName)

result, err := client.Compact(ctx, option)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    目标 Collection 的名称。

**构建器方法：**

- `NewCompactOption(collectionName string)`

    创建 Compact() 的请求。

**返回类型：**

*int64, error*

**返回：**

返回数值结果。如果操作失败，则返回错误。

**参数：**

- **result** （*int64*） -

    Compact() 返回的 int64 值。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 Compact() 的用法。

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

compactID, err := cli.Compact(ctx, milvusclient.NewCompactOption(collectionName))
if err != nil {
	// handle err
}
fmt.Println(compactID)
```
