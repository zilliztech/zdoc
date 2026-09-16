---
title: "NewRTreeIndex() | Go | v2"
slug: /go/go/v2-Index-NewRTreeIndex
sidebar_label: "NewRTreeIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此函数会创建一个 R-tree 索引配置，用于对几何字段进行空间数据查询。 | Go | v2"
type: docx
token: I053djRjsob1JJxKXvUcGelbn2d
sidebar_position: 21
keywords: 
  - HNSW
  - 什么是非结构化数据
  - 向量嵌入
  - 向量存储
  - zilliz
  - zilliz cloud
  - 云
  - NewRTreeIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewRTreeIndex()

此函数会创建一个 R-tree 索引配置，用于对几何字段进行空间数据查询。

```go
func NewRTreeIndex() Index
```

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
idx := index.NewRTreeIndex()

// Use with CreateIndex
createIdxOption := milvusclient.NewCreateIndexOption("collection_name", "vector_field", idx)
task, err := client.CreateIndex(ctx, createIdxOption)
```
