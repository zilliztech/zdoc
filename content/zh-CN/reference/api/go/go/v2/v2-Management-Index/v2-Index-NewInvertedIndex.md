---
title: "NewInvertedIndex() | Go | v2"
slug: /go/go/v2-Index-NewInvertedIndex
sidebar_label: "NewInvertedIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此函数为高效的标量字段过滤创建倒排索引配置。 | Go | v2"
type: docx
token: TxKwd5bEqoHUuLxqENic3Uv6nhg
sidebar_position: 14
keywords: 
  - knn
  - 图像搜索
  - 大语言模型
  - 机器学习
  - zilliz
  - zilliz cloud
  - 云
  - NewInvertedIndex()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# NewInvertedIndex()

此函数会为高效的标量字段过滤创建倒排索引配置。

```go
func NewInvertedIndex() Index
```

**返回：**

*[Index](./v2-Management-Index)*

一个索引配置实例。请通过索引选项将其传递给 `CreateIndex()`。

## 示例\{#example}

```go
import (
	"github.com/milvus-io/milvus/client/v2/index"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

// Create index configuration
idx := index.NewInvertedIndex()

// Use with CreateIndex
createIdxOption := milvusclient.NewCreateIndexOption("collection_name", "vector_field", idx)
task, err := client.CreateIndex(ctx, createIdxOption)
```
