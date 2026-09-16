---
title: "Flush() | Go | v2"
slug: /go/go/v2-Management-Flush
sidebar_label: "Flush()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将所有插入的数据刷新到持久化存储，确保数据持久性。 | Go | v2"
type: docx
token: VUaadf505oQMTDx14XgcwJyNnDf
sidebar_position: 9
keywords: 
  - 私有 LLM
  - 近邻搜索
  - LLM 评估
  - 稀疏与稠密
  - zilliz
  - zilliz cloud
  - 云
  - Flush()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Flush()

此操作会将所有插入的数据刷新到持久化存储，确保数据持久性。

```go
func (c *Client) Flush(ctx context.Context, option FlushOption, callOptions ...grpc.CallOption) (*FlushTask, error)
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewFlushOption(collName)

result, err := client.Flush(ctx, option)
```

**参数：**

- **collName** (*string*)

    Collection 名称。

**返回类型：**

&ast;*[FlushTask](./v2-Management-FlushTask), error*

**返回：**

返回一个 FlushTask，可用于等待 flush 完成。如果操作失败，则返回错误。

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

collectionName := `customized_setup_1`

task, err := cli.Flush(ctx, milvusclient.NewFlushOption(collectionName))
if err != nil {
	// handle err
}

err = task.Await(ctx)
if err != nil {
	// handle err
}
```
