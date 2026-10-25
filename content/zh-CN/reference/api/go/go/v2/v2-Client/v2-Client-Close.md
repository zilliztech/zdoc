---
title: "Close | Go | v2"
slug: /go/go/v2-Client-Close
sidebar_label: "Close"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会关闭客户端的 gRPC 连接并释放其资源。当不再需要该客户端时，请调用此方法，通常通过 `defer` 调用。 | Go | v2"
type: docx
token: W1r5dHqUioRaR7xOyWVcrYPLnvg
sidebar_position: 2
keywords: 
  - Annoy 向量搜索
  - Milvus
  - Zilliz
  - Milvus 向量 Database
  - zilliz
  - Zilliz Cloud
  - 云
  - Close
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# Close

此操作会关闭客户端的 gRPC 连接并释放其资源。当不再需要该客户端时，请调用此方法，通常通过 `defer` 调用。

```go
func (c *Client) Close(ctx context.Context) error
```

## 请求语法\{#request-syntax}

为 Close() 创建请求。

````go
func (c *Client) Close(ctx context.Context) error
```

**PARAMETERS:**

- **ctx** (*context.Context*)

    The context for the closing operation. The context is used for cancellation and deadlines.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error if the underlying connection failed to close.

**EXCEPTIONS:**

- **error**

    Check `err != nil` for failure details.
````

**参数：**

- **ctx** （*context.Context*） -

    用于关闭操作的上下文。该上下文用于取消和截止时间。

**返回类型：**

*error*

**返回：**

成功时返回 nil；如果底层连接关闭失败，则返回错误。

**错误处理：**

- **error**

    操作失败。查看 `err != nil` 了解失败详情。

## 示例\{#example}

演示 Close() 的用法。

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
	// handle error
}

defer cli.Close(ctx)
```
