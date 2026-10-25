---
title: "Delete() | Cloud"
slug: /cpp/cpp/Vector-Delete
sidebar_label: "Delete()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作通过过滤表达式或 ID 数组删除 Entity。 | Cloud"
type: docx
token: B9XjdA1Cgo0oBRxglOlcrlPan9e
sidebar_position: 1
keywords: 
  - 多模态向量 Database 检索
  - 检索增强生成
  - 大语言模型
  - 向量化
  - zilliz
  - zilliz cloud
  - cloud
  - Delete()
  - cppv30
displayed_sidebar: cppSidebar

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

    设置目标 Database 名称。如果为空，则应用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 的名称。

- `WithPartitionName(const std::string& partition_name)`

    设置各个 Partition 的名称。如果为空，则应用默认 Partition。

- `WithFilter(const std::string& filter)`

    设置过滤表达式。

- `AddFilterTemplate(std::string key, nlohmann::json&& filter_template)`

    添加过滤模板。仅当设置了 `WithFilter()` 时才会生效。有关过滤模板的更多信息，请阅读[此页面](/docs/filtering-templating)。

- `WithFilterTemplates(std::unordered_map<std::string, nlohmann::json>&& filter_templates)`

    设置过滤模板。仅当设置了 `WithFilter()` 时才会生效。有关过滤模板的更多信息，请阅读[此页面](/docs/filtering-templating)。

- `WithIDs(std::vector<int64_t>&& id_array)`

    设置一组整数主键。仅当 `WithFilter()` 为空时才会生效。

**返回：**

带有 *DeleteResponse* 的 *Status*

检查 `status.IsOk()` 以确认操作成功。

### DmlResults\{#dmlresults}

此类承载数据变更操作（插入、upsert 或删除）的结果。可通过 `InsertResponse`、`UpsertResponse` 或 `DeleteResponse` 上的 `Results()` 访问。

```c++
const DmlResults& results = response.Results();
```

**方法：**

- `const IDArray& IdArray() const`

    已插入、upsert 或删除的 Entity 的 ID。对于自动 ID 的 Collection，服务器会在插入后填充此值。有关如何读取整数或字符串 ID，请参见 IDArray。

- `uint64_t Timestamp() const`

    服务器端操作时间戳。可在后续搜索或查询调用中作为 `guarantee_timestamp` 传入，以确保读己之写一致性。

- `uint64_t InsertCount() const`

    已插入的行数。对于 `InsertResponse` 和 `UpsertResponse` 会填充此值。

- `uint64_t DeleteCount() const`

    已删除的行数。对于 `DeleteResponse` 和 `UpsertResponse` 会填充此值。

- `uint64_t UpsertCount() const`

    已 upsert 的行数（作为新行插入或替换现有行）。对于 `UpsertResponse` 会填充此值。

- `int64_t Cost() const`

    返回操作的开销（毫秒）。

**异常：**

- **StatusCode**

    检查 `status.Code()` 和 `status.Message()` 以获取错误详细信息。

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
