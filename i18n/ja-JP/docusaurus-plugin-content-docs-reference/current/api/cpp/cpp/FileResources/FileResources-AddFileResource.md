---
title: "AddFileResource() | Cloud"
slug: /cpp/cpp/FileResources-AddFileResource
sidebar_label: "AddFileResource()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ファイルリソースを Milvus に登録します。サーバーサイドの機能で名前付きファイルリソースが必要となる場合に使用します。 | Cloud"
type: docx
token: QAmzdvwmEoZP55xwBQicVB0cnwh
sidebar_position: 1
keywords: 
  - DiskANN
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - zilliz
  - zilliz cloud
  - cloud
  - AddFileResource()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AddFileResource()

この操作は、ファイルリソースを Milvus に登録します。サーバーサイドの機能で名前付きファイルリソースが必要となる場合に使用します。

```c++
Status AddFileResource(const AddFileResourceRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::AddFileResourceRequest()
    .WithName("embedding_model")
    .WithPath("/models/embedding.bin");
```

**リクエストメソッド:**

- `WithName(const std::string& name)`

    リソース名を設定します。

- `WithPath(const std::string& path)`

    リソースのファイルパスを設定します。

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

auto request = milvus::AddFileResourceRequest()
    .WithName("embedding_model")
    .WithPath("/models/embedding.bin");
status = client->AddFileResource(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: File Resources; action: CREATE; addedSince: v3.0.x */}
