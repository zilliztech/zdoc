---
title: "CreateAlias() | Go | v2"
slug: /go/go/v2-Collection-CreateAlias
sidebar_label: "CreateAlias()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作为集合创建别名，使您可以通过另一个名称来引用它。 | Go | v2"
type: docx
token: HbsGdw2PboyE0Yxcp8IcaG4Qnmg
sidebar_position: 8
keywords: 
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - CreateAlias()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateAlias()

此操作为集合创建别名，使您可以通过另一个名称来引用它。

```go
func (c *Client) CreateAlias(ctx context.Context, option CreateAliasOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewCreateAliasOption(collectionName, alias)

err := client.CreateAlias(ctx, option)
```

**参数：**

- **collectionName** (*string*)

    目标集合的名称。

- **[alias](./v2-Collection-Alias)** (*string*)

    要分配的别名名称。

**返回类型：**

*error*

**返回值：**

成功时返回 nil，否则返回描述错误原因的 error。

**异常：**

- **error**

    通过检查 `err != nil` 获取失败详情。

## 示例\{#example}

```go
import (
	"context"

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

err = cli.CreateAlias(ctx, milvusclient.NewCreateAliasOption("customized_setup_2", "bob"))
if err != nil {
	// handle error
}

err = cli.CreateAlias(ctx, milvusclient.NewCreateAliasOption("customized_setup_2", "alice"))
if err != nil {
	// handle error
}
```
