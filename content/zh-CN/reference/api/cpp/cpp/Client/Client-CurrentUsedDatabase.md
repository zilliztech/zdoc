---
title: "CurrentUsedDatabase() | Cloud"
slug: /cpp/cpp/Client-CurrentUsedDatabase
sidebar_label: "CurrentUsedDatabase()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回当前使用的 Database 名称。该 API 适用于多 Database 场景。 | Cloud"
type: docx
token: ZmS3drufioCOIBxq3PSc26O7nie
sidebar_position: 5
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - CurrentUsedDatabase()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CurrentUsedDatabase()

此操作返回当前使用的 Database 名称。该 API 适用于多 Database 场景。

```c++
Status CurrentUsedDatabase(std::string& db_name)
```

**参数：**

- **db_name** (*std::string&*)

    用于存储当前使用的 Database 名称的变量。

**返回值：**

*Status*

检查 `status.IsOk()` 以确认操作成功。

**异常：**

- **StatusCode**

    检查 `status.Code()` 和 `status.Message()` 以获取错误详情。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string current_db_name;
client->CurrentUsedDatabase(current_db_name);
std::cout << "Current in-used database: " << current_db_name << std::endl;
```
