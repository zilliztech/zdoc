---
title: "NewTrieIndex() | Go | v2"
slug: /go/go/v2-Index-NewTrieIndex
sidebar_label: "NewTrieIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此函数会创建一个 Trie 索引配置，用于高效执行基于前缀的字符串字段过滤。 | Go | v2"
type: docx
token: MSFrdlGjaoh9zdxHuZqcf6VsnDw
sidebar_position: 26
keywords: 
  - Zilliz
  - milvus 向量 Database
  - milvus db
  - milvus 向量 db
  - zilliz
  - zilliz cloud
  - 云
  - NewTrieIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewTrieIndex()

此函数会创建一个 Trie 索引配置，用于高效执行基于前缀的字符串字段过滤。

```go
func NewTrieIndex() Index
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
idx := index.NewTrieIndex()

// Use with CreateIndex
createIdxOption := milvusclient.NewCreateIndexOption("collection_name", "vector_field", idx)
task, err := client.CreateIndex(ctx, createIdxOption)
```
