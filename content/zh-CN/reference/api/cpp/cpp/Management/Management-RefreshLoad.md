---
title: "RefreshLoad() | Cloud"
slug: /cpp/cpp/Management-RefreshLoad
sidebar_label: "RefreshLoad()"
beta: false
added_since: v2.6.3
last_modified: false
deprecate_since: false
notebook: false
description: "此操作可刷新 QueryNode 内存中已加载的 Collection。在大量数据写入或 Compaction 后，若需立即更新已加载的数据视图，请使用此操作。 | Cloud"
type: docx
token: YI1BdnZOMoPSOMxjVMEcrrCwnWh
sidebar_position: 19
keywords: 
  - 向量相似性搜索
  - 近似最近邻搜索
  - DiskANN
  - 稀疏向量
  - zilliz
  - zilliz cloud
  - cloud
  - RefreshLoad()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RefreshLoad()

此操作可刷新 QueryNode 内存中已加载的 Collection。在大量数据写入或 Compaction 后，若需立即更新已加载的数据视图，请使用此操作。

```c++
Status RefreshLoad(const RefreshLoadRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = RefreshLoadRequest()
    .WithCollectionName(collection_name)
    .WithSync(sync)
    .WithTimeoutMs(timeout_ms);
```

### RefreshLoadRequest\{#refreshloadrequest}

**请求方法：**

- `WithCollectionName(const std::string& collection_name)`

    设置待刷新的 Collection 名称。

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database。若未指定，则使用默认 Database。

- `WithSync(bool sync)`

    控制调用是否阻塞直至刷新完成。默认值为 `true`。

- `WithTimeoutMs(int64_t timeout_ms)`

    设置同步刷新的超时时间（毫秒）。默认值为 `60000`。

**返回值：**

*Status*

**异常：**

- **StatusCode**

    请检查 `status.Code()` 和 `status.Message()`，以排查无效的 Collection 名称、加载状态异常或超时失败等问题。

## 示例\{#example}

```c++
#include <milvus/MilvusClientV2.h>
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->RefreshLoad(
    milvus::RefreshLoadRequest()
        .WithCollectionName("my_collection")
        .WithSync(true)
        .WithTimeoutMs(60000));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
