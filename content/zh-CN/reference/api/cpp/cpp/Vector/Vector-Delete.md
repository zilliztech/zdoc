---
title: "Delete() | Cloud"
slug: /cpp/cpp/Vector-Delete
sidebar_label: "Delete()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作通过过滤表达式或 ID 数组删除 Entity。 | Cloud"
type: docx
token: B9XjdA1Cgo0oBRxglOlcrlPan9e
sidebar_position: 1
keywords: 
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - zilliz
  - zilliz cloud
  - cloud
  - Delete()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Delete()

此操作通过过滤表达式或 ID 数组删除 Entity。

```c++
Status Delete(const DeleteRequest& request, DeleteResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = DeleteRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionName(partition_name)
    .WithFilter(filter)
    .WithFilterTemplates(value)
    .WithIDs(id_array);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithPartitionName(const std::string& partition_name)`

    设置 Partition 名称列表。若未指定，则使用默认 Partition。

- `WithFilter(const std::string& filter)`

    设置过滤表达式。

- `AddFilterTemplate(std::string key, nlohmann::json&& filter_template)`

    添加过滤模板。仅当设置了 `WithFilter()` 时生效。有关[过滤模板](https://milvus.io/docs/filtering-templating.md)的详细信息，请参阅此页面。

- `WithFilterTemplates(std::unordered_map<std::string, nlohmann::json>&& filter_templates)`

    设置过滤模板。仅当设置了 `WithFilter()` 时生效。有关[过滤模板](https://milvus.io/docs/filtering-templating.md)的详细信息，请参阅此页面。

- `WithIDs(std::vector<int64_t>&& id_array)`

    设置一组整数主键。仅当 `WithFilter()` 为空时生效。

**返回值：**

包含 *DeleteResponse* 的 *Status*

检查 `status.IsOk()` 以确认操作是否成功。

### DmlResults\{#dmlresults}

此类用于承载数据变更操作（插入、upsert 或删除）的结果。可通过 `Results()` 在 `InsertResponse`、`UpsertResponse` 或 `DeleteResponse` 中访问。

```c++
const DmlResults& results = response.Results();
```

**方法：**

- `const IDArray& IdArray() const`

    已插入、upsert 或删除的 Entity ID。对于自动 ID Collection，服务器会在插入后自动填充此字段。关于如何读取整数或字符串 ID，请参阅 IDArray。

- `uint64_t Timestamp() const`

    服务端操作时间戳。可在后续的 search 或 query 调用中将其作为 `guarantee_timestamp` 传入，以确保读己之写一致性。

- `uint64_t InsertCount() const`

    已插入的行数。适用于 `InsertResponse` 和 `UpsertResponse`。

- `uint64_t DeleteCount() const`

    已删除的行数。适用于 `DeleteResponse` 和 `UpsertResponse`。

- `uint64_t UpsertCount() const`

    已 upsert 的行数（新增插入或替换已有记录）。适用于 `UpsertResponse`。

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

milvus::DeleteResponse resp_delete;
status = client->Delete(milvus::DeleteRequest()
                            .WithCollectionName(collection_name)
                            .WithPartitionName(partition_name)
                            .WithFilter(field_id + "== 5"),
                        resp_delete);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
