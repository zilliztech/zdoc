---
title: "DescribeAlias | Go | v2"
slug: /go/go/v2-Collection-DescribeAlias
sidebar_label: "DescribeAlias"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会返回别名的详细信息，包括该别名指向的 Collection。 | Go | v2"
type: docx
token: VTjPdvA5XopoUCxDDOLcjpkpnXd
sidebar_position: 10
keywords: 
  - Zilliz 向量 Database
  - Zilliz Database
  - 非结构化数据
  - 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - DescribeAlias
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeAlias

此操作会返回别名的详细信息，包括该别名指向的 Collection。

```go
func (c *Client) DescribeAlias(ctx context.Context, option DescribeAliasOption, callOptions ...grpc.CallOption) (*entity.Alias, error)
```

## 请求语法\{#request-syntax}

创建 DescribeAlias() 的请求。

```go
option := milvusclient.NewDescribeAliasOption(alias)

result, err := client.DescribeAlias(ctx, option)
```

**参数：**

- **alias** （*string*） -

    **[必需]**

    用于 DescribeAlias 的别名。

**构建器方法：**

- `NewDescribeAliasOption(alias string)`

    创建用于描述别名的选项。`alias` 指定别名名称。

**返回类型：**

&ast;*Entity.Alias, error*

**返回：**

别名描述，包括别名名称、目标 Collection 和 Database 名称。如果操作失败，则返回错误。

```go
type Alias struct {
    DbName string
    Alias string
    CollectionName string
}
```

**参数：**

- **DbName** （*string*） -

    关联 Database 的名称。

- **Alias** （*string*） -

    别名名称。

- **CollectionName** （*string*） -

    关联 Collection 的名称。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 DescribeAlias() 的用法。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

alias, err := cli.DescribeAlias(ctx, milvusclient.NewDescribeAliasOption("books_alias"))
if err != nil {
	// handle error
}
log.Println(alias)
```
