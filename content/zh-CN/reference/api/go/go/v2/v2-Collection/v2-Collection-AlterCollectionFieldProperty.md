---
title: "AlterCollectionFieldProperty | Go | v2"
slug: /go/go/v2-Collection-AlterCollectionFieldProperty
sidebar_label: "AlterCollectionFieldProperty"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会修改现有 Collection 中某个字段的属性。 | Go | v2"
type: docx
token: DcWidpe28otXGSxUzvucDyrhnoc
sidebar_position: 4
keywords: 
  - 图像搜索
  - 大语言模型
  - 机器学习
  - RAG
  - Zilliz
  - Zilliz Cloud
  - 云
  - AlterCollectionFieldProperty
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterCollectionFieldProperty

此操作会修改现有 Collection 中某个字段的属性。

```go
func (c *Client) AlterCollectionFieldProperty(ctx context.Context, option AlterCollectionFieldPropertiesOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

为 AlterCollectionFieldProperty() 创建请求。

```go
option := milvusclient.NewAlterCollectionFieldPropertiesOption(collectionName, fieldName).
    WithProperty(key, value)

err := client.AlterCollectionFieldProperty(ctx, option)
```

**参数：**

- **collectionName** (*string*) -

    **[必需]**

    目标 Collection 的名称。

- **fieldName** (*string*) -

    **[必需]**

    AlterCollectionFieldProperty 的字段名称。

**构建器方法：**

- `NewAlterCollectionFieldPropertiesOption(collectionName string, fieldName string)`

    创建用于修改字段属性的选项。`collectionName` 指定 Collection，`fieldName` 指定要修改其属性的字段。

- `WithProperty(key string, value any)`

    在将值转换为其字符串表示形式后，设置字段属性键值对。

**返回类型：**

*error*

**返回：**

字段属性修改后返回 nil。如果操作失败，则返回错误。

**错误处理：**

- **error**

    操作失败。请求构造或 RPC 失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 AlterCollectionFieldProperty() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

err = cli.AlterCollectionFieldProperty(ctx, milvusclient.NewAlterCollectionFieldPropertiesOption("books", "title").
	WithProperty("max_length", "512"))
if err != nil {
	// handle error
}
```
