---
title: "AlterIndexProperties() | Go | v2"
slug: /go/go/v2-Management-AlterIndexProperties
sidebar_label: "AlterIndexProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作修改现有索引的属性。 | Go | v2"
type: docx
token: XzLnd1w4uo2RM0xS8UWc5K6in1R
sidebar_position: 1
keywords: 
  - 相似性搜索
  - 多模态 RAG
  - llm 幻觉
  - 混合搜索
  - zilliz
  - zilliz cloud
  - 云
  - AlterIndexProperties()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterIndexProperties()

此操作修改现有索引的属性。

```go
func (c *Client) AlterIndexProperties(ctx context.Context, opt AlterIndexPropertiesOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewAlterIndexPropertiesOption(collectionName, indexName).
    WithProperty(key, value)

err := client.AlterIndexProperties(ctx, option)
```

**参数：**

- **collectionName** (*string*)

    目标 Collection 的名称。

- **indexName** (*string*)

    索引的名称。

**可选方法：**

- `WithProperty(key string, value any)`

    为资源设置自定义属性键值对。

**返回类型：**

*error*

**返回值：**

成功时返回 nil；否则返回描述错误原因的 error。

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

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}
defer cli.Close(ctx)

err = cli.AlterIndexProperties(ctx, milvusclient.NewAlterIndexPropertiesOption("my_collection", "my_index").
	WithProperty("mmap.enabled", true))
if err != nil {
	// handle err
}
```
