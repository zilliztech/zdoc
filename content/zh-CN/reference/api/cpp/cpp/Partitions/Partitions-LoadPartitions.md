---
title: "LoadPartitions() | Cloud"
slug: /cpp/cpp/Partitions-LoadPartitions
sidebar_label: "LoadPartitions()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作将单个 Collection 中指定 Partition 的数据加载到查询节点。 | Cloud"
type: docx
token: AtwgdHq42oYSt7xJrO7c8ZGUnqc
sidebar_position: 6
keywords: 
  - 神经网络
  - 深度学习
  - 知识库
  - 自然语言处理
  - Zilliz
  - Zilliz Cloud
  - 云
  - LoadPartitions()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# LoadPartitions()

此操作将单个 Collection 中指定 Partition 的数据加载到查询节点。

```c++
Status LoadPartitions(const LoadPartitionsRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = LoadPartitionsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionNames(partition_names)
    .WithSync(sync)
    .WithReplicaNum(replica_num)
    .WithTimeoutMs(timeout_ms)
    .WithRefresh(refresh)
    .WithLoadFields(load_fields)
    .WithSkipDynamicField(skip_dynamic_field)
    .WithTargetResourceGroups(target_resource_groups)
    .WithLoadPriority(load_priority);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若该值为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 的名称。

- `WithPartitionNames(const std::set<std::string>& partition_names)`

    设置 Partition 的名称。

- `AddPartitionName(const std::string& partition_name)`

    添加要加载的 Partition。

- `WithSync(bool sync)`

    设置同步模式。默认值为 **True**。

    - **True**：等待 Collection 完全加载。

    - **False**：无论 Collection 是否完全加载，均立即返回。

- `WithReplicaNum(int64_t replica_num)`

    设置副本数量。

- `WithTimeoutMs(int64_t timeout_ms)`

    设置超时时间（毫秒）。默认值为 60000 ms。此参数仅在同步模式下生效。

    如果 `WaitFlushedMs` 设为 0，此操作将反复调用 `GetLoadingProgress()` 检查加载状态，直至 Collection 完全加载到内存中。如果 `WaitFlushedMs` 大于 0，此操作将在指定时间后终止循环，并返回表示超时的状态。

- `WithRefresh(bool refresh)`

    设置刷新选项。此参数在批量导入接口生成新 Segment 时生效。

    - **True**：加载批量导入接口新生成的 Segment。

    - **False**：忽略批量导入接口新生成的 Segment。

- `WithLoadFields(const std::set<std::string>& load_fields)`

    设置要加载的字段的名称。

- `AddLoadField(const std::string& load_field)`

    添加要加载的字段的名称。

- `WithSkipDynamicField(bool skip_dynamic_field)`

    设置是否跳过动态字段选项。

- `WithTargetResourceGroups(const std::set<std::string>& target_resource_groups)`

    设置目标资源组。若该值为空，Partition 数据将加载到默认资源组中。

- `AddTargetResourceGroups(const std::string& target_resource_group)`

    添加目标资源组。

- `WithLoadPriority(const std::string& load_priority)`

    设置 Partition 的加载优先级。设置 `"low"` 以选择低优先级；任何其他值（包括 `"high"`）均默认为高优先级。

**返回值：**

*Status*

检查 `status.IsOk()` 以确认操作成功。

**异常：**

- **StatusCode**

    检查 `status.Code()` 和 `status.Message()` 以获取错误详情。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->LoadPartitions(
    milvus::LoadPartitionsRequest()
        .WithCollectionName("my_collection")
        .AddPartitionName("partition_1")
        .AddPartitionName("partition_2")
        .WithSync(true));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
