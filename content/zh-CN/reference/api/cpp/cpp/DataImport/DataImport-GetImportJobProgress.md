---
title: "GetImportJobProgress() | Cloud"
slug: /cpp/cpp/DataImport-GetImportJobProgress
sidebar_label: "GetImportJobProgress()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于根据任务 ID 获取批量导入任务的当前进度与状态。请在调用 `CreateImportJobs()` 后轮询该方法，以确认导入是否完成。 | Cloud"
type: docx
token: NmxkduivloqgeXxVxOpcHydEnne
sidebar_position: 2
keywords: 
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - GetImportJobProgress()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetImportJobProgress()

此操作用于根据任务 ID 获取批量导入任务的当前进度与状态。请在调用 `CreateImportJobs()` 后轮询该方法，以确认导入是否完成。

```c++
static nlohmann::json BulkImport::GetImportJobProgress(
    const std::string& url,
    const std::string& job_id,
    const std::string& db_name = "default",
    const std::string& api_key = "")
```

## 请求语法\{#request-syntax}

```c++
auto resp = milvus::BulkImport::GetImportJobProgress(
    url,
    job_id,
    db_name,
    api_key);
```

**参数：**

- `url` (*const std::string&*)

    **[必填]**

    Milvus 服务器的 URL，例如 `"YOUR_CLUSTER_ENDPOINT"`。

- `job_id` (*const std::string&*)

    **[必填]**

    待查询的导入任务 ID，可从 `CreateImportJobs()` 的响应中获取。

- `db_name` (*const std::string&*)

    创建任务时指定的 Database 名称，默认值为 `"default"`。

- `api_key` (*const std::string&*)

    用于身份验证的 API 密钥。若连接 Milvus，请传入 `"username:password"`；若连接 Zilliz Cloud，请使用云 API 密钥。

**返回值：**

*nlohmann::json*

返回描述任务进度的 JSON 对象，失败时则返回 `nullptr`。该对象包含 `state`（含 `"Pending"`、`"InProgress"`、`"Completed"`、`"Failed"`）、`progress`（0–100）以及 `importedRows` 等字段。

**异常：**

- **std::exception**

    当 HTTP 请求失败或无法解析响应时抛出此异常。您可以通过检查返回值中的 `nullptr` 来判断是否发生错误。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "root", "Milvus"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Create a job first
auto create_resp = milvus::BulkImport::CreateImportJobs(
    "YOUR_CLUSTER_ENDPOINT",
    "my_collection",
    {"parquet-folder/1.parquet"},
    "default",
    "YOUR_CLUSTER_TOKEN"
);

std::string job_id = create_resp["data"]["jobId"];

// Poll for progress
while (true) {
    auto progress_resp = milvus::BulkImport::GetImportJobProgress(
        "YOUR_CLUSTER_ENDPOINT",
        job_id,
        "default",
        "YOUR_CLUSTER_TOKEN"
    );

    if (progress_resp.is_null()) {
        std::cout << "Failed to get progress" << std::endl;
        break;
    }

    std::string state = progress_resp["data"]["state"];
    int progress = progress_resp["data"]["progress"];
    std::cout << "State: " << state << "  Progress: " << progress << "%" << std::endl;

    if (state == "Completed" || state == "Failed") break;
    std::this_thread::sleep_for(std::chrono::seconds(2));
}
```
