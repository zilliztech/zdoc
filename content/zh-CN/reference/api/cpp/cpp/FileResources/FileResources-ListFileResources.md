---
title: "ListFileResources() | Cloud"
slug: /cpp/cpp/FileResources-ListFileResources
sidebar_label: "ListFileResources()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于列出已注册的文件资源。您可以通过该操作获取可供服务端功能使用的资源名称和路径。 | Cloud"
type: docx
token: LHdcdoz6OoQajtx3SMMcGLjcnFh
sidebar_position: 3
keywords: 
  - milvus database
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

此操作用于列出已注册的文件资源。您可以通过该操作获取可供服务端功能使用的资源名称和路径。

```c++
Status ListFileResources(const ListFileResourcesRequest& request, ListFileResourcesResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = milvus::ListFileResourcesRequest();
```

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

auto request = milvus::ListFileResourcesRequest();
milvus::ListFileResourcesResponse response;
status = client->ListFileResources(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: File Resources; action: CREATE; addedSince: v3.0.x */}
