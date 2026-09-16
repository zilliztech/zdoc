---
title: "NewDiskANNIndex() | Go | v2"
slug: /go/go/v2-Index-NewDiskANNIndex
sidebar_label: "NewDiskANNIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この関数は、大規模データセットに対するディスクベースの近似最近傍探索用の DiskANN インデックス構成を作成します。 | Go | v2"
type: docx
token: HWG7dWY6XoKyapx5L5Mc69kLnld
sidebar_position: 6
keywords: 
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - LLM-as-a-judge
  - zilliz
  - zilliz cloud
  - クラウド
  - NewDiskANNIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewDiskANNIndex()

この関数は、大規模データセットに対するディスクベースの近似最近傍探索用の DiskANN インデックス構成を作成します。

```go
func NewDiskANNIndex(metricType MetricType) Index
```

**パラメータ:**

- **[metricType](./v2-Management-MetricType)** (*[MetricType](./v2-Management-MetricType)*)

    類似検索に使用する距離メトリックタイプです（例：インデックス.COSINE、インデックス.L2、インデックス.IP）。

**戻り値:**

*[インデックス](./v2-Management-Index)*

インデックス構成のインスタンスです。これをインデックスオプションを介して `CreateIndex()` に渡します。

## 例\{#example}

```go
import (
	"github.com/milvus-io/milvus/client/v2/index"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

// Create index configuration
idx := index.NewDiskANNIndex(index.COSINE)

// Use with CreateIndex
createIdxOption := milvusclient.NewCreateIndexOption("collection_name", "vector_field", idx)
task, err := client.CreateIndex(ctx, createIdxOption)
```
