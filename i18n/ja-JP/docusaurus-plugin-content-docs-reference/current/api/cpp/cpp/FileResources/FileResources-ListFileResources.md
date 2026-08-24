---
title: "ListFileResources() | Cloud"
slug: /cpp/cpp/FileResources-ListFileResources
sidebar_label: "ListFileResources()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、登録済みのファイルリソースを一覧表示します。サーバーサイド機能で利用可能なリソース名とパスを確認する際に使用します。 | Cloud"
type: docx
token: LHdcdoz6OoQajtx3SMMcGLjcnFh
sidebar_position: 3
keywords: 
  - milvus データベース
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - ListFileResources()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListFileResources()

この操作は、登録済みのファイルリソースを一覧表示します。サーバーサイド機能で利用可能なリソース名とパスを確認する際に使用します。

```c++
Status ListFileResources(const ListFileResourcesRequest& request, ListFileResourcesResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::ListFileResourcesRequest();
```

**戻り値:**

*Status*

**例外:**

- **std::exception**

    この例外は、リクエストの送信に失敗した場合や、レスポンスを解析できない場合にスローされる可能性があります。

## 例\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::ListFileResourcesRequest();
milvus::ListFileResourcesResponse response;
status = client->ListFileResources(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: File Resources; action: CREATE; addedSince: v3.0.x */}
