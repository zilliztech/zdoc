---
title: "NewInvertedIndex() | Go | v2"
slug: /go/go/v2-Index-NewInvertedIndex
sidebar_label: "NewInvertedIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この関数は、効率的なスカラーフィールドのフィルタリングのための転置インデックス構成を作成します。 | Go | v2"
type: docx
token: TxKwd5bEqoHUuLxqENic3Uv6nhg
sidebar_position: 14
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - NewInvertedIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewInvertedIndex()

この関数は、効率的なスカラーフィールドのフィルタリングのための転置インデックス構成を作成します。

```go
func NewInvertedIndex() Index
```

**戻り値:**

*[インデックス](./v2-Management-Index)*

インデックス構成のインスタンスです。これは、インデックスオプションを介して `CreateIndex()` に渡します。

## 例\{#example}

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
