---
title: "CreateAlias | Go | v2"
slug: /go/go/v2-Collection-CreateAlias
sidebar_label: "CreateAlias"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作为 Collection 创建别名，使您可以使用另一个名称来引用它。 | Go | v2"
type: docx
token: YJuQdfyRfonHrTxLh6ucA3EDnQf
sidebar_position: 8
keywords: 
  - 近似最近邻搜索
  - DiskANN
  - 稀疏向量
  - 向量维度
  - Zilliz
  - Zilliz Cloud
  - 云
  - CreateAlias
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# CreateAlias

此操作为 Collection 创建别名，使您可以使用另一个名称来引用它。

```go
func (c *Client) CreateAlias(ctx context.Context, option CreateAliasOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 CreateAlias() 的请求。

```go
option := milvusclient.NewCreateAliasOption(collectionName, alias)

err := client.CreateAlias(ctx, option)
```

**参数：**

- **collectionName** (*string*) -

    **[必需]**

    目标 Collection 的名称。

- **alias** (*string*) -

    **[必需]**

    要分配的别名名称。

**构建器方法：**

- `NewCreateAliasOption(collectionName string, alias string)`

    创建 CreateAlias() 的请求。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述出错原因的错误。

**异常：**

- **error**

    该操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 CreateAlias() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

err = cli.CreateAlias(ctx, milvusclient.NewCreateAliasOption("customized_setup_2", "bob"))
if err != nil {
	// handle error
}

err = cli.CreateAlias(ctx, milvusclient.NewCreateAliasOption("customized_setup_2", "alice"))
if err != nil {
	// handle error
}
```
