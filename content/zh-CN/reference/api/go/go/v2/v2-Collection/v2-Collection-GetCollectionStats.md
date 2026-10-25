---
title: "GetCollectionStats | Go | v2"
slug: /go/go/v2-Collection-GetCollectionStats
sidebar_label: "GetCollectionStats"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回有关 Collection 的统计信息，例如行数。 | Go | v2"
type: docx
token: GdghdqEWhon4rpxH4HBcJUddnsf
sidebar_position: 18
keywords: 
  - 语义搜索
  - 异常检测
  - 句子转换器
  - 推荐系统
  - Zilliz
  - Zilliz Cloud
  - 云
  - GetCollectionStats
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GetCollectionStats

此操作返回有关 Collection 的统计信息，例如行数。

```go
func (c *Client) GetCollectionStats(ctx context.Context, opt GetCollectionOption) (map[string]string, error)
```

## 请求语法\{#request-syntax}

为 GetCollectionStats() 创建请求。

```go
option := milvusclient.NewGetCollectionStatsOption("quick_setup")

stats, err := client.GetCollectionStats(ctx, option)
```

**构建器方法：**

- `NewGetCollectionStatsOption(collectionName string)`

    为 `GetCollectionStats()` 创建选项。`collectionName` 指定要检查的 Collection。

**返回类型：**

*map[string]string, error*

**返回：**

统计信息键值对的映射。如果操作失败，则返回错误。

**参数：**

- **result** （*map[string]string*） -

    GetCollectionStats() 返回的 map[string]string 值。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 GetCollectionStats() 的用法。

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}
defer cli.Close(ctx)

stats, err := cli.GetCollectionStats(ctx, milvusclient.NewGetCollectionStatsOption("quick_setup"))
if err != nil {
	// handle error
}
fmt.Println(stats)
```
