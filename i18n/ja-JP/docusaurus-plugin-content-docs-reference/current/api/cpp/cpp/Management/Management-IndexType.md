---
title: "IndexType | Cloud"
slug: /cpp/cpp/Management-IndexType
sidebar_label: "IndexType"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この列挙型はインデックスアルゴリズムを指定するために使用します。`IndexType` の値を `IndexDesc` に渡して `CreateIndex()` を呼び出してください。有効な選択肢はフィールドのデータ型によって異なります。 | Cloud"
type: docx
token: FTlxddhTlorM8hxprlsc3RUEnnb
sidebar_position: 12
keywords: 
  - ベクトル データベース チュートリアル
  - ベクトル データベースの仕組み
  - ベクトル DB 比較
  - OpenAI ベクトル DB
  - zilliz
  - zilliz cloud
  - cloud
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
    BITMAP = 1104, NGRAM = 1105,
    // Sparse vectors
    SPARSE_INVERTED_INDEX = 1201, SPARSE_WAND = 1202,
};
```

**値:**

*密な浮動小数点ベクトル — CPU (`FLOAT_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`INT8_VECTOR`):*

- **FLAT** (1) - 総当たりによる厳密検索。再現率100%で、トレーニングは不要です。小規模なデータセット（100万ベクトル未満）に最適です。

- **IVF_FLAT** (2) - 転置ファイルインデックス。ベクトルを `nlist` 個のクラスターにクラスタリングし、最も近い `nprobe` 個のクラスターを検索します。追加パラメータ: `nlist`（必須）。

- **IVF_SQ8** (3) - スカラー量子化（int8）を用いたIVF。`IVF_FLAT` よりもメモリ使用量が少なく、再現率の低下もわずかです。追加パラメータ: `nlist`（必須）。

- **IVF_PQ** (4) - 積量子化を用いたIVF。最も高い圧縮率を実現します。追加パラメータ: `nlist`、`m`、`nbits`。

- **HNSW** (5) - Hierarchical Navigable Small World グラフ。メモリ上のデータセットにおいて、速度と再現率のバランスが最も優れています。追加パラメータ: `M`（必須）、`efConstruction`（必須）。

- **DISKANN** (6) - RAMに収まらない大規模データセット向けのディスクベースANNインデックス。少ないメモリ使用量で良好な再現率を実現します。

- **AUTOINDEX** (7) - Milvus がデータに応じて最適なインデックスタイプとパラメータを自動選択します。クイックスタートにおすすめです。

- **SCANN** (8) - ScaNN（Scalable Nearest Neighbors）アルゴリズム。高速かつ高い再現率を実現します。

- **HNSW_SQ** (9) - スカラー量子化を用いたHNSW。再現率の低下を最小限に抑えつつ、`HNSW` よりもメモリ使用量を削減します。

- **HNSW_PQ** (10) - 積量子化を用いたHNSW。再現率はやや低下しますが、さらにメモリ使用量を削減できます。

- **HNSW_PRQ** (11) - 積残差量子化を用いたHNSW。HNSWの量子化バリエーションの中で最も高い再現率を実現します。

- **IVF_RABITQ** (12) - RaBitQバイナリ量子化を用いたIVF。非常に低いメモリ使用量で、競争力のある再現率を実現します。

*密な浮動小数点ベクトル — GPU:*

- **GPU_IVF_FLAT** (201) - GPUアクセラレーション対応の `IVF_FLAT`。CUDA対応のNVIDIA GPUが必要です。

- **GPU_IVF_PQ** (202) - GPUアクセラレーション対応の `IVF_PQ`。GPU上で最もメモリ使用量が少ない方式です。

- **GPU_BRUTE_FORCE** (203) - GPUによる厳密な総当たり検索。再現率100%で、GPUでの小規模バッチクエリに対して最速のオプションです。

- **GPU_CAGRA** (204) - GPU向けCAGRAグラフベースインデックス。GPU上で最高のクエリスループットを実現し、大規模なGPUワークロードに最適です。

*バイナリベクトル (`BINARY_VECTOR`):*

- **BIN_FLAT** (1001) - バイナリベクトル向けの総当たりによる厳密検索。

- **BIN_IVF_FLAT** (1002) - バイナリベクトル向けのIVF厳密検索。追加パラメータ: `nlist`。

- **MINHASH_LSH** (1003) - MinHashベースのLSHインデックス。バイナリベクトルのJaccard類似度計算向けに設計されています。

*スカラーフィールド (INT*, FLOAT, DOUBLE, VARCHAR, BOOL, ARRAY):*

- **TRIE** (1101) - プレフィックストリーインデックス。**VARCHARのみ対象。** プレフィックスフィルタリングが可能で、文字列の完全一致検索やプレフィックス検索に最速です。

- **STL_SORT** (1102) - ソート済み配列インデックス。**数値スカラーフィールドのみ対象。** カーディナリティの低い数値フィールドに対する範囲クエリに最適です。

- **INVERTED** (1103) - 転置インデックス。JSONを除くすべてのスカラー型をサポートします。対応型の幅が最も広く、汎用的なスカラーインデックスとして優れています。

- **BITMAP** (1104) - ビットマップインデックス。JSON、FLOAT、DOUBLEを除くすべてのスカラー型をサポートします。カーディナリティの低いフィールド（例: ステータスコード、ブール値的な整数）に最適です。

- **NGRAM** (1105) - N-gramインデックス。**VARCHARまたはJSONパスのみ対象。** 高速な部分一致検索（`LIKE '%keyword%'`）やトークン分割されたテキスト検索が可能です。

*スパースベクトル (`SPARSE_FLOAT_VECTOR`):*

- **SPARSE_INVERTED_INDEX** (1201) - スパースfloatベクトル用の転置インデックス。最も高い再現率を実現し、スパースベクトルの推奨デフォルトです。

- **SPARSE_WAND** (1202) - スパースベクトル用のWeak AND（WAND）アルゴリズム。大規模な結果セットでは `SPARSE_INVERTED_INDEX` よりも高速ですが、再現率はわずかに低下します。

*Internal:*

- **INVALID** (0) - 未初期化状態。直接使用しないでください。

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
