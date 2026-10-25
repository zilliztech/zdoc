---
title: "GetImportProgressResponse | Go | v2"
slug: /go/go/v2-DataImport-GetImportProgressResponse
sidebar_label: "GetImportProgressResponse"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "GetImportProgressResponse 实例是由 `GetImportProgress()` 包函数返回的响应。它嵌入 `ResponseBase`，并通过 `ImportProgressData` 公开详细的进度负载；该负载既包括作业的整体统计信息，也包括按文件划分的 `Details` 切片。 | Go | v2"
type: docx
token: UATqdiZsKo3HahxZYhQcZp6GnKg
sidebar_position: 6
keywords: 
  - 低成本向量 Database
  - 托管向量 Database
  - Pinecone 向量 Database
  - 音频搜索
  - zilliz
  - zilliz cloud
  - 云
  - GetImportProgressResponse
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GetImportProgressResponse

GetImportProgressResponse 实例是由 `GetImportProgress()` 包函数返回的响应。它嵌入 `ResponseBase`，并通过 `ImportProgressData` 公开详细的进度负载；该负载既包括作业的整体统计信息，也包括按文件划分的 `Details` 切片。

```go
type GetImportProgressResponse struct {
    ResponseBase
    Data *ImportProgressData
}
```

**字段：**

- **Status** (*int*) -

    继承自 `ResponseBase`。值为 `0` 表示成功。

- **Message** (*string*) -

    继承自 `ResponseBase`。当 `Status` 非零时的错误描述。

- **Data** (&ast;*ImportProgressData*) -

    所请求作业的进度负载。**ImportProgressData 字段：**。

- **CollectionName** (*string*) -

    该作业所针对的 Collection。

- **JobID** (*string*) -

    导入作业的唯一标识符。

- **State** (*string*) -

    当前作业状态。常见值包括 `Pending`、`Importing`、`Completed` 和 `Failed`。

- **Progress** (*int64*) -

    整体完成百分比，范围为 `[0, 100]`。

- **ImportedRows** (*int64*) -

    已导入到 Collection 中的行数。

- **TotalRows** (*int64*) -

    预期从所有源文件导入的总行数。

- **FileSize** (*int64*) -

    所有源文件的总大小，以字节为单位。

- **CompleteTime** (*string*) -

    作业完成时间戳；在作业达到终态之前为空。

- **Reason** (*string*) -

    当 `State == "Failed"` 时的失败原因；否则为空。

- **Details** (*[]\ImportProgressDetail*) -

    按文件划分的进度条目，其结构与父级字段相同，每个条目对应一个源文件。

## 示例\{#example}

演示 GetImportProgressResponse 的用法。

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

progress, err := milvusclient.GetImportProgress(ctx, milvusclient.NewGetImportProgressOption("<jobId>"))
if err != nil {
	// handle error
}
fmt.Println(progress.Data.State, progress.Data.ImportedRows, progress.Data.TotalRows)
```
