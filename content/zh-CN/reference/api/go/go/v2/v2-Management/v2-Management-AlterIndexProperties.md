---
title: "AlterIndexProperties | Go | v2"
slug: /go/go/v2-Management-AlterIndexProperties
sidebar_label: "AlterIndexProperties"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作修改现有索引的属性。 | Go | v2"
type: docx
token: KAfCd9KE6oD9XmxgntMcfFNTn0c
sidebar_position: 1
keywords: 
  - HNSW
  - 什么是非结构化数据
  - 向量嵌入
  - 向量存储
  - zilliz
  - zilliz cloud
  - 云
  - AlterIndexProperties
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# AlterIndexProperties

此操作修改现有索引的属性。

```go
func (c *Client) AlterIndexProperties(ctx context.Context, opt AlterIndexPropertiesOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 AlterIndexProperties() 的请求。

```go
option := milvusclient.NewAlterIndexPropertiesOption(collectionName, indexName).
    WithProperty(key, value)

err := client.AlterIndexProperties(ctx, option)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    目标 Collection 的名称。

- **indexName** （*string*） -

    **[必需]**

    索引的名称。

**构建器方法：**

- `NewAlterIndexPropertiesOption(collectionName string, indexName string)`

    创建 AlterIndexProperties() 的请求。

- `WithProperty(key string, value any)`

    为资源设置自定义属性键值对。

**返回类型：**

*error*

**返回：**

成功时返回 nil；失败时返回说明出错原因的错误。

**异常：**

- **error**

    操作失败。检查 `err != nil` 以了解失败详情。

## 示例\{#example}

演示 AlterIndexProperties() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
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
