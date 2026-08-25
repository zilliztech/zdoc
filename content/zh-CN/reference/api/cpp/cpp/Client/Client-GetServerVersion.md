---
title: "GetServerVersion() | Cloud"
slug: /cpp/cpp/Client-GetServerVersion
sidebar_label: "GetServerVersion()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于获取 Zilliz Cloud 服务器版本。 | Cloud"
type: docx
token: VgZtdAUzyoJplBxYfdMc1OGonng
sidebar_position: 8
keywords: 
  - 视频搜索
  - AI 幻觉
  - AI Agent
  - 语义搜索
  - zilliz
  - zilliz cloud
  - cloud
  - GetServerVersion()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetServerVersion()

此操作用于获取 Zilliz Cloud 服务器版本。

```c++
Status GetServerVersion(std::string& version)
```

**参数：**

- **version** (*std::string&*)

    用于存储返回的服务器版本号的变量。

**返回值：**

*Status*

请检查 `status.IsOk()` 以确认操作是否成功。

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

std::string version;
status = client->GetServerVersion(version);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "The milvus server version is: " << version << std::endl;
```
