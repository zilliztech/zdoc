---
title: "AbortImportResponse | Go | v2"
slug: /go/go/v2-DataImport-AbortImportResponse
sidebar_label: "AbortImportResponse"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "AbortImportResponse 实例是 `AbortImport()` 包函数返回的响应。它嵌入 `ResponseBase`，以提供通用的 `Status` 和 `Message` 字段。使用嵌入的 `CheckStatus()` 方法可验证调用是否成功。 | Go | v2"
type: docx
token: Qle2dHiIuozcv4x6la2cZr7cnWe
sidebar_position: 12
keywords: 
  - 知识库
  - 自然语言处理
  - AI 聊天机器人
  - 余弦距离
  - zilliz
  - zilliz cloud
  - 云
  - AbortImportResponse
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AbortImportResponse

AbortImportResponse 实例是 `AbortImport()` 包函数返回的响应。它嵌入 `ResponseBase`，以提供通用的 `Status` 和 `Message` 字段。使用嵌入的 `CheckStatus()` 方法可验证调用是否成功。

```go
type AbortImportResponse struct {
    ResponseBase
}
```

**FIELDS:**

- **Status** (*int*) -

    继承自 `ResponseBase`。值为 `0` 表示成功；其他任何值表示错误。

- **Message** (*string*) -

    继承自 `ResponseBase`。当 `Status` 非零时，提供人类可读的错误描述。

**BUILDER METHODS:**

- `CheckStatus()`

    此方法用于验证响应状态。当 `Status == 0` 时返回 nil；否则返回一个包含 `Status` 和 `Message` 的格式化错误。

## 示例\{#example}

演示 AbortImportResponse 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

resp, err := milvusclient.AbortImport(ctx, milvusclient.NewAbortImportOption("<jobId>"))
if err != nil {
	// handle error
}
if err := resp.CheckStatus(); err != nil {
	// handle non-zero status
}
```
