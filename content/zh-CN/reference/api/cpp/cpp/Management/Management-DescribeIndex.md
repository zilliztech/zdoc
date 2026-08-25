---
title: "DescribeIndex() | Cloud"
slug: /cpp/cpp/Management-DescribeIndex
sidebar_label: "DescribeIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取指定索引的描述信息和参数。 | Cloud"
type: docx
token: MW7cdYuPyoNF2wxD5oKcibgynKd
sidebar_position: 4
keywords: 
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - natural language processing database
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeIndex()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DescribeIndex()

此操作获取指定索引的描述信息和参数。

```c++
Status DescribeIndex(const DescribeIndexRequest& request, DescribeIndexResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = DescribeIndexRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithIndexName(index_name)
    .WithTimestamp(ts);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithFieldName(const std::string& field_name)`

    设置字段名称。

- `WithIndexName(const std::string& index_name)`

    设置索引名称。

    <Admonition type="info" icon="📘" title="Notes">

    若同时指定了字段名称和索引名称，则以索引名称为准；否则回退至字段名称。

    </Admonition>

- `WithTimestamp(int64_t ts)`

    设置时间戳。若已设置，此操作仅检查该时间戳之前生成的 Segment；否则将检查所有 Segment。

**返回值：**

包含 *DescribeIndexResponse* 的 *Status*

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

milvus::DescribeIndexResponse desc_response;
status = client->DescribeIndex(milvus::DescribeIndexRequest()
                                        .WithDatabaseName(db_name)
                                        .WithCollectionName(collection_name)
                                        .WithIndexName(index_name),
                                    desc_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (const auto& desc : desc_response.Descs()) {
    std::cout << "\tIndexName: " << desc.IndexName() << std::endl;
    std::cout << "\tIndexType: " << std::to_string(desc.IndexType()) << std::endl;
    std::cout << "\tMetricType: " << std::to_string(desc.MetricType()) << std::endl;
    std::cout << "\tTotalRows: " << std::to_string(desc.TotalRows()) << std::endl;
    std::cout << "\tIndexedRows: " << std::to_string(desc.IndexedRows()) << std::endl;
    std::cout << "\tPendingRows: " << std::to_string(desc.PendingRows()) << std::endl;
}
```
