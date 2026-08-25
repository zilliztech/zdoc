---
title: "Flush() | Cloud"
slug: /cpp/cpp/Management-Flush
sidebar_label: "Flush()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会刷新流式数据并封存 Segment。建议在将所有数据插入 Collection 后调用此操作。 | Cloud"
type: docx
token: Ya3cdJkTNoGyqYxTXPMccOd8nun
sidebar_position: 7
keywords: 
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - zilliz
  - zilliz cloud
  - cloud
  - Flush()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Flush()

此操作会刷新流式数据并封存 Segment。建议在将所有数据插入 Collection 后调用此操作。

```c++
Status Flush(const FlushRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = FlushRequest()
    .WithDatabaseName(db_name)
    .WithCollectionNames(names)
    .WithWaitFlushedMs(ms);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionNames(std::set<std::string>&& names)`

    设置 Collection 名称。

- `AddCollectionName(const std::string& name)`

    添加需要执行 Flush 操作的 Collection 名称。

- `WithWaitFlushedMs(int64_t ms)`

    设置等待 Flush 操作完成的超时时间（毫秒）。默认值为 0。当 `WaitFlushedMs` 为 0 时，该操作会反复调用 `GetFlushState()` 检查相关 Segment 的状态，直到所有 Segment 均完成刷新，以确保缓冲区数据成功持久化。若 `WaitFlushedMs` 大于 0，则该操作会在指定时间后终止轮询并返回超时状态。

**返回值：**

*Status*

请检查 `status.IsOk()` 以确认操作是否成功。

**异常：**

- **StatusCode**

    请检查 `status.Code()` 和 `status.Message()` 以获取错误详情。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// call flush() here just to persist the data so that indexnode can build index on a new segment
// Note: in practice, no need to call flush() manually since milvus automatically trigger flush actions
status = client->Flush(milvus::FlushRequest().AddCollectionName(collection_name));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
