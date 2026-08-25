---
title: "AbortImport() | Cloud"
slug: /cpp/cpp/DataImport-AbortImport
sidebar_label: "AbortImport()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "中止通过 options.autocommit=false 创建的 2PC 导入任务，并丢弃其暂存的导入数据。 | Cloud"
type: docx
token: GUnjd6RiHooH3CxHbjOc81vInBf
sidebar_position: 4
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - AbortImport()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AbortImport()

中止通过 options.auto_commit=false 创建的 2PC 导入任务，并丢弃其暂存的导入数据。

## 请求语法\{#request-syntax}

```c++
static nlohmann::json AbortImport(const std::string& url, const std::string& job_id, const std::string& db_name = "default", const std::string& api_key = "")
```

**返回值：**

*nlohmann::json*

返回来自 bulk-import Endpoint 的 JSON 响应。

**错误处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出此异常。请检查异常消息或返回的 Status 以获取失败详情。

## 示例\{#example}

演示如何使用 C++ SDK 调用 AbortImport()。

```c++
auto response = milvus::BulkImport::AbortImport(
    "YOUR_CLUSTER_ENDPOINT", "import-job-id", "default", "YOUR_CLUSTER_TOKEN");
```
