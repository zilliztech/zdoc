---
title: "CollectionInfo | Cloud"
slug: /cpp/cpp/Collections-CollectionInfo
sidebar_label: "CollectionInfo"
beta: false
added_since: v2.6.1
last_modified: false
deprecate_since: false
notebook: false
description: "このクラスは、リスト結果に含まれる各コレクションの概要情報を保持します。`ListCollectionsResponse:CollectionInfos()` は `CollectionsInfo` 値を返しますが、これは `std::vector` の型エイリアスです。 | Cloud"
type: docx
token: Er8qdUCUAok3j4xBCP0cVYIQnk0
sidebar_position: 10
keywords: 
  - ベクトルストア
  - オープンソースのベクトルデータベース
  - ベクトルインデックス
  - オープンソースのベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - CollectionInfo
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CollectionInfo

このクラスは、リスト結果内の単一コレクションに関する概要情報を保持します。 `ListCollectionsResponse::CollectionInfos()` は `CollectionsInfo` ベクトル値を返します。これは `std::vector<CollectionInfo>` の型エイリアスです。

```c++
CollectionInfo();
CollectionInfo(std::string collection_name, int64_t collection_id, uint64_t create_time);

using CollectionsInfo = std::vector<CollectionInfo>;
```

**メソッド:**

- `const std::string& Name() const`

    コレクション名。

- `int64_t ID() const`

    サーバーによって割り当てられたコレクションの内部 ID。

- `uint64_t CreatedTime() const`

    コレクション作成時の UTC タイムスタンプ（マイクロ秒）。

- `uint64_t MemoryPercentage() const`

    非推奨です。常に `0` を返します。ロードの進行状況を確認するには、代わりに `GetLoadState()` を使用してください。

## 例\{#example}

```c++
#include <milvus/MilvusClientV2.h>
using namespace milvus;

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));

ListCollectionsResponse response;
auto status = client->ListCollections(
    ListCollectionsRequest().WithDatabaseName("default"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

const CollectionsInfo& infos = response.CollectionInfos();
for (const auto& info : infos) {
    std::cout << "Name:    " << info.Name() << "\n"
              << "ID:      " << info.ID() << "\n"
              << "Created: " << info.CreatedTime() << "\n";
}
```
