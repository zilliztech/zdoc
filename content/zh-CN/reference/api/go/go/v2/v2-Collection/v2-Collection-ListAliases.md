---
title: "ListAliases() | Go | v2"
slug: /go/go/v2-Collection-ListAliases
sidebar_label: "ListAliases()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出与某个集合关联的所有别名。 | Go | v2"
type: docx
token: Xq1Dd1B8goDbeRxHfMKc84VOnxg
sidebar_position: 20
keywords: 
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - zilliz
  - zilliz cloud
  - cloud
  - ListAliases()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListAliases()

此操作列出与某个集合关联的所有别名。

```go
func (c *Client) ListAliases(ctx context.Context, option ListAliasesOption, callOptions ...grpc.CallOption) ([]string, error)
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewListAliasesOption(collectionName)

result, err := client.ListAliases(ctx, option)
```

**参数：**

- **collectionName** (*string*)

    目标集合的名称。

**返回类型：**

*[]string, error*

**返回值：**

名称列表。如果操作失败，则返回错误。

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

aliases, err := cli.ListAliases(ctx, milvusclient.NewListAliasesOption("customized_setup_2"))
if err != nil {
	// handle error
}
fmt.Println(aliases)
```
