---
title: "Close() | Go | v2"
slug: /go/go/v2-Client-Close
sidebar_label: "Close()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会关闭客户端连接并释放相关资源。 | Go | v2"
type: docx
token: UN5Yd5ojPoTYrJxAtYzcgFs9nYe
sidebar_position: 2
keywords: 
  - 托管 Milvus
  - Serverless 向量 Database
  - Milvus 开源
  - Milvus 的工作原理
  - zilliz
  - zilliz cloud
  - 云
  - Close()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Close()

此操作会关闭客户端连接并释放相关资源。

```go
func (c *Client) Close(ctx context.Context) error
```

**返回类型：**

*error*

**返回值：**

成功时返回 nil，否则返回描述具体错误的 error。

**异常：**

- **error**

    查看 `err != nil` 了解失败详情。

## 示例\{#example}

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	log.Fatal("failed to create client:", err)
}

err = cli.Close(ctx)
if err != nil {
	log.Fatal("failed to close client:", err)
}
```
