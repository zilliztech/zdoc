---
title: "IndexDesc | Cloud"
slug: /cpp/cpp/Management-IndexDesc
sidebar_label: "IndexDesc"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "このクラスは、ベクトルまたはスカラーのインデックス構築に必要なパラメーターを保持します。1つ以上の `IndexDesc` オブジェクトを `CreateIndexRequest:AddIndex()` に渡してください。また、`DescribeIndex()` は `DescribeIndexResponse::Descs()` を通じて、ビルドの進行状況と状態情報を含む `IndexDesc` オブジェクトを返します。 | Cloud"
type: docx
token: C4kSd9x2GobYZGxDTkacZsX2nlc
sidebar_position: 11
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - ベクトル search
  - zilliz
  - zilliz cloud
  - cloud
  - IndexDesc
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# IndexDesc

このクラスは、ベクトルまたはスカラーのインデックス構築に必要なパラメーターを保持します。1つ以上の `IndexDesc` オブジェクトを `CreateIndexRequest::AddIndex()` に渡してください。また、`DescribeIndex()` は `DescribeIndexResponse::Descs()` を通じて、ビルドの進行状況と状態情報を含む `IndexDesc` オブジェクトを返します。

```c++
IndexDesc();
IndexDesc(std::string field_name, std::string index_name,
          milvus::IndexType index_type,
          milvus::MetricType metric_type = milvus::MetricType::INVALID);
```

**パラメーター:**

- **field_name** (*std::string*)

    インデックスを作成するコレクションフィールドの名前です。

- **index_name** (*std::string*)

    インデックスの任意の名前です。空の場合、サーバーは `field_name` をインデックス名として使用します。コレクション内で一意である必要があります。

- **index_type** (*milvus::IndexType*)

    インデックス構築に使用するアルゴリズムです。利用可能な値については `IndexType` を参照してください。

- **metric_type** (*milvus::MetricType*)

    ベクトルの比較に使用する距離メトリックです。スカラーフィールドのインデックスには不要です。デフォルト: `MetricType::INVALID`（サーバーが自動決定）。利用可能な値については `MetricType` を参照してください。

## メソッド\{#methods}

**入力メソッド（インデックス作成時に使用）:**

- `Status SetFieldName(std::string field_name)` / `const std::string& FieldName() const`

    このインデックスの構築対象となるフィールドを設定または取得します。

- `Status SetIndexName(std::string index_name)` / `const std::string& IndexName() const`

    インデックス名を設定または取得します。作成後に空にすることはできません。

- `Status SetIndexType(milvus::IndexType index_type)` / `milvus::IndexType IndexType() const`

    インデックスアルゴリズムを設定または取得します。

- `Status SetMetricType(milvus::MetricType metric_type)` / `milvus::MetricType MetricType() const`

    ベクトル距離メトリックを設定または取得します。スカラーフィールドのインデックスでは、未設定のままにするか `INVALID` を指定してください。

- `Status AddExtraParam(const std::string& key, const std::string& value)`

    アルゴリズム固有のチューニングパラメーターを追加します（例: IVFインデックスの `milvus::NLIST` / `"nlist"`、HNSWの `"M"` や `"efConstruction"` など）。

- `const std::unordered_map<std::string, std::string>& ExtraParams() const`

    すべての追加パラメーターをキーと値のマップとして返します。

- `Status ExtraParamsFromJson(std::string json)`

    JSON文字列を解析して追加パラメーターを設定します。

**出力メソッド（DescribeIndexにより設定）:**

- `int64_t IndexId() const`

    サーバーによって割り当てられたインデックス識別子です。

- `milvus::IndexStateCode StateCode() const`

    現在のビルド状態: `NONE`、`UNISSUED`、`IN_PROGRESS`、`FINISHED`、または `FAILED` です。

- `std::string FailReason() const`

    `StateCode()` が `FAILED` の場合に表示されるエラーメッセージです。

- `int64_t IndexedRows() const`

    インデックス作成済みの行数です。Compaction による再インデックスが発生した場合、`TotalRows()` を超えることがあります。

- `int64_t TotalRows() const`

    コレクション内の総行数です。

- `int64_t PendingRows() const`

    まだインデックスが作成されていない行数です。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
#include <milvus/MilvusClientV2.h>
using namespace milvus;

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));

// Create an HNSW vector index and a scalar TRIE index together
IndexDesc index_vec("vec", "vec_idx", IndexType::HNSW, MetricType::COSINE);
index_vec.AddExtraParam("M", "16");
index_vec.AddExtraParam("efConstruction", "200");

IndexDesc index_name("name", "", IndexType::TRIE);

auto status = client->CreateIndex(
    CreateIndexRequest()
        .WithCollectionName("my_collection")
        .WithSync(true)
        .AddIndex(std::move(index_vec))
        .AddIndex(std::move(index_name)));

// Inspect build progress via DescribeIndex
DescribeIndexResponse resp;
client->DescribeIndex(
    DescribeIndexRequest()
        .WithCollectionName("my_collection")
        .WithIndexName("vec_idx"),
    resp);

for (const auto& desc : resp.Descs()) {
    std::cout << "IndexName:   " << desc.IndexName()   << "\n"
              << "IndexType:   " << std::to_string(desc.IndexType())  << "\n"
              << "State:       " << std::to_string(desc.StateCode())  << "\n"
              << "IndexedRows: " << desc.IndexedRows() << "\n"
              << "TotalRows:   " << desc.TotalRows()   << "\n";
}
```
