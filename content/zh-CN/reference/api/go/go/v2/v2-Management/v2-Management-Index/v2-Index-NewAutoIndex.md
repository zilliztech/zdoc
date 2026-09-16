---
title: "NewAutoIndex() | Go | v2"
slug: /go/go/v2-Index-NewAutoIndex
sidebar_label: "NewAutoIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此函数会创建一个 AUTOINDEX 配置，根据数据特征自动选择最佳的索引算法。 | Go | v2"
type: docx
token: GDYxdLJ9HopKQoxJqknckyI1neb
sidebar_position: 2
keywords: 
  - 混合向量搜索
  - 视频去重
  - 视频相似性搜索
  - 向量检索
  - zilliz
  - zilliz cloud
  - 云
  - NewAutoIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewAutoIndex()

此函数会创建一个 AUTOINDEX 配置，根据数据特征自动选择最佳的索引算法。

```go
func NewAutoIndex(metricType MetricType) Index
```

**参数：**

- **[metricType](./v2-Management-MetricType)** (*[MetricType](./v2-Management-MetricType)*)

    用于相似性搜索的距离度量类型（例如 index.COSINE、index.L2、index.IP）。

**返回：**

*[Index](./v2-Management-Index)*

一个索引配置实例。可通过 index 选项将其传递给 `CreateIndex()`。

## 示例\{#example}

```go
import (
	"github.com/milvus-io/milvus/client/v2/index"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

// Create index configuration
idx := index.NewAutoIndex(index.COSINE)

// Use with CreateIndex
createIdxOption := milvusclient.NewCreateIndexOption("collection_name", "vector_field", idx)
task, err := client.CreateIndex(ctx, createIdxOption)
```
