---
title: "Optimize() | Cloud"
slug: /cpp/cpp/Management-Optimize
sidebar_label: "Optimize()"
beta: false
added_since: v2.6.3
last_modified: false
deprecate_since: false
notebook: false
description: "此操作为 Collection 触发 optimize Compaction，并返回一个支持轮询、取消或等待的异步任务句柄。 | Cloud"
type: docx
token: NlpedMAt2of5d6xPHvucRSzjnVe
sidebar_position: 18
keywords: 
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - zilliz
  - zilliz cloud
  - cloud
  - Optimize()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Optimize()

此操作为 Collection 触发 optimize Compaction，并返回一个支持轮询、取消或等待的异步任务句柄。

```c++
Status Optimize(const OptimizeRequest& request, OptimizeTaskPtr& task)
```

## 请求语法\{#request-syntax}

```c++
auto request = OptimizeRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithTargetSize("512MB")
    .WithAsync(true)
    .WithTimeoutMs(0);
```

### OptimizeRequest\{#optimizerequest}

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置待优化的 Collection。

- `WithTargetSize(const std::string& target_size)`

    设置期望的 Compaction 后 Segment 大小，例如 `"512MB"` 或 `"1GB"`。

- `WithAsync(bool async)`

    当 `true` 时，优化任务将异步调度。

- `WithTimeoutMs(int64_t timeout_ms)`

    设置任务的全局超时时间（毫秒）。`0` 表示不设置全局超时。

**返回值：**

*Status* 及 *OptimizeTaskPtr*

### OptimizeResponse\{#optimizeresponse}

此类表示 optimize 任务的输出，包含归一化目标大小、Compaction ID 及进度历史。

```c++
const OptimizeResponse& response = resp;
```

**方法：**

- `const std::string& StatusText() const`

    返回 optimize 执行过程中报告的当前状态文本。

- `const std::string& CollectionName() const`

    返回正在优化的 Collection。

- `int64_t CompactionID() const`

    返回 Compaction 任务 ID。

- `const std::string& TargetSize() const`

    返回优化器使用的归一化目标大小。

- `const std::vector<std::string>& ProgressHistory() const`

    返回任务执行期间收集的进度消息。

### OptimizeTask\{#optimizetask}

此类表示一个异步 optimize 任务，支持取消、等待及进度查询。

```c++
const OptimizeTaskPtr& task = optimize_task;
```

**方法：**

- `Status GetResult(OptimizeResponse& response, int64_t timeout_ms = 0)`

    等待任务完成并填充 `response`。`timeout_ms = 0` 表示无限期等待。

- `bool Cancel()`

    请求协作式取消该任务。

- `bool IsDone() const`

    返回任务执行是否已完成。

- `bool IsCancelled() const`

    返回取消请求是否已被接受。

- `std::string CurrentProgress() const`

    返回最新的进度消息。

- `std::vector<std::string> ProgressHistory() const`

    返回所有已记录的进度消息。

- `Status TaskStatus() const`

    若任务已完成则返回最终状态，否则返回 OK 状态。

**异常：**

- **StatusCode**

    请检查 `status.Code()` 和 `status.Message()`，以排查无效请求参数、optimize 调度失败或超时错误。

## 示例\{#example}

```c++
#include <milvus/MilvusClientV2.h>
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::OptimizeTaskPtr task;
status = client->Optimize(
    milvus::OptimizeRequest()
        .WithCollectionName("my_collection")
        .WithTargetSize("512MB")
        .WithAsync(true),
    task);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::OptimizeResponse response;
status = task->GetResult(response, 60000);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
