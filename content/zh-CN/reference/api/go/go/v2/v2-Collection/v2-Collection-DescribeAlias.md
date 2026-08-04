---
title: "DescribeAlias() | Go | v2"
slug: /go/go/v2-Collection-DescribeAlias
sidebar_label: "DescribeAlias()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回集合别名的详细信息，包括它所引用的集合。 | Go | v2"
type: docx
token: EFC0drdqGoG559x5Zqzcpj7innc
sidebar_position: 10
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeAlias()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeAlias()

此操作返回集合别名的详细信息，包括它所引用的集合。

```go
func (c *Client) DescribeAlias(ctx context.Context, option DescribeAliasOption, callOptions ...grpc.CallOption) (*entity.Alias, error)
```

## 请求语法\{#request-syntax}

```go
option := client.NewDescribeAliasOption(alias)

result, err := client.DescribeAlias(ctx, option)
```

**参数：**

- **[alias](./v2-Collection-Alias)** (*string*)

    要分配的别名名称。

**返回类型：**

**[entity.Alias](./v2-Collection-Alias), error*

**返回：**

别名详细信息，包括关联的集合名称。如果操作失败，则返回错误。

**异常：**

- **error**

    检查 `err != nil` 以获取失败详情。

## 示例\{#example}

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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

alias, err := cli.DescribeAlias(ctx, milvusclient.NewDescribeAliasOption("bob"))
if err != nil {
	// handle error
}
fmt.Println(alias)
```
