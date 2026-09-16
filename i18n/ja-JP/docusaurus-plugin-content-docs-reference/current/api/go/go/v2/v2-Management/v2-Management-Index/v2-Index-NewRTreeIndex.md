---
title: "NewRTreeIndex() | Go | v2"
slug: /go/go/v2-Index-NewRTreeIndex
sidebar_label: "NewRTreeIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この関数は、ジオメトリフィールドに対する空間データクエリ用の R-tree インデックス設定を作成します。 | Go | v2"
type: docx
token: I053djRjsob1JJxKXvUcGelbn2d
sidebar_position: 21
keywords: 
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み
  - ベクトルストア
  - zilliz
  - zilliz cloud
  - cloud
  - NewRTreeIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewRTreeIndex()

この関数は、ジオメトリフィールドに対する空間データクエリ用の R-tree インデックス設定を作成します。

```go
func NewRTreeIndex() Index
```

**戻り値:**

*[インデックス](./v2-Management-Index)*

インデックス設定のインスタンスです。これをインデックスオプションを介して `CreateIndex()` に渡します。

## 例\{#example}

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
