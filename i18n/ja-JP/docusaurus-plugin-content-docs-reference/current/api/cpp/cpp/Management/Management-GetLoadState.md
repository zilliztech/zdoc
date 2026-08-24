---
title: "GetLoadState() | Cloud"
slug: /cpp/cpp/Management-GetLoadState
sidebar_label: "GetLoadState()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "コレクションまたはパーティションのロード状態を取得します。 | Cloud"
type: docx
token: Vs0rdbqzcoC2ODxjnR3cN1imnPd
sidebar_position: 10
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy ベクトル search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - GetLoadState()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetLoadState()

この操作は、コレクションまたはパーティションのロード状態を取得します。

```c++
Status GetLoadState(const GetLoadStateRequest& request, GetLoadStateResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = GetLoadStateRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionNames(partition_names);
```

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithPartitionNames(std::set<std::string>&& partition_names)`

    パーティション名を設定します。このパラメーターは任意です。指定した場合は、該当パーティションのロード状態を返します。空の場合は、指定されたコレクションのロード状態を返します。

- `AddPartitionName(const std::string& partition_name)`

    ロード状態を取得するパーティション名を追加します。

**戻り値:**

*GetLoadStateResponse* を含む *Status*

成功したかどうかは `status.IsOk()` で確認できます。

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

milvus::GetLoadStateResponse load_response;
status = client->GetLoadState(
    milvus::GetLoadStateRequest()
        .WithDatabaseName(db_name)
        .WithCollectionName(collection_name),
    load_response
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "\tCollection load state: " << std::to_string(load_response.State()) << std::endl;
```
