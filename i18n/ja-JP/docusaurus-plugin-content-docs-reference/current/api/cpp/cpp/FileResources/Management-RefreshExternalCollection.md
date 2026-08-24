---
title: "RefreshExternalCollection() | Cloud"
slug: /cpp/cpp/Management-RefreshExternalCollection
sidebar_label: "RefreshExternalCollection()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、外部コレクションのリフレッシュジョブを開始します。外部データの変更後にコレクションのメタデータを更新する必要がある場合に使用します。 | Cloud"
type: docx
token: GjhbdmL5PorgMXxkHTPcvVt6nul
sidebar_position: 5
keywords: 
  - ベクトル検索
  - knnアルゴリズム
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

この操作は、外部コレクションのリフレッシュジョブを開始します。外部データの変更後にコレクションのメタデータを更新する必要がある場合に使用します。

```c++
Status RefreshExternalCollection(const RefreshExternalCollectionRequest& request, RefreshExternalCollectionResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::RefreshExternalCollectionRequest()
    .WithExternalSource("s3")
    .WithExternalSpec({{"bucket", "milvus-data"}, {"path", "collections/book"}});
```

**リクエスト メソッド:**

- `WithExternalSource(const std::string& external_source)`

    外部ソースのタイプを設定します。

- `WithExternalSpec(const nlohmann::json& external_spec)`

    プロバイダー固有のリフレッシュ設定を JSON 形式で指定します。

**戻り値:**

*Status*

**例外:**

- **std::exception**

    リクエストの送信に失敗した場合や、レスポンスの解析に失敗した場合に、この例外がスローされる可能性があります。

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

{/* category: File Resources; action: CREATE; addedSince: v3.0.x */}
