---
title: "GetCollectionStats() | Cloud"
slug: /cpp/cpp/Collections-GetCollectionStats
sidebar_label: "GetCollectionStats()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、行数などコレクションの統計情報を取得します。現在返されるのは行数のみです。 | Cloud"
type: docx
token: V2TUd3ZWJoiv4LxTUFfc8H3Nnrc
sidebar_position: 26
keywords: 
  - Serverless ベクトル データベース
  - milvus オープンソース
  - milvus の仕組み
  - Zilliz ベクトル データベース
  - zilliz
  - zilliz cloud
  - cloud
  - GetCollectionStats()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# GetCollectionStats()

この操作は、行数などコレクションの統計情報を取得します。現在返されるのは行数のみです。

```c++
Status GetCollectionStats(const GetCollectionStatsRequest& request, GetCollectionStatsResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = GetCollectionStatsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。名前が空の場合は、デフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

**戻り値：**

*Status*

操作が成功したかどうかを示す Status を返します。コレクションの統計情報（現在は行数）は、レスポンスオブジェクトに格納されます。

- **response** (*GetCollectionStatsResponse*) -

    - **Stats** (*const CollectionStat&*) -

        コレクションの統計情報を取得します。

        - **RowCount** (*uint64_t*) -

            このコレクションの行数を返します。

        - **Name** (*const std::string&*) -

            コレクション名を取得します。

        - **Statistics** (*const std::unordered_map&lt;std::string, std::string>&*) -

            このコレクションの生の key/value 統計マップを取得します。

**エラーハンドリング：**

- **std::exception**

    リクエストの構築、転送、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続済みの MilvusClientV2 で GetCollectionStats() を呼び出し、コレクションの統計情報を取得して、レスポンスから行数を読み取ります。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::GetCollectionStatsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
milvus::GetCollectionStatsResponse response;
status = client->GetCollectionStats(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Row count: " << response.Stats().RowCount() << std::endl;
```
