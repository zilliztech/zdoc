---
title: "BulkImportResponse | Go | v2"
slug: /go/go/v2-DataImport-BulkImportResponse
sidebar_label: "BulkImportResponse"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "BulkImportResponse 实例是 `BulkImport()` 包函数返回的响应。它嵌入 `ResponseBase` 以提供通用的 `Status` 和 `Message` 字段，并在 `Data.JobID` 下公开分配的导入任务 ID。在读取 `Data` 之前，请使用嵌入的 `CheckStatus()` 方法验证调用是否成功。 | Go | v2"
type: docx
token: IeoJdXXQHo2E0Vx9l0CczMKAnSv
sidebar_position: 3
keywords: 
  - 视频相似度搜索
  - 向量检索
  - 音频相似度搜索
  - 弹性向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - BulkImportResponse
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# BulkImportResponse

BulkImportResponse 实例是 `BulkImport()` 包函数返回的响应。它嵌入 `ResponseBase` 以提供通用的 `Status` 和 `Message` 字段，并在 `Data.JobID` 下公开分配的导入任务 ID。在读取 `Data` 之前，请使用嵌入的 `CheckStatus()` 方法验证调用是否成功。

```go
type BulkImportResponse struct {
    ResponseBase
    Data struct {
    JobID string
}
```

**字段：**

- **Status** (*int*) -

    继承自 `ResponseBase`。值为 `0` 表示成功；任何其他值表示错误。

- **Message** (*string*) -

    继承自 `ResponseBase`。当 `Status` 非零时，提供人类可读的错误描述。

- **Data.JobID** (*string*) -

    为提交的批量导入任务分配的唯一标识符。将其传递给 `GetImportProgress()` 以跟踪完成情况。

**构建器方法：**

- `CheckStatus()`

    此方法验证响应状态。当 `Status == 0` 时返回 nil；否则返回包含 `Status` 和 `Message` 的格式化错误。

## 示例\{#example}

演示 BulkImportResponse 的用法。

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

resp, err := milvusclient.BulkImport(ctx, milvusclient.NewBulkImportOption("milvus-bulk-imp", "https://example.com/rows.json"))
if err != nil {
	// handle error
}
if err := resp.CheckStatus(); err != nil {
	// handle non-zero status
}
fmt.Println(resp.Data.JobID)
```
