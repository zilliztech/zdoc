---
title: "NewRTreeIndex() | Go | v2"
slug: /go/go/v2-Index-NewRTreeIndex
sidebar_label: "NewRTreeIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此函数会为几何字段上的空间数据查询创建 R-tree 索引配置。 | Go | v2"
type: docx
token: I053djRjsob1JJxKXvUcGelbn2d
sidebar_position: 21
keywords: 
  - HNSW
  - 什么是非结构化数据
  - 向量嵌入
  - 向量存储
  - Zilliz
  - Zilliz Cloud
  - 云
  - NewRTreeIndex()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# NewRTreeIndex()

此函数会为几何字段上的空间数据查询创建 R-tree 索引配置。

```go
func NewRTreeIndex() Index
```

**返回：**

*[Index](./v2-Management-Index)*

一个索引配置实例。通过索引选项将其传递给 `CreateIndex()`。

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
