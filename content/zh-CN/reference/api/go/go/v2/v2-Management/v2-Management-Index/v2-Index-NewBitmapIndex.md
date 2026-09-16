---
title: "NewBitmapIndex() | Go | v2"
slug: /go/go/v2-Index-NewBitmapIndex
sidebar_label: "NewBitmapIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此函数会创建一个 Bitmap 索引配置，用于对低基数标量字段进行高效过滤。 | Go | v2"
type: docx
token: EhzHdkYfUoOsprxhtPNcmMPKnEc
sidebar_position: 5
keywords: 
  - Pinecone 向量 Database
  - 音频搜索
  - 什么是语义搜索
  - 嵌入模型
  - zilliz
  - zilliz cloud
  - 云
  - NewBitmapIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewBitmapIndex()

此函数会创建一个 Bitmap 索引配置，用于对低基数标量字段进行高效过滤。

```go
func NewBitmapIndex() Index
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
idx := index.NewBitmapIndex()

// Use with CreateIndex
createIdxOption := milvusclient.NewCreateIndexOption("collection_name", "vector_field", idx)
task, err := client.CreateIndex(ctx, createIdxOption)
```
