---
title: "RemoveFileResource() | Cloud"
slug: /cpp/cpp/FileResources-RemoveFileResource
sidebar_label: "RemoveFileResource()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会移除已注册的文件资源。可使用此操作清理不再被引用的资源。 | Cloud"
type: docx
token: Gs0EdiKeEoU5Exxxnb8ckz74nId
sidebar_position: 3
keywords: 
  - 什么是向量 Database
  - 向量 Database
  - 多模态向量 Database 检索
  - 检索增强生成
  - Zilliz
  - Zilliz Cloud
  - 云
  - RemoveFileResource()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RemoveFileResource()

此操作会移除已注册的文件资源。可使用此操作清理不再被引用的资源。

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

    设置要移除的资源名称。

**返回：**

*Status*

**异常：**

- **std::exception**

    如果请求无法发送或响应无法解析，则可能会引发此异常。

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
