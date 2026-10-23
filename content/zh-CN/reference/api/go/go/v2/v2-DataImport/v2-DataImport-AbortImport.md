---
title: "AbortImport | Go | v2"
slug: /go/go/v2-DataImport-AbortImport
sidebar_label: "AbortImport"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作通过 RESTful 导入 API 中止批量导入任务。 | Go | v2"
type: docx
token: MYVqdXiLjoYbB2xQeQHcjrf1nmu
sidebar_position: 10
keywords: 
  - 混合向量搜索
  - 视频去重
  - 视频相似性搜索
  - 向量检索
  - Zilliz
  - Zilliz Cloud
  - 云
  - AbortImport
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AbortImport

此操作通过 RESTful 导入 API 中止批量导入任务。

<Admonition type="info" title="Notes">

使用此操作可停止正在进行的导入任务，并丢弃截至目前已暂存的数据。

</Admonition>

<Admonition type="info" title="Notes">

`AbortImport()` 是 `github.com/milvus-io/milvus/client/v3/bulkwriter` 中的包级函数，而不是 `*milvusclient.Client` 上的方法。它直接调用 REST `/v2/vectordb/jobs/import/abort` Endpoint，因此同时适用于 Milvus 开源集群（使用 `NewAbortImportOption`）和 Zilliz Cloud（使用 `NewCloudAbortImportOption`）。

</Admonition>

```go
func AbortImport(ctx context.Context, option *AbortImportOption) (*AbortImportResponse, error)
```

## 请求语法\{#request-syntax}

为 AbortImport() 创建请求。

```go
option := bulkwriter.NewAbortImportOption(uri, jobID).
    WithAPIKey(apiKey)

resp, err := bulkwriter.AbortImport(ctx, option)
```

**参数：**

- **ctx** (*context.Context*) -

    用于取消和设置截止时间的上下文。HTTP 请求会继承此上下文，因此取消该上下文会中止正在进行的调用。

- **option** (*AbortImportOption*) -

    使用 `NewAbortImportOption()` 为自托管 Milvus 创建的中止选项，或使用 `NewCloudAbortImportOption()` 为 Zilliz Cloud 创建的中止选项。需要提供 `BulkImport()` 返回的任务 ID。

**返回类型：**

&ast;*AbortImportResponse, error*

**返回：**

一个嵌入通用 `Status` 和 `Message` 字段的 `AbortImportResponse`。如果请求无法序列化、HTTP 调用失败或服务器返回非零状态，则返回错误。

```go
type AbortImportResponse struct {
    ResponseBase
}
```

**参数：**

- **Status** (*int*) -

    继承自 `ResponseBase`。值为 `0` 表示成功；其他任何值表示错误。

- **Message** (*string*) -

    继承自 `ResponseBase`。当 `Status` 非零时，为人类可读的错误描述。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。常见失败包括选项载荷格式错误、网络错误、身份验证被拒绝（`WithAPIKey` 设置不正确时）以及通过响应状态呈现的服务器端验证错误。

## 示例\{#example}

演示 AbortImport() 的用法。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/bulkwriter"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "http://YOUR_CLUSTER_ENDPOINT"
jobID := "453291002847301"

option := bulkwriter.NewAbortImportOption(milvusAddr, jobID).
	WithAPIKey("YOUR_CLUSTER_TOKEN")

resp, err := bulkwriter.AbortImport(ctx, option)
if err != nil {
	log.Fatal(err)
}

if resp.Status != 0 {
	log.Fatalf("abort import failed: %s", resp.Message)
}
```
