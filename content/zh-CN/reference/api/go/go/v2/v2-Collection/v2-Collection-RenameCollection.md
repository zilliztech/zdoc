---
title: "RenameCollection() | Go | v2"
slug: /go/go/v2-Collection-RenameCollection
sidebar_label: "RenameCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会重命名现有集合。 | Go | v2"
type: docx
token: XJN5dD1ifo5A9xxEfFKcf7Fxn1g
sidebar_position: 22
keywords: 
  - 视频搜索
  - AI 幻觉
  - AI Agent
  - 语义搜索
  - zilliz
  - zilliz cloud
  - cloud
  - RenameCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RenameCollection()

此操作会重命名现有集合。

```go
func (c *Client) RenameCollection(ctx context.Context, option RenameCollectionOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewRenameCollectionOption(oldName, newName)

err := client.RenameCollection(ctx, option)
```

**参数：**

- **oldName** (*string*)

    旧名称。

- **newName** (*string*)

    集合的新名称。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述错误原因的 error。

**异常：**

- **error**

    通过检查 `err != nil` 获取失败详情。

## 示例\{#example}

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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

err = cli.RenameCollection(ctx, milvusclient.NewRenameCollectionOption("my_collection", "my_new_collection"))
if err != nil {
	// handle error
}
```
