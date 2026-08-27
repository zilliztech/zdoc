---
title: "CollectionDesc | Cloud"
slug: /cpp/cpp/Collections-CollectionDesc
sidebar_label: "CollectionDesc"
beta: false
added_since: v2.6.1
last_modified: false
deprecate_since: false
notebook: false
description: "このクラスは、コレクションの完全なスキーマとランタイムメタデータを表します。`Desc()` を `DescribeCollectionResponse` オブジェクトに対して呼び出すことで取得できます。 | Cloud"
type: docx
token: QZ7hdS2KRofUiYx9c8TcMXkknPc
sidebar_position: 9
keywords: 
  - ベクトルインデックス
  - ベクトルデータベース open source
  - open source ベクトル db
  - ベクトルデータベース example
  - zilliz
  - zilliz cloud
  - cloud
  - CollectionDesc
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CollectionDesc

このクラスは、コレクションの完全なスキーマとランタイムメタデータを表します。`Desc()` を `DescribeCollectionResponse` オブジェクトに対して呼び出すことで取得できます。

```c++
const CollectionDesc& desc = response.Desc();
```

**メソッド:**

- `const std::string& DatabaseName() const`

    コレクションが属するデータベース名。

- `const std::string& CollectionName() const`

    コレクション名。

- `const std::string& Description() const`

    コレクションの説明文（人間が読める形式）。

- `int64_t NumShards() const`

    コレクションのシャード数。

- `const CollectionSchema& Schema() const`

    フィールド定義や動的フィールド設定を含むコレクションのスキーマ。詳細は CollectionSchema を参照してください。

- `int64_t ID() const`

    サーバーによって割り当てられたコレクション ID。

- `const std::vector<std::string>& Alias() const`

    このコレクションに設定されたエイリアスの一覧。

- `uint64_t CreatedTime() const`

    コレクション作成時の UTC タイムスタンプ（マイクロ秒単位）。

- `uint64_t UpdateTime() const`

    最終スキーマ更新時の UTC タイムスタンプ（マイクロ秒単位）。

- `const std::unordered_map<std::string, std::string>& Properties() const`

    コレクションレベルのプロパティをキーと値のペアで保持します（例：TTL 設定など）。

## 例\{#example}

```c++
#include <milvus/MilvusClientV2.h>
using namespace milvus;

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));

DescribeCollectionResponse response;
auto status = client->DescribeCollection(
    DescribeCollectionRequest()
        .WithCollectionName("my_collection"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

const CollectionDesc& desc = response.Desc();
std::cout << "Name:   " << desc.CollectionName() << "\n"
          << "ID:     " << desc.ID() << "\n"
          << "Shards: " << desc.NumShards() << "\n"
          << "Fields: " << desc.Schema().Fields().size() << "\n";
```
