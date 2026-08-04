---
title: "RefreshExternalCollection() | Go | v2"
slug: /go/go/v2-Collection-RefreshExternalCollection
sidebar_label: "RefreshExternalCollection()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会扫描 schema 定义的外部存储中的数据文件，并生成元数据文件以记录它们与这些数据文件之间的映射关系。 | Go | v2"
type: docx
token: Mw42dp2VZoN4gFxdiSYcxDB8n0g
sidebar_position: 28
keywords: 
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - zilliz
  - zilliz cloud
  - cloud
  - RefreshExternalCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RefreshExternalCollection()

此操作会扫描 schema 定义的外部存储中的数据文件，并生成元数据文件以记录它们与这些数据文件之间的映射关系。

```go
func (c *Client) RefreshExternalCollection(ctx context.Context, option RefreshExternalCollectionOption, callOptions ...grpc.CallOption) (*RefreshExternalCollectionResult, error)
```

## 请求语法\{#request-syntax}

```go
option := client.NewRefreshExternalCollectionOption(collectionName).
    WithExternalSource(externalSource string).
    WithExternalSpec(externalSpec string).
    WithDbName(dbName string)
    
result, err := client.RefreshExternalCollection(option)
```

**参数：**

- **collectionName** (*string*) -

    现有外部集合的名称。

**构建器方法：**

- `WithExternalSource(externalSource string)`

    用于设置源数据 URI，它应为可访问的外部卷名称。

- `WithExternalSpec(externalSpec string)`

    外部源规格，是一组次级参数：

    - **format** (*string*) - 

        目标源数据文件的格式。

        可能的值包括 `parquet`、`vortex`、`lance-table` 和 `iceberg-table`。

- `WithDbName(dbName string)`

    目标外部集合所属数据库的名称。

**返回类型：**

*&ast;RefreshExternalCollectionResult*

**返回：**

一个具有以下结构的结构体。

```go
type RefreshExternalCollectionResult struct {
    JobID int64
}
```

**参数：**

- **JobID** (*int64*) -

    表示已创建的异步作业的整数。

## 示例\{#examples}

```python
refreshResult, err := client.RefreshExternalCollection(ctx,
    client.NewRefreshExternalCollectionOption("test_collection"))

jobID := refreshResult.JobID

for {
    progress, _ := client.GetRefreshExternalCollectionProgress(ctx,
        client.NewGetRefreshExternalCollectionProgressOption(jobID))

    fmt.Printf("State: %s\n", progress.State)

    if progress.State == entity.RefreshStateCompleted {
        fmt.Println("Refresh completed!")
        break
    }
    if progress.State == entity.RefreshStateFailed {
        fmt.Printf("Refresh failed: %s\n", progress.Reason)
        break
    }
    time.Sleep(2 * time.Second)
}
```
