---
title: "Compact() | Go | v2"
slug: /go/go/v2-Management-Compact
sidebar_label: "Compact()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会触发 Compaction，将较小的数据 Segment 合并为更大的 Segment，以获得更好的性能。 | Go | v2"
type: docx
token: VJKcdlljXofguixcGe5c2CwwnEf
sidebar_position: 2
keywords: 
  - ANN 搜索
  - 什么是向量嵌入
  - 向量 Database 教程
  - 向量 Database 如何工作
  - zilliz
  - zilliz cloud
  - 云
  - Compact()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Compact()

此操作会触发 Compaction，将较小的数据 Segment 合并为更大的 Segment，以获得更好的性能。

```go
func (c *Client) Compact(ctx context.Context, option CompactOption, callOptions ...grpc.CallOption) (int64, error)
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewCompactOption(collectionName)

result, err := client.Compact(ctx, option)
```

**参数：**

- **collectionName** (*string*)

    目标 Collection 的名称。

**返回类型：**

*int64, error*

**返回：**

数值结果。如果操作失败，则返回错误。

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
