---
title: "CreateImportJobs() | Cloud"
slug: /cpp/cpp/DataImport-CreateImportJobs
sidebar_label: "CreateImportJobs()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作创建一个批量导入作业，用于将对象存储中的文件数据加载到 Milvus Collection 中。该操作通过 RESTful 导入 API 直接与 Milvus 服务器通信，并返回包含已分配作业 ID 的 JSON 对象。您可以使用 `GetImportJobProgress()` 监控进度。 | Cloud"
type: docx
token: FdxMdw01eoWnXKx4Q4rcUh0unFf
sidebar_position: 1
keywords: 
  - 混合向量搜索
  - 视频去重
  - 视频相似性搜索
  - 向量检索
  - zilliz
  - zilliz cloud
  - cloud
  - CreateImportJobs()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreateImportJobs()

此操作创建一个批量导入作业，用于将对象存储中的文件数据加载到 Milvus Collection 中。该操作通过 RESTful 导入 API 直接与 Milvus 服务器通信，并返回包含已分配作业 ID 的 JSON 对象。您可以使用 `GetImportJobProgress()` 监控进度。

```c++
static nlohmann::json BulkImport::CreateImportJobs(
    const std::string& url,
    const std::string& collection_name,
    const std::vector<std::string>& files,
    const std::string& db_name = "default",
    const std::string& api_key = "",
    const std::string& partition_name = "",
    const nlohmann::json& options = nlohmann::json{})
```

## 请求语法\{#request-syntax}

```c++
auto resp = milvus::BulkImport::CreateImportJobs(
    url,
    collection_name,
    files,
    db_name,
    api_key,
    partition_name,
    options);
```

**参数：**

- `url` (*const std::string&*)

    **[必需]**

    Milvus 服务器的 URL，例如 `"YOUR_CLUSTER_ENDPOINT"`。

- `collection_name` (*const std::string&*)

    **[必需]**

    目标 Collection 的名称。

- `files` (*const std::vector&lt;std::string&gt;&*)

    **[必需]**

    相对于对象存储根目录的文件路径列表。每个路径可指向单个 JSON/Parquet 文件或文件夹。示例：`{"parquet-folder/1.parquet", "parquet-folder/2.parquet"}`。

- `db_name` (*const std::string&*)

    包含该 Collection 的 Database 名称。默认值为 `"default"`。

- `api_key` (*const std::string&*)

    用于身份验证的 API 密钥。对于 Milvus，请传入 `"username:password"`；对于 Zilliz Cloud，请传入云 API 密钥。

- `partition_name` (*const std::string&*)

    目标 Partition 的名称。此参数为可选项，仅当 Collection 未使用 Partition Key 时指定。

- `options` (*const nlohmann::json&*)

    JSON 格式的附加导入选项。支持 `"timeout"`（整数，单位为秒）。

**返回值：**

*nlohmann::json*

成功时返回包含作业 ID 的 JSON 对象，失败时返回 `nullptr`。您可以将响应中的 `jobId` 字段传递给 `GetImportJobProgress()`。

**异常：**

- **std::exception**

    当 HTTP 请求失败或无法解析响应时抛出此异常。请检查返回值中的 `nullptr` 以判断是否发生错误。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "root", "Milvus"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Create an import job using local Milvus
auto resp = milvus::BulkImport::CreateImportJobs(
    "YOUR_CLUSTER_ENDPOINT",               // Milvus server URL
    "my_collection",                         // Target collection
    {"parquet-folder/1.parquet",            // Files to import
     "parquet-folder/2.parquet"},
    "default",                              // Database name
    "YOUR_CLUSTER_TOKEN",                          // API key (user:password)
    ""                                      // Partition name (optional)
);

if (!resp.is_null()) {
    std::string job_id = resp["data"]["jobId"];
    std::cout << "Import job created: " << job_id << std::endl;
} else {
    std::cout << "Failed to create import job" << std::endl;
}
```
