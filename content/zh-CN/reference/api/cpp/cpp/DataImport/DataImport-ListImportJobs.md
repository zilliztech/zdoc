---
title: "ListImportJobs() | Cloud"
slug: /cpp/cpp/DataImport-ListImportJobs
sidebar_label: "ListImportJobs()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取与指定 Collection 关联的所有批量导入任务列表，便于审计历史及进行中的导入操作。 | Cloud"
type: docx
token: Ls7kdwtuJoZfVUx1N3vc5tkznuh
sidebar_position: 3
keywords: 
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db
  - zilliz
  - zilliz cloud
  - cloud
  - ListImportJobs()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListImportJobs()

此操作获取与指定 Collection 关联的所有批量导入任务列表，便于审计历史及进行中的导入操作。

```c++
static nlohmann::json BulkImport::ListImportJobs(
    const std::string& url,
    const std::string& collection_name,
    const std::string& db_name = "default",
    const std::string& api_key = "")
```

## 请求语法\{#request-syntax}

```c++
auto resp = milvus::BulkImport::ListImportJobs(
    url,
    collection_name,
    db_name,
    api_key);
```

**参数：**

- `url` (*const std::string&*)

    **[必填]**

    Milvus 服务器的 URL，例如 `"YOUR_CLUSTER_ENDPOINT"`。

- `collection_name` (*const std::string&*)

    **[必填]**

    要查询导入任务的 Collection 名称。

- `db_name` (*const std::string&*)

    该 Collection 所属的 Database 名称。默认值为 `"default"`。

- `api_key` (*const std::string&*)

    用于身份验证的 API 密钥。对于 Milvus，请传入 `"username:password"`；对于 Zilliz Cloud，请使用云 API 密钥。

**返回值：**

*nlohmann::json*

返回一个包含导入任务记录数组的 JSON 对象，失败时返回 `nullptr`。每条记录包含任务 ID、状态和创建时间。

**异常：**

- **std::exception**

    当 HTTP 请求失败或无法解析响应时抛出此异常。您可以检查返回值是否为 `nullptr` 来判断是否发生错误。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "root", "Milvus"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// List all import jobs for a collection
auto resp = milvus::BulkImport::ListImportJobs(
    "YOUR_CLUSTER_ENDPOINT",
    "my_collection",
    "default",
    "YOUR_CLUSTER_TOKEN"
);

if (!resp.is_null()) {
    for (auto& job : resp["data"]["records"]) {
        std::cout << "Job ID: " << job["jobId"]
                  << "  State: " << job["state"] << std::endl;
    }
} else {
    std::cout << "Failed to list import jobs" << std::endl;
}
```
