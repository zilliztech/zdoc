---
title: "RefreshExternalCollection() | Cloud"
slug: /cpp/cpp/Management-RefreshExternalCollection
sidebar_label: "RefreshExternalCollection()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、外部コレクションの更新ジョブを開始します。外部データが変更され、コレクションのメタデータを更新する必要がある場合に使用します。 | Cloud"
type: docx
token: BRFNded7LoGTfJxgz9kcq20Vnmg
sidebar_position: 25
keywords: 
  - ベクトル検索
  - kNN アルゴリズム
  - HNSW
  - 非構造化データとは
  - zilliz
  - zilliz cloud
  - cloud
  - RefreshExternalCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RefreshExternalCollection()

この操作は、外部コレクションの更新ジョブを開始します。外部データが変更され、コレクションのメタデータを更新する必要がある場合に使用します。

```c++
Status RefreshExternalCollection(const RefreshExternalCollectionRequest& request, RefreshExternalCollectionResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::RefreshExternalCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithExternalSource("s3")
    .WithExternalSpec({{"bucket", "milvus-data"}, {"path", "collections/book"}});
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合は、デフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    更新する外部コレクションの名前を設定します。

- `WithExternalSource(const std::string& external_source)`

    外部ソースの種類を設定します。

- `WithExternalSpec(const nlohmann::json& external_spec)`

    プロバイダー固有の更新設定を JSON として設定します。

**戻り値:**

*Status*

**例外:**

- **std::exception**

    リクエストを送信できない場合、またはレスポンスを解析できない場合に、この例外がスローされることがあります。

## 例\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::RefreshExternalCollectionRequest()
    .WithExternalSource("s3")
    .WithExternalSpec({{"bucket", "milvus-data"}, {"path", "collections/book"}});
milvus::RefreshExternalCollectionResponse response;
status = client->RefreshExternalCollection(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
