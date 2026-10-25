---
title: "Optimize() | Cloud"
slug: /cpp/cpp/Management-Optimize
sidebar_label: "Optimize()"
beta: false
added_since: v2.6.3
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作通过等待待处理的索引构建、执行 Compaction 使 Segment 达到请求的目标大小，并在 Collection 已加载时刷新加载状态，从而优化该 Collection 的 Segment。使用异步选项时，该工作会在后台任务中运行，并通过 OptimizeTask 句柄公开，该句柄会提供最终结果。 | Cloud"
type: docx
token: NlpedMAt2of5d6xPHvucRSzjnVe
sidebar_position: 20
keywords: 
  - 分层可导航小世界
  - 稠密嵌入
  - Faiss 向量 Database
  - Chroma 向量 Database
  - zilliz
  - Zilliz Cloud
  - 云
  - Optimize()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# Optimize()

此操作通过等待待处理的索引构建、执行 Compaction 使 Segment 达到请求的目标大小，并在 Collection 已加载时刷新加载状态，从而优化该 Collection 的 Segment。使用异步选项时，该工作会在后台任务中运行，并通过 OptimizeTask 句柄公开，该句柄会提供最终结果。

```c++
Status Optimize(const OptimizeRequest& request, OptimizeTaskPtr& task)
```

## 请求语法\{#request-syntax}

```c++
auto request = OptimizeRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithTargetSize(target_size)
    .WithAsync(async)
    .WithTimeoutMs(timeout_ms);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 的名称；如果该值为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置要优化的 Collection 的名称。该值不能为空。

- `WithTargetSize(const std::string& target_size)`

    设置用于优化的目标 Segment 大小，例如 "512MB" 或 "1GB"。

- `WithAsync(bool async)`

    设置优化是否以异步方式运行。为 true 时，Optimize() 会在后台任务启动后立即返回；为 false 时，调用会阻塞，直到优化完成。

- `WithTimeoutMs(int64_t timeout_ms)`

    设置任务的总超时时间，单位为毫秒。零表示没有总超时限制。

**返回类型：**

*Status*

返回一个 Status，指示操作是否成功。在同步模式下，它反映整个优化运行的结果；在异步模式下，它指示后台任务是否已启动，该任务的最终状态可通过 OptimizeTask 句柄获取。

- **response** (*OptimizeTaskPtr*) -

    - **GetResult** (*Status*) -

        等待任务结果。超时为零表示永久等待。

        - **StatusText** (*const std::string&*) -

            获取状态文本。

        - **CollectionName** (*const std::string&*) -

            获取 Collection 名称。

        - **CompactionID** (*int64_t*) -

            获取 Compaction ID。

        - **TargetSize** (*const std::string&*) -

            获取规范化后的目标大小。

        - **ProgressHistory** (*const std::vector&lt;std::string&gt;&*) -

            获取进度历史记录。

    - **Cancel** (*bool*) -

        以协作方式取消任务。

    - **IsDone** (*bool*) -

        任务是否已完成。

    - **IsCancelled** (*bool*) -

        任务是否已取消。

    - **CurrentProgress** (*std::string*) -

        当前进度消息。

    - **ProgressHistory** (*std::vector&lt;std::string&gt;*) -

        进度消息历史记录。

    - **TaskStatus** (*Status*) -

        如果任务已完成，则为最终任务状态；否则为 OK。

**异常处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status，以获取失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 Optimize()，通过 Compaction 使 Collection 的 Segment 达到目标大小，并使用 OptimizeTask 句柄获取最终结果。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::OptimizeRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithTargetSize(target_size);
status = client->Optimize(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
