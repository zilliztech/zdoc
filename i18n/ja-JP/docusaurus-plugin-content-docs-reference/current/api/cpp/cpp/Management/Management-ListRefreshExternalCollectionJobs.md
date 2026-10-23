---
title: "ListRefreshExternalCollectionJobs() | Cloud"
slug: /cpp/cpp/Management-ListRefreshExternalCollectionJobs
sidebar_label: "ListRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、外部コレクションの更新ジョブを一覧表示します。過去または進行中の外部コレクション更新アクティビティを確認するために使用します。 | Cloud"
type: docx
token: M9b1dFp2ioszBwxqFKUcs6gYn2e
sidebar_position: 24
keywords: 
  - Milvus データベース
  - Milvus ベクトルデータベース
  - Zilliz Cloud
  - Milvus とは
  - zilliz
  - zilliz cloud
  - クラウド
  - ListRefreshExternalCollectionJobs()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListRefreshExternalCollectionJobs()

この操作は、外部コレクションの更新ジョブを一覧表示します。過去または進行中の外部コレクション更新アクティビティを確認するために使用します。

```c++
Status ListRefreshExternalCollectionJobs(const ListRefreshExternalCollectionJobsRequest& request, ListRefreshExternalCollectionJobsResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::ListRefreshExternalCollectionJobsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    更新ジョブを一覧表示するコレクションの名前を設定します。

**戻り値:**

*Status*

**例外:**

- **std::exception**

    リクエストを送信できない場合、または応答を解析できない場合に、この例外が発生する可能性があります。

## 例\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::ListRefreshExternalCollectionJobsRequest();
milvus::ListRefreshExternalCollectionJobsResponse response;
status = client->ListRefreshExternalCollectionJobs(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
