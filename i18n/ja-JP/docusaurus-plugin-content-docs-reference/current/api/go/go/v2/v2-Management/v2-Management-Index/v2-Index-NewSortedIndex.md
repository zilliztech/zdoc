---
title: "NewSortedIndex() | Go | v2"
slug: /go/go/v2-Index-NewSortedIndex
sidebar_label: "NewSortedIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この関数は、範囲ベースのスカラーフィールドクエリ用のソート済みインデックス設定を作成します。 | Go | v2"
type: docx
token: JTQrddtCJoJBjwxrKZrcn1lPnEe
sidebar_position: 23
keywords: 
  - RAG LLM アーキテクチャ
  - プライベート LLM
  - NN 検索
  - LLM 評価
  - zilliz
  - zilliz cloud
  - cloud
  - NewSortedIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewSortedIndex()

この関数は、範囲ベースのスカラーフィールドクエリ用のソート済みインデックス設定を作成します。

```go
func NewSortedIndex() Index
```

**戻り値:**

*[インデックス](./v2-Management-Index)*

インデックス設定のインスタンスです。これは、インデックスオプションを介して `CreateIndex()` に渡します。

## 例\{#example}

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
