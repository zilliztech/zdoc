---
title: "NewDiskANNIndex() | Go | v2"
slug: /go/go/v2-Index-NewDiskANNIndex
sidebar_label: "NewDiskANNIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此函数会创建一个 DiskANN 索引配置，用于在大规模数据集上执行基于磁盘的近似最近邻搜索。 | Go | v2"
type: docx
token: HWG7dWY6XoKyapx5L5Mc69kLnld
sidebar_position: 6
keywords: 
  - 多模态搜索
  - 向量搜索算法
  - 问答系统
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - 云
  - NewDiskANNIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewDiskANNIndex()

此函数会创建一个 DiskANN 索引配置，用于在大规模数据集上执行基于磁盘的近似最近邻搜索。

```go
func NewDiskANNIndex(metricType MetricType) Index
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
idx := index.NewDiskANNIndex(index.COSINE)

// Use with CreateIndex
createIdxOption := milvusclient.NewCreateIndexOption("collection_name", "vector_field", idx)
task, err := client.CreateIndex(ctx, createIdxOption)
```
