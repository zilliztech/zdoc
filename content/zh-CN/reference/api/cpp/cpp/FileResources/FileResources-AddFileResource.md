---
title: "AddFileResource() | Cloud"
slug: /cpp/cpp/FileResources-AddFileResource
sidebar_label: "AddFileResource()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于向 Milvus 注册文件资源。当服务端功能需要使用具名文件资源时，请调用此操作。 | Cloud"
type: docx
token: QAmzdvwmEoZP55xwBQicVB0cnwh
sidebar_position: 1
keywords: 
  - DiskANN
  - 稀疏向量
  - 向量维度
  - ANN 搜索
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

此操作用于向 Milvus 注册文件资源。当服务端功能需要使用具名文件资源时，请调用此操作。

```c++
Status AddFileResource(const AddFileResourceRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = milvus::AddFileResourceRequest()
    .WithName("embedding_model")
    .WithPath("/models/embedding.bin");
```

**请求方法：**

- `WithName(const std::string& name)`

    设置资源名称。

- `WithPath(const std::string& path)`

    设置资源的文件路径。

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

auto request = milvus::AddFileResourceRequest()
    .WithName("embedding_model")
    .WithPath("/models/embedding.bin");
status = client->AddFileResource(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: File Resources; action: CREATE; addedSince: v3.0.x */}
