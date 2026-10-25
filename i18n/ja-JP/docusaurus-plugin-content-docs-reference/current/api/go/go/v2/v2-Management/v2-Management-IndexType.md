---
title: "IndexType | Go | v2"
slug: /go/go/v2-Management-IndexType
sidebar_label: "IndexType"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "IndexType インスタンスは、ベクトルフィールドとスカラーフィールドでサポートされるインデックスアルゴリズムを列挙します。 | Go | v2"
type: docx
token: EJ5EdgllloCp0vxdwN0c2Kw1nyC
sidebar_position: 15
keywords: 
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - 情報検索
  - zilliz
  - zilliz cloud
  - cloud
  - IndexType
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# IndexType

IndexType インスタンスは、ベクトルフィールドとスカラーフィールドでサポートされるインデックスアルゴリズムを列挙します。

```go
type IndexType string
```

**値:**

- **Flat** = "FLAT"

    Flat（総当たり）インデックスです。正確ですが、大規模なデータセットでは低速です。

- **BinFlat** = "BIN_FLAT"

    バイナリベクトル用の Flat インデックスです。

- **IvfFlat** = "IVF_FLAT"

    フラット量子化を使用する IVF です。精度/speed のバランスが良好です。

- **BinIvfFlat** = "BIN_IVF_FLAT"

    バイナリベクトル用の IVF-Flat です。

- **IvfPQ** = "IVF_PQ"

    積量子化を使用する IVF です。メモリ効率に優れています。

- **IvfSQ8** = "IVF_SQ8"

    8 ビットスカラー量子化を使用する IVF です。

- **IvfRabitQ** = "IVF_RABITQ"

    RaBitQ 量子化を使用する IVF です。

- **HNSW** = "HNSW"

    階層型 Navigable Small World グラフです。高い再現率と高速な検索を実現します。

- **HNSWSQ** = "HNSW_SQ"

    メモリ使用量を削減するためのスカラー量子化を備えた HNSW です。

- **HNSWPQ** = "HNSW_PQ"

    メモリ使用量を削減するための積量子化を備えた HNSW です。

- **HNSWPRQ** = "HNSW_PRQ"

    メモリ使用量を削減するための積残差量子化を備えた HNSW です。

- **IvfHNSW** = "IVF_HNSW"

    IVF と HNSW を組み合わせたインデックスです。

- **AUTOINDEX** = "AUTOINDEX"

    最適なインデックスタイプを自動的に選択します。

- **DISKANN** = "DISKANN"

    大規模データセット向けのディスクベース ANN インデックスです。

- **AISAQ** = "AISAQ"

    PQ コードをグラフとインラインに保持し、ホップあたりのランダム読み取りを削減する DiskANN のバリアントです。

- **SCANN** = "SCANN"

    ScaNN（Scalable Nearest Neighbors）インデックスです。

- **MinHashLSH** = "MINHASH_LSH"

    集合の類似度向けの MinHash LSH インデックスです。

- **SparseInverted** = "SPARSE_INVERTED_INDEX"

    スパースベクトル用の転置インデックスです。

- **SparseWAND** = "SPARSE_WAND"

    スパースベクトル検索用の WAND アルゴリズムです。

- **GPUIvfFlat** = "GPU_IVF_FLAT"

    GPU で高速化された IVF-Flat インデックスです。

- **GPUIvfPQ** = "GPU_IVF_PQ"

    GPU で高速化された IVF-PQ インデックスです。

- **GPUCagra** = "GPU_CAGRA"

    GPU で高速化された CAGRA グラフインデックスです。

- **GPUBruteForce** = "GPU_BRUTE_FORCE"

    GPU で高速化された総当たりインデックスです。

- **Trie** = "Trie"

    文字列フィールド用の Trie インデックスです。

- **Sorted** = "STL_SORT"

    スカラーフィールド用のソート済みインデックスです。

- **Inverted** = "INVERTED"

    スカラーフィールド用の転置インデックスです。

- **NGRAM** = "NGRAM"

    VARCHAR フィールド用の N-gram インデックスで、部分文字列演算子（LIKE の前方一致 / 中間一致 / 後方一致および正規表現一致）を高速化します。

- **FMINDEX** = "FMINDEX"

    VARCHAR フィールド用の FM インデックスで、候補を再チェックすることなく、アンカー付き LIKE（前方一致 / 中間一致 / 後方一致）に正確に応答します。

- **BITMAP** = "BITMAP"

    カーディナリティの低いスカラーフィールド用のビットマップインデックスです。

- **RTREE** = "RTREE"

    空間データ用の R-tree インデックスです。

## 例\{#example}

IndexType の使用方法を示します。

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

// Create an HNSW index on a float vector field
hnswIndex := index.NewHNSWIndex(entity.L2, 16, 200)
_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption(
    "my_collection", "embedding", hnswIndex))
if err != nil {
    // handle error
}

// Create an IVF_FLAT index
ivfIndex := index.NewIvfFlatIndex(entity.L2, 128)
_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption(
    "my_collection", "embedding2", ivfIndex))
if err != nil {
    // handle error
}
```
