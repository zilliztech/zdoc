---
title: "LoadCollection() | Cloud"
slug: /cpp/cpp/Management-LoadCollection
sidebar_label: "LoadCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将 Collection 数据加载到查询节点的 CPU 和内存中。如果请求处于同步模式，此操作会检查 Collection 的加载进度，并等待 Collection 完全加载到查询节点。否则，它会立即返回。 | Cloud"
type: docx
token: Z3KTdzp7xoWm7QxytFGcIqYangm
sidebar_position: 16
keywords: 
  - nlp search
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - zilliz
  - zilliz cloud
  - cloud
  - LoadCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# LoadCollection()

此操作将 Collection 数据加载到查询节点的 CPU 和内存中。如果请求处于同步模式，此操作会检查 Collection 的加载进度，并等待 Collection 完全加载到查询节点。否则，它会立即返回。

```c++
Status LoadCollection(const LoadCollectionRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = LoadCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithSync(sync)
    .WithReplicaNum(replica_num)
    .WithTimeoutMs(timeout_ms)
    .WithRefresh(refresh)
    .WithLoadFields(load_fields)
    .WithSkipDynamicField(skip_dynamic_field)
    .WithTargetResourceGroups(target_resource_groups);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置目标 Collection 的名称。

- `WithSync(bool sync)`

    设置同步模式。默认值为 **True**。

    - **True**：等待 Collection 完全加载。

    - **False**：无论 Collection 是否已完全加载，均立即返回。

- `WithReplicaNum(int64_t replica_num)`

    设置副本数量。

- `WithTimeoutMs(int64_t timeout_ms)`

    设置超时时间（单位：毫秒）。默认值为 60000 ms。此参数仅在同步模式下生效。

    若 `WaitFlushedMs` 设为 0，此操作将反复调用 `GetLoadingProgress()` 检查加载状态，直至 Collection 完全加载到内存中。若 `WaitFlushedMs` 大于 0，此操作将在指定时间后终止轮询，并返回超时状态。

- `WithRefresh(bool refresh)`

    设置刷新选项。默认值为 **False**。当批量导入接口生成了新 Segment 时，此参数生效。

    - **True**：加载由批量导入接口新生成的 Segment。

    - **False**：忽略由批量导入接口新生成的 Segment。

- `WithLoadFields(const std::set<std::string>& load_fields)`

    设置需要加载的字段。

- `AddLoadField(const std::string& field_name)`

    添加需要加载的字段。

- `WithSkipDynamicField(bool skip_dynamic_field)`

    是否跳过加载动态字段。默认值为 **False**。

- `WithTargetResourceGroups(const std::set<std::string>& target_resource_groups)`

    设置目标资源组。

**返回值：**

*Status*

请检查 `status.IsOk()` 以确认操作成功。

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

status = client->LoadCollection(
    milvus::LoadCollectionRequest()
        .WithCollectionName(collection_name)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
