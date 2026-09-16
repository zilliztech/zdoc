---
title: "NewTrieIndex() | Go | v2"
slug: /go/go/v2-Index-NewTrieIndex
sidebar_label: "NewTrieIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この関数は、プレフィックスベースの文字列フィールドフィルタリングを効率的に行うための Trie インデックス設定を作成します。 | Go | v2"
type: docx
token: MSFrdlGjaoh9zdxHuZqcf6VsnDw
sidebar_position: 26
keywords: 
  - Zilliz
  - milvus ベクトル データベース
  - milvus db
  - milvus ベクトル db
  - zilliz
  - zilliz cloud
  - cloud
  - NewTrieIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewTrieIndex()

この関数は、プレフィックスベースの文字列フィールドフィルタリングを効率的に行うための Trie インデックス設定を作成します。

```go
func NewTrieIndex() Index
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
idx := index.NewTrieIndex()

// Use with CreateIndex
createIdxOption := milvusclient.NewCreateIndexOption("collection_name", "vector_field", idx)
task, err := client.CreateIndex(ctx, createIdxOption)
```
