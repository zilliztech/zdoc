---
title: "ColumnText | Go | v2"
slug: /go/go/v2-Vector-ColumnText
sidebar_label: "ColumnText"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "ColumnText 实例表示一个保存字符串值的 TEXT 字段列，用于插入、upsert 和查询输出。请使用 NewColumnText() 创建该实例。 | Go | v2"
type: docx
token: RPoPdeGegozh2sxjgXBcKppfneb
sidebar_position: 22
keywords: 
  - NLP 搜索
  - LLM 幻觉
  - 多模态搜索
  - 向量搜索算法
  - Zilliz
  - Zilliz Cloud
  - 云
  - ColumnText
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnText

ColumnText 实例表示一个保存字符串值的 TEXT 字段列，用于插入、upsert 和查询输出。请使用 NewColumnText() 创建该实例。

```go
type ColumnText struct {
}
```

**构建器方法：**

- `Slice(start, end int) Column`

    返回一个跨越指定行范围的子列。

## 示例\{#example}

演示 ColumnText 的用法。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnText("summary", []string{"first", "second"})
fmt.Println(values.Len())
```
