---
title: "BulkImportResponse | Go | v2"
slug: /go/go/v2-DataImport-BulkImportResponse
sidebar_label: "BulkImportResponse"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此类表示 `BulkImport()` 包函数返回的响应。它嵌入了 `ResponseBase` 以提供通用的 `Status` 和 `Message` 字段，并通过 `Data.JobID` 暴露分配的导入任务 ID。在读取 `Data` 之前，请使用嵌入的 `CheckStatus()` 方法验证调用是否成功。 | Go | v2"
type: docx
token: A3WWdqm52oLqtuxaR9EcjmybnwT
sidebar_position: 3
keywords: 
  - 视频相似性搜索
  - 向量检索
  - 音频相似性搜索
  - 弹性向量数据库
  - zilliz
  - zilliz cloud
  - cloud
  - BulkImportResponse
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# BulkImportResponse

此类表示 `BulkImport()` 包函数返回的响应。它嵌入了 `ResponseBase` 以提供通用的 `Status` 和 `Message` 字段，并通过 `Data.JobID` 暴露分配的导入任务 ID。在读取 `Data` 之前，请使用嵌入的 `CheckStatus()` 方法验证调用是否成功。

```go
type BulkImportResponse struct {
    ResponseBase
    Data struct {
        JobID string `json:"jobId"`
    } `json:"data"`
}
```

**字段：**

- **Status** (*int*) -<br/>
  继承自 `ResponseBase`。值为 `0` 表示成功；任何其他值都表示错误。

- **Message** (*string*) -<br/>
  继承自 `ResponseBase`。当 `Status` 非零时，表示人类可读的错误描述。

- **Data.JobID** (*string*) -<br/>
  分配给已提交批量导入任务的唯一标识符。将其传递给 `GetImportProgress()` 以跟踪完成进度。

**方法：**

- `CheckStatus()`

    此方法用于验证响应状态。当 `Status == 0` 时返回 nil；否则返回一个包含 `Status` 和 `Message` 的格式化错误。
