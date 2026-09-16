---
title: "NewAutoIndex() | Go | v2"
slug: /go/go/v2-Index-NewAutoIndex
sidebar_label: "NewAutoIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この関数は、データの特性に基づいて最適なインデックスアルゴリズムを自動的に選択する AUTOINDEX 構成を作成します。 | Go | v2"
type: docx
token: GDYxdLJ9HopKQoxJqknckyI1neb
sidebar_position: 2
keywords: 
  - ハイブリッドベクトル検索
  - 動画の重複排除
  - 動画の類似検索
  - ベクトル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - NewAutoIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewAutoIndex()

この関数は、データの特性に基づいて最適なインデックスアルゴリズムを自動的に選択する AUTOINDEX 構成を作成します。

```go
func NewAutoIndex(metricType MetricType) Index
```

**パラメータ:**

- **[metricType](./v2-Management-MetricType)** (*[MetricType](./v2-Management-MetricType)*)

    類似検索に使用する距離メトリックタイプです（例：インデックス.COSINE、インデックス.L2、インデックス.IP）。

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
idx := index.NewAutoIndex(index.COSINE)

// Use with CreateIndex
createIdxOption := milvusclient.NewCreateIndexOption("collection_name", "vector_field", idx)
task, err := client.CreateIndex(ctx, createIdxOption)
```
