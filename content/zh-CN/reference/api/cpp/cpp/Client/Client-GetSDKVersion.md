---
title: "GetSDKVersion() | Cloud"
slug: /cpp/cpp/Client-GetSDKVersion
sidebar_label: "GetSDKVersion()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于获取 SDK 版本。 | Cloud"
type: docx
token: ZPS0ddywzo9DObxXS9Rc7yornDc
sidebar_position: 7
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - GetSDKVersion()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetSDKVersion()

此操作用于获取 SDK 版本。

```c++
Status GetSDKVersion(std::string& version)
```

**参数：**

- **version** (*std::string&*)

    用于存储返回的 SDK 版本号的变量。

**返回值：**

*Status*

检查 `status.IsOk()` 以确认操作是否成功。

**异常：**

- **StatusCode**

    查看 `status.Code()` 和 `status.Message()` 以获取错误详情。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// print the SDK version
client->GetSDKVersion(version);
std::cout << "The CPP SDK version is: " << version << std::endl;
```
