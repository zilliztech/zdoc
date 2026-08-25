---
title: "FlushAll() | Cloud"
slug: /cpp/cpp/Management-FlushAll
sidebar_label: "FlushAll()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会刷新 Database 中所有 Collection 的插入缓冲区。请在需要持久化写入的备份或验证工作流之前使用。 | Cloud"
type: docx
token: UbjxdApcFonLD4xmm9fcJI2knKd
sidebar_position: 21
keywords: 
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - FlushAll()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# FlushAll()

此操作会刷新 Database 中所有 Collection 的插入缓冲区。请在需要持久化写入的备份或验证工作流之前使用。

```c++
Status FlushAll(const FlushAllRequest& request, FlushAllResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = milvus::FlushAllRequest()
    .WithDatabaseName("default")
    .WithWaitFlushedMs(60000);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    指定要刷新其 Collection 的 Database。

- `WithWaitFlushedMs(int64_t wait_flushed_ms)`

    设置等待所有刷新操作完成的超时时间。设为零表示无限期等待。

**返回值：**

*Status*

**异常：**

- **std::exception**

    当请求无法发送或响应无法解析时，可能会抛出此异常。

## 示例\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::FlushAllRequest()
    .WithDatabaseName("default")
    .WithWaitFlushedMs(60000);
milvus::FlushAllResponse response;
status = client->FlushAll(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Management; action: CREATE; addedSince: v3.0.x */}
