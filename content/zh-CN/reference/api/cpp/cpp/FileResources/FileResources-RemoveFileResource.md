---
title: "RemoveFileResource() | Cloud"
slug: /cpp/cpp/FileResources-RemoveFileResource
sidebar_label: "RemoveFileResource()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于移除已注册的文件资源，适用于清理不再被引用的资源。 | Cloud"
type: docx
token: Gs0EdiKeEoU5Exxxnb8ckz74nId
sidebar_position: 6
keywords: 
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - zilliz
  - zilliz cloud
  - cloud
  - RemoveFileResource()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RemoveFileResource()

此操作用于移除已注册的文件资源，适用于清理不再被引用的资源。

```c++
Status RemoveFileResource(const RemoveFileResourceRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = milvus::RemoveFileResourceRequest()
    .WithName("embedding_model");
```

**请求方法：**

- `WithName(const std::string& name)`

    指定要移除的资源名称。

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

auto request = milvus::RemoveFileResourceRequest()
    .WithName("embedding_model");
status = client->RemoveFileResource(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: File Resources; action: CREATE; addedSince: v3.0.x */}
