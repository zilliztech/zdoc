---
title: "GetServerVersionV2() | Cloud"
slug: /cpp/cpp/Client-GetServerVersionV2
sidebar_label: "GetServerVersionV2()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于返回 Milvus 服务器版本。当请求设置了 `WithDetail(true)` 时，响应还会包含服务器的构建时间、git commit、Go 版本和部署模式。 | Cloud"
type: docx
token: EVSGdMtnqoaLzixGFkfcrdCHnNe
sidebar_position: 9
keywords: 
  - 开源向量 Database
  - 开源向量 Database
  - 向量 Database 示例
  - RAG 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - GetServerVersionV2()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetServerVersionV2()

此操作用于返回 Milvus 服务器版本。当请求设置了 `WithDetail(true)` 时，响应还会包含服务器的构建时间、git commit、Go 版本和部署模式。

```c++
Status GetServerVersionV2(const GetServerVersionRequest& request, GetServerVersionResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = GetServerVersionRequest()
    .WithDetail(detail);
```

**请求方法：**

- `WithDetail(bool detail)`

    当设为 `true` 时，响应还会包含服务器的构建时间、git commit、Go 版本和部署模式。

**返回值：**

包含 *GetServerVersionResponse* 的 *Status*

请检查 `status.IsOk()` 以确认操作是否成功。

### GetServerVersionResponse\{#getserverversionresponse}

**方法：**

- `const std::string& Version() const`

    返回服务器版本。

- `const std::string& BuildTime() const`

    返回服务器的构建时间。当请求设置了 `WithDetail(true)` 时，会填充此值。

- `const std::string& GitCommit() const`

    返回服务器的 git commit。当请求设置了 `WithDetail(true)` 时，会填充此值。

- `const std::string& GoVersion() const`

    返回用于构建服务器的 Go 版本。当请求设置了 `WithDetail(true)` 时，会填充此值。

- `const std::string& DeployMode() const`

    返回服务器的部署模式。当请求设置了 `WithDetail(true)` 时，会填充此值。

**异常：**

- **StatusCode**

    请检查 `status.Code()` 和 `status.Message()` 以获取错误详情。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::GetServerVersionRequest request;
request.WithDetail(true);
milvus::GetServerVersionResponse response;
status = client->GetServerVersionV2(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "The milvus server version is: " << response.Version() << std::endl;
```
