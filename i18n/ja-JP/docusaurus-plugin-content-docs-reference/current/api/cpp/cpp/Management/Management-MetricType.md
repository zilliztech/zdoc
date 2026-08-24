---
title: "MetricType | Cloud"
slug: /cpp/cpp/Management-MetricType
sidebar_label: "MetricType"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この列挙型は、ベクトルの比較に使用する距離メトリックを指定します。インデックス作成時は `MetricType` の値を `IndexDesc` に渡し、検索実行時は検索リクエストの引数に渡します。有効な選択肢はベクトルフィールドのデータ型によって異なります。 | Cloud"
type: docx
token: Fh1mdjyzRo7LanxIvHqcF9ihnLb
sidebar_position: 17
keywords: 
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - MetricType
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# MetricType

この列挙型は、ベクトルの比較に使用する距離メトリックを指定します。インデックス作成時は `MetricType` の値を `IndexDesc` に渡し、検索実行時は検索リクエストの引数に渡します。有効な選択肢はベクトルフィールドのデータ型によって異なります。

```c++
enum class MetricType {
    INVALID = 0,   // synonym: DEFAULT
    DEFAULT = 0,
    L2 = 1,
    IP = 2,
    COSINE = 3,
    HAMMING = 101,
    JACCARD = 102,
    MHJACCARD = 103,
    BM25 = 201,
    MAX_SIM_COSINE = 301,
    MAX_SIM_IP = 302,
    MAX_SIM_L2 = 303,
    MAX_SIM_JACCARD = 401,
    MAX_SIM_HAMMING = 402,
};
```

**値:**

*高密度浮動小数点ベクトル (`FLOAT_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`INT8_VECTOR`):*

- **L2** (1) - ユークリッド距離。値が小さいほど類似しています。ベクトルが正規化されていない場合に使用します。

- **IP** (2) - 内積（ドット積）。値が大きいほど類似しています。事前に正規化された（単位長の）ベクトルで使用します。この場合、数値的にはコサイン類似度と同等です。

- **COSINE** (3) - コサイン類似度（範囲 −1 〜 1）。値が大きいほど類似しています。ベクトルが正規化されていない可能性がある場合は、`IP` よりも推奨されます。Milvus が内部的に正規化を行うためです。

*バイナリベクトル (`BINARY_VECTOR`):*

- **HAMMING** (101) - 2つのベクトル間で異なるビット位置の数（XOR のポップカウント）。値が小さいほど類似しています。

- **JACCARD** (102) - Jaccard 距離：2つのベクトルのうち片方のみがセットビットを持つビット位置の比率。値が小さいほど類似しています。スパースな集合メンバーシップベクトルに適しています。

- **MHJACCARD** (103) - バイナリベクトル用の修正 Hamming–Jaccard ハイブリッド距離。

*スパースベクトル (`SPARSE_FLOAT_VECTOR`):*

- **BM25** (201) - 全文検索用の BM25 関連性スコア。BM25 組み込み関数で生成されたスパースベクトルにのみ有効です。スコアが大きいほど関連性が高いことを示します。

*構造体フィールド（マルチベクトル — `STRUCT`）:*

- **MAX_SIM_COSINE** (301) - 構造体フィールド内の全サブベクトルにおける最大コサイン類似度。

- **MAX_SIM_IP** (302) - 構造体フィールド内の全サブベクトルにおける最大内積。

- **MAX_SIM_L2** (303) - 構造体フィールド内の全サブベクトルにおける最小 L2 距離（最大 L2 類似度）。

- **MAX_SIM_JACCARD** (401) - 構造体フィールド内のバイナリサブベクトルにおける最大 Jaccard 類似度。

- **MAX_SIM_HAMMING** (402) - 構造体フィールド内のバイナリサブベクトルにおける最大 Hamming 類似度。

*特殊:*

- **INVALID** / **DEFAULT** (0) - 明示的な設定なし。サーバーがフィールドのデータ型に基づいてメトリックタイプを自動決定します。スカラーフィールドのインデックスには不要です。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
#include <milvus/MilvusClientV2.h>
#include <milvus/types/MetricType.h>
using namespace milvus;

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));

// Float vector: cosine similarity (recommended for unnormalized embeddings)
IndexDesc idx_float("vec", "vec_idx", IndexType::HNSW, MetricType::COSINE);
idx_float.AddExtraParam("M", "16");
idx_float.AddExtraParam("efConstruction", "200");

// Binary vector: Hamming distance
IndexDesc idx_bin("bin_vec", "bin_idx", IndexType::BIN_FLAT, MetricType::HAMMING);

// Sparse vector: BM25 for full-text search
IndexDesc idx_sparse("sparse_vec", "sparse_idx",
                     IndexType::SPARSE_INVERTED_INDEX, MetricType::BM25);

client->CreateIndex(
    CreateIndexRequest()
        .WithCollectionName("my_collection")
        .WithSync(true)
        .AddIndex(std::move(idx_float))
        .AddIndex(std::move(idx_bin))
        .AddIndex(std::move(idx_sparse)));
```
