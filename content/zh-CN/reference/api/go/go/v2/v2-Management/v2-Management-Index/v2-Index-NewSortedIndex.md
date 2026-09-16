---
title: "NewSortedIndex() | Go | v2"
slug: /go/go/v2-Index-NewSortedIndex
sidebar_label: "NewSortedIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此函数会创建一个排序索引配置，用于基于范围的标量字段查询。 | Go | v2"
type: docx
token: JTQrddtCJoJBjwxrKZrcn1lPnEe
sidebar_position: 23
keywords: 
  - RAG LLM 架构
  - 私有 LLM
  - 最近邻搜索
  - LLM 评估
  - zilliz
  - zilliz cloud
  - 云
  - NewSortedIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewSortedIndex()

此函数会创建一个排序索引配置，用于基于范围的标量字段查询。

```go
func NewSortedIndex() Index
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
idx := index.NewSortedIndex()

// Use with CreateIndex
createIdxOption := milvusclient.NewCreateIndexOption("collection_name", "vector_field", idx)
task, err := client.CreateIndex(ctx, createIdxOption)
```
