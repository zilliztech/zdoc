---
title: "GetCollectionStats() | Cloud"
slug: /cpp/cpp/Collections-GetCollectionStats
sidebar_label: "GetCollectionStats()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はコレクションの統計情報を返します。現在、返されるのは行数のみです。 | Cloud"
type: docx
token: Lh65dZfnWoZKFMxsJhdcieUJnEb
sidebar_position: 26
keywords: 
  - Serverless ベクトル データベース
  - milvus open source
  - how does milvus work
  - Zilliz ベクトル データベース
  - zilliz
  - zilliz cloud
  - cloud
  - GetCollectionStats()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetCollectionStats()

この操作はコレクションの統計情報を返します。現在、返されるのは行数のみです。

```c++
Status GetCollectionStats(const GetCollectionStatsRequest& request, GetCollectionStatsResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = GetCollectionStatsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

**戻り値:**

*Status* および *GetCollectionStatsResponse*

`status.IsOk()` を確認し、成功したかどうかを判定します。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` および `status.Message()` を参照してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::GetCollectionStatsResponse response;
status = client->GetCollectionStats(
    milvus::GetCollectionStatsRequest()
        .WithCollectionName(collection_name),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Collection " << collection_name << " row count: " << response.Stats().RowCount() << std::endl;
```
