---
title: "RefreshExternalCollection() | Cloud"
slug: /cpp/cpp/Management-RefreshExternalCollection
sidebar_label: "RefreshExternalCollection()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于为外部 Collection 启动刷新任务。当外部数据发生变更且需要刷新 Collection 元数据时，请使用此操作。 | Cloud"
type: docx
token: GjhbdmL5PorgMXxkHTPcvVt6nul
sidebar_position: 5
keywords: 
  - 向量搜索
  - knn 算法
  - HNSW
  - 什么是非结构化数据
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

此操作用于为外部 Collection 启动刷新任务。当外部数据发生变更且需要刷新 Collection 元数据时，请使用此操作。

```c++
Status RefreshExternalCollection(const RefreshExternalCollectionRequest& request, RefreshExternalCollectionResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = milvus::RefreshExternalCollectionRequest()
    .WithExternalSource("s3")
    .WithExternalSpec({{"bucket", "milvus-data"}, {"path", "collections/book"}});
```

**请求方法：**

- `WithExternalSource(const std::string& external_source)`

    设置外部源类型。

- `WithExternalSpec(const nlohmann::json& external_spec)`

    以 JSON 格式设置特定于提供方的刷新配置。

**返回值：**

*Status*

**异常：**

- **std::exception**

    当请求无法发送或响应无法解析时，可能会抛出此异常。

## 示例\{#example}

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
