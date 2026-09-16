---
title: "NewBitmapIndex() | Go | v2"
slug: /go/go/v2-Index-NewBitmapIndex
sidebar_label: "NewBitmapIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この関数は、カーディナリティの低いスカラーフィールドを効率的にフィルタリングするためのビットマップインデックス設定を作成します。 | Go | v2"
type: docx
token: EhzHdkYfUoOsprxhtPNcmMPKnEc
sidebar_position: 5
keywords: 
  - Pinecone ベクトルデータベース
  - 音声検索
  - セマンティック検索とは
  - 埋め込みモデル
  - zilliz
  - zilliz cloud
  - cloud
  - NewBitmapIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewBitmapIndex()

この関数は、カーディナリティの低いスカラーフィールドを効率的にフィルタリングするためのビットマップインデックス設定を作成します。

```go
func NewBitmapIndex() Index
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
idx := index.NewBitmapIndex()

// Use with CreateIndex
createIdxOption := milvusclient.NewCreateIndexOption("collection_name", "vector_field", idx)
task, err := client.CreateIndex(ctx, createIdxOption)
```
