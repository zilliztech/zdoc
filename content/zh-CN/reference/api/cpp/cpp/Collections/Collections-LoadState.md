---
title: "LoadState | Cloud"
slug: /cpp/cpp/Collections-LoadState
sidebar_label: "LoadState"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "该枚举表示由 `GetLoadState()` 返回的 Collection 或 Partition 的加载状态。Collection 或 Partition 必须处于 `LOADSTATELOADED` 状态，才能执行搜索和查询操作。 | Cloud"
type: docx
token: AeHodu7bqoOWJcxdR1Gc0dounzf
sidebar_position: 30
keywords: 
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - zilliz
  - zilliz cloud
  - cloud
  - LoadState
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# LoadState

该枚举表示由 `GetLoadState()` 返回的 Collection 或 Partition 的加载状态。Collection 或 Partition 必须处于 `LOAD_STATE_LOADED` 状态，才能执行搜索和查询操作。

```c++
enum class LoadState {
    LOAD_STATE_NOT_EXIST = 0,
    LOAD_STATE_NOT_LOAD  = 1,
    LOAD_STATE_LOADING   = 2,
    LOAD_STATE_LOADED    = 3,
};
```

**取值：**

- **LOAD_STATE_NOT_EXIST** (0) - Collection 或 Partition 不存在。

- **LOAD_STATE_NOT_LOAD** (1) - Collection 或 Partition 存在，但尚未加载到查询节点内存中。请在搜索前调用 `LoadCollection()` 或 `LoadPartitions()`。

- **LOAD_STATE_LOADING** (2) - Collection 或 Partition 正在加载到查询节点内存中。请等待状态变为 `LOAD_STATE_LOADED`。

- **LOAD_STATE_LOADED** (3) - 已完全加载，可执行 `Search()` 和 `Query()` 操作。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
#include <milvus/MilvusClientV2.h>
#include <milvus/types/LoadState.h>
using namespace milvus;

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));

GetLoadStateResponse resp;
auto status = client->GetLoadState(
    GetLoadStateRequest().WithCollectionName("my_collection"), resp);

switch (resp.State()) {
    case LoadState::LOAD_STATE_LOADED:
        std::cout << "Collection is ready for search." << std::endl;
        break;
    case LoadState::LOAD_STATE_LOADING:
        std::cout << "Collection is still loading..." << std::endl;
        break;
    case LoadState::LOAD_STATE_NOT_LOAD:
        std::cout << "Collection is not loaded. Call LoadCollection() first." << std::endl;
        break;
    case LoadState::LOAD_STATE_NOT_EXIST:
        std::cout << "Collection does not exist." << std::endl;
        break;
}
```
