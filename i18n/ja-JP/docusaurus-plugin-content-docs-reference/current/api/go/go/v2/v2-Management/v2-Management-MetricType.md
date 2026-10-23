---
title: "MetricType | Go | v2"
slug: /go/go/v2-Management-MetricType
sidebar_label: "MetricType"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "MetricType インスタンスは、ベクトル類似検索に使用する距離メトリクスタイプを列挙します。 | Go | v2"
type: docx
token: DWgIdWBkWoypMGx36Dmcf41AnGg
sidebar_position: 21
keywords: 
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - クラウド
  - MetricType
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# MetricType

MetricType インスタンスは、ベクトル類似検索に使用する距離メトリクスタイプを列挙します。

```go
type MetricType string
```

**値:**

- **L2** = "L2"

    ユークリッド（L2）距離。値が小さいほど類似度が高くなります。

- **IP** = "IP"

    内積距離。値が大きいほど類似度が高くなります。

- **COSINE** = "COSINE"

    コサイン類似度。値の範囲は -1 から 1 で、1 が最も類似していることを示します。

- **HAMMING** = "HAMMING"

    バイナリベクトル用のハミング距離。

- **JACCARD** = "JACCARD"

    バイナリベクトル用の Jaccard 距離。

- **TANIMOTO** = "TANIMOTO"

    バイナリベクトル用の Tanimoto 距離。

- **SUBSTRUCTURE** = "SUBSTRUCTURE"

    バイナリベクトル用の Substructure 距離。

- **SUPERSTRUCTURE** = "SUPERSTRUCTURE"

    バイナリベクトル用の Superstructure 距離。

- **BM25** = "BM25"

    全文検索用の BM25 関連性スコア。

- **MHJACCARD** = "MHJACCARD"

    MHJACCARD。

- **MaxSim** = "MAX_SIM"

    MaxSim。

- **MaxSimCosine** = "MAX_SIM_COSINE"

    MaxSimCosine。

- **MaxSimL2** = "MAX_SIM_L2"

    MaxSimL2。

- **MaxSimIP** = "MAX_SIM_IP"

    MaxSimIP。

- **MaxSimHamming** = "MAX_SIM_HAMMING"

    MaxSimHamming。

- **MaxSimJaccard** = "MAX_SIM_JACCARD"

    MaxSimJaccard。

## 例\{#example}

MetricType の使用例を示します。

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v3/index"
	"github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    // handle error
}

defer cli.Close(ctx)

// Use MetricType when creating an index
// L2 (Euclidean distance) for float vectors
hnswIndex := index.NewHNSWIndex(entity.L2, 16, 200)
_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption(
    "my_collection", "embedding", hnswIndex))
if err != nil {
    // handle error
}

// IP (Inner Product) for normalized vectors
ipIndex := index.NewHNSWIndex(entity.IP, 16, 200)
_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption(
    "my_collection", "normalized_embedding", ipIndex))
if err != nil {
    // handle error
}
```
