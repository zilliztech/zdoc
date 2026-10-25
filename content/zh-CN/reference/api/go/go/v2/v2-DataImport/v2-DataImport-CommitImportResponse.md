---
title: "CommitImportResponse | Go | v2"
slug: /go/go/v2-DataImport-CommitImportResponse
sidebar_label: "CommitImportResponse"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "CommitImportResponse 实例是由 `CommitImport()` 包函数返回的响应。它内嵌 `ResponseBase`，以提供通用的 `Status` 和 `Message` 字段。可使用内嵌的 `CheckStatus()` 方法验证调用是否成功。 | Go | v2"
type: docx
token: LW1QdbAnlocdjuxaVa8c401Wnyv
sidebar_position: 15
keywords: 
  - AI 聊天机器人
  - 余弦距离
  - 什么是向量 Database
  - 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - CommitImportResponse
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# CommitImportResponse

CommitImportResponse 实例是由 `CommitImport()` 包函数返回的响应。它内嵌 `ResponseBase`，以提供通用的 `Status` 和 `Message` 字段。可使用内嵌的 `CheckStatus()` 方法验证调用是否成功。

```go
type CommitImportResponse struct {
    ResponseBase
}
```

**字段：**

- **Status** （*int*） -

    继承自 `ResponseBase`。值为 `0` 表示成功；任何其他值表示错误。

- **Message** （*string*） -

    继承自 `ResponseBase`。当 `Status` 不为零时，提供人类可读的错误描述。

**构建器方法：**

- `CheckStatus()`

    此方法用于验证响应状态。当 `Status == 0` 时返回 nil；否则返回包含 `Status` 和 `Message` 的格式化错误。

## 示例\{#example}

演示 CommitImportResponse 的用法。

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

resp, err := milvusclient.CommitImport(ctx, milvusclient.NewCommitImportOption("<jobId>", "https://example.com/rows.json"))
if err != nil {
	// handle error
}
if err := resp.CheckStatus(); err != nil {
	// handle non-zero status
}
```
