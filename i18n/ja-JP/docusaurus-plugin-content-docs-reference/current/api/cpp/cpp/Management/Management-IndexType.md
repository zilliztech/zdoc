---
title: "IndexType | Cloud"
slug: /cpp/cpp/Management-IndexType
sidebar_label: "IndexType"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この列挙型はインデックスアルゴリズムを指定するために使用します。`IndexType` の値を `IndexDesc` に渡して `CreateIndex()` を呼び出してください。有効な選択肢はフィールドのデータ型によって異なります。 | Cloud"
type: docx
token: WiGbdKAIsoACkixKYHqcVz41npf
sidebar_position: 14
keywords: 
  - ベクトルデータベースのチュートリアル
  - ベクトルデータベースの仕組み
  - ベクトル DB の比較
  - OpenAI ベクトル DB
  - zilliz
  - zilliz cloud
  - クラウド
  - IndexType
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# IndexType

この列挙型はインデックスアルゴリズムを指定するために使用します。`IndexType` の値を `IndexDesc` に渡して `CreateIndex()` を呼び出してください。有効な選択肢はフィールドのデータ型によって異なります。

```c++
enum class IndexType {
    INVALID = 0,
    // Dense float — CPU
    FLAT = 1, IVF_FLAT = 2, IVF_SQ8 = 3, IVF_PQ = 4,
    HNSW = 5, DISKANN = 6, AUTOINDEX = 7, SCANN = 8,
    HNSW_SQ = 9, HNSW_PQ = 10, HNSW_PRQ = 11, IVF_RABITQ = 12,
    // Dense float — GPU
    GPU_IVF_FLAT = 201, GPU_IVF_PQ = 202,
    GPU_BRUTE_FORCE = 203, GPU_CAGRA = 204,
    // Binary vectors
    BIN_FLAT = 1001, BIN_IVF_FLAT = 1002, MINHASH_LSH = 1003,
    // Scalar fields
    TRIE = 1101, STL_SORT = 1102, INVERTED = 1103,
    BITMAP = 1104, NGRAM = 1105, FMINDEX = 1106,
    // Sparse vectors
    SPARSE_INVERTED_INDEX = 1201, SPARSE_WAND = 1202,
};
```

**値：**

*密な浮動小数点ベクトル — CPU（`FLOAT_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`INT8_VECTOR`）：*

- **FLAT**（1） - ブルートフォースによる厳密検索です。再現率は 100% で、トレーニングは不要です。小規模なデータセット（100 万ベクトル未満）に最適です。

- **IVF_FLAT**（2） - 転置ファイルインデックスです。ベクトルを `nlist` 個のバケットにクラスタリングし、最も近い `nprobe` 個のバケットを検索します。追加パラメーター：`nlist`（必須）。

- **IVF_SQ8**（3） - スカラー量子化（int8）を使用する IVF です。再現率がわずかに低下しますが、`IVF_FLAT` よりメモリ使用量を抑えられます。追加パラメーター：`nlist`（必須）。

- **IVF_PQ**（4） - 積量子化を使用する IVF です。圧縮率が最も高くなります。追加パラメーター：`nlist`、`m`、`nbits`。

- **HNSW**（5） - Hierarchical Navigable Small World グラフです。インメモリデータセットで、速度と再現率のバランスが最も優れています。追加パラメーター：`M`（必須）、`efConstruction`（必須）。

- **DISKANN**（6） - RAM に収まらない大規模なデータセット向けの、ディスクベースの ANN インデックスです。少ないメモリで良好な再現率を実現します。

- **AUTOINDEX**（7） - Milvus がデータに最適なインデックスタイプとパラメーターを自動選択します。クイックスタートに推奨されます。

- **SCANN**（8） - ScaNN（Scalable Nearest Neighbors）アルゴリズムです。競争力のある速度で高い再現率を実現します。

- **HNSW_SQ**（9） - スカラー量子化を使用する HNSW です。再現率の低下を最小限に抑えつつ、`HNSW` よりメモリ使用量を削減します。

- **HNSW_PQ**（10） - 積量子化を使用する HNSW です。再現率がいくらか低下する代わりに、メモリ使用量をさらに削減します。

- **HNSW_PRQ**（11） - 積残差量子化を使用する HNSW です。HNSW の量子化バリアントの中で最も高い再現率を実現します。

- **IVF_RABITQ**（12） - RaBitQ バイナリ量子化を使用する IVF です。メモリ使用量が非常に少なく、競争力のある再現率を実現します。

*密な浮動小数点ベクトル — GPU：*

- **GPU_IVF_FLAT**（201） - GPU で高速化された `IVF_FLAT` です。CUDA 対応の NVIDIA GPU が必要です。

- **GPU_IVF_PQ**（202） - GPU で高速化された `IVF_PQ` です。GPU 上でメモリ使用量が最も少なくなります。

- **GPU_BRUTE_FORCE**（203） - GPU による厳密なブルートフォース検索です。再現率は 100% で、GPU 上の小規模バッチクエリでは最速の選択肢です。

- **GPU_CAGRA**（204） - GPU CAGRA グラフベースのインデックスです。GPU 上で最高のクエリスループットを実現し、大規模な GPU ワークロードに最適です。

*バイナリベクトル（`BINARY_VECTOR`）：*

- **BIN_FLAT**（1001） - バイナリベクトル向けのブルートフォースによる厳密検索です。

- **BIN_IVF_FLAT**（1002） - バイナリベクトル向けの IVF 厳密検索です。追加パラメーター：`nlist`。

- **MINHASH_LSH**（1003） - MinHash ベースの LSH インデックスです。バイナリベクトルの Jaccard 類似度向けに設計されています。

*スカラーフィールド（INT*、FLOAT、DOUBLE、VARCHAR、BOOL、ARRAY）：&ast;

- **TRIE**（1101） - プレフィックスツリーインデックスです。**VARCHAR のみ。** プレフィックスフィルタリングを有効にし、文字列の等価クエリとプレフィックスクエリでは最速です。

- **STL_SORT**（1102） - ソート済み配列インデックスです。**数値スカラーフィールドのみ。** カーディナリティの低い数値フィールドに対する範囲クエリに最適です。

- **INVERTED**（1103） - 転置インデックスです。JSON を除くすべてのスカラー型をサポートします。最も広い型カバレッジを備えた汎用スカラーインデックスです。

- **BITMAP**（1104） - ビットマップインデックスです。JSON、FLOAT、DOUBLE を除くすべてのスカラー型をサポートします。カーディナリティの低いフィールド（ステータスコード、ブール値に似た整数など）に最適です。

- **NGRAM**（1105） - N-gram インデックスです。**VARCHAR または JSON パスのみ。** 高速なインフィックス検索（`LIKE '%keyword%'`）とトークン化テキスト検索を可能にします。

- **FMINDEX**（1106） - `TEXT` および `VARCHAR` フィールドの全文検索に使用する FM（frequency-matrix）インデックスです。

*スパースベクトル（`SPARSE_FLOAT_VECTOR`）：*

- **SPARSE_INVERTED_INDEX**（1201） - スパース float ベクトル向けの転置インデックスです。再現率が最も高く、スパースベクトルの推奨デフォルトです。

- **SPARSE_WAND**（1202） - スパースベクトル向けの Weak AND（WAND）アルゴリズムです。結果セットが大きい場合、再現率がわずかに低下する代わりに、`SPARSE_INVERTED_INDEX` より高速です。

*内部用：*

- **INVALID**（0） - 未初期化です。直接使用しないでください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
#include <milvus/MilvusClientV2.h>
#include <milvus/types/IndexType.h>
using namespace milvus;

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));

// HNSW for float vector (most common choice)
IndexDesc idx_hnsw("vec", "vec_idx", IndexType::HNSW, MetricType::COSINE);
idx_hnsw.AddExtraParam("M", "16");
idx_hnsw.AddExtraParam("efConstruction", "200");

// INVERTED for a VARCHAR scalar field
IndexDesc idx_inv("name", "name_idx", IndexType::INVERTED);

// SPARSE_INVERTED_INDEX for full-text search
IndexDesc idx_sparse("sparse_vec", "sparse_idx",
                     IndexType::SPARSE_INVERTED_INDEX, MetricType::BM25);

client->CreateIndex(
    CreateIndexRequest()
        .WithCollectionName("my_collection")
        .WithSync(true)
        .AddIndex(std::move(idx_hnsw))
        .AddIndex(std::move(idx_inv))
        .AddIndex(std::move(idx_sparse)));
```
