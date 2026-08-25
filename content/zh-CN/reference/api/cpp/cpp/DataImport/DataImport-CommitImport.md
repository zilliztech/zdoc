---
title: "CommitImport() | Cloud"
slug: /cpp/cpp/DataImport-CommitImport
sidebar_label: "CommitImport()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "提交通过 options.autocommit=false 创建的 2PC 导入任务，使暂存的导入数据可见。 | Cloud"
type: docx
token: DvRYdqk6qonziIxPQlJcqZN9nBd
sidebar_position: 5
keywords: 
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
  - zilliz
  - zilliz cloud
  - cloud
  - CommitImport()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CommitImport()

提交通过 options.auto_commit=false 创建的 2PC 导入任务，使暂存的导入数据可见。

## 请求语法\{#request-syntax}

```c++
static nlohmann::json CommitImport(const std::string& url, const std::string& job_id, const std::string& db_name = "default", const std::string& api_key = "")
```

**返回值：**

*nlohmann::json*

返回批量导入 Endpoint 的 JSON 响应。

**错误处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出此异常。请检查异常消息或返回的 Status 以了解失败详情。

## 示例\{#example}

演示如何使用 C++ SDK 调用 CommitImport()。

```c++
auto response = milvus::BulkImport::CommitImport(
    "YOUR_CLUSTER_ENDPOINT", "import-job-id", "default", "YOUR_CLUSTER_TOKEN");
```
