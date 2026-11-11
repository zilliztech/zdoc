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

    外部ソース URI を設定します。

    `external_source` と `external_spec` は、両方を指定するか、両方とも省略してください。両方とも省略した場合、更新では永続化されたソースと仕様が再利用されます。

    Zilliz Cloud では、`external_source` は `volume://<volume_name>/<path>` と `milvus://<instance_id>/<db_name>/<collection_name>` の 2 つのスキームを受け入れます。`volume://` URI の場合は、上記のルールが適用されます。`milvus://` ソースの場合も同じルールが適用され、省略すると永続化されたソースが再利用され、更新では引き続き最新データが同期されます。

- `WithExternalSpec(const nlohmann::json& external_spec)`

    `format` などの外部ソース仕様を JSON として設定します。`format` に指定できる値は `parquet`、`vortex`、`lance-table`、`iceberg-table` です。

    Zilliz Cloud では、`milvus-table` ソースは `milvus://` スキームとともに使用されます。`format` は省略でき、`milvus://` ソースの場合はデフォルトで `milvus-table` になります。

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
