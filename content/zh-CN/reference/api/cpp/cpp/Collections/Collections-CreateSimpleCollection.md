---
title: "CreateSimpleCollection() | Cloud"
slug: /cpp/cpp/Collections-CreateSimpleCollection
sidebar_label: "CreateSimpleCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作创建一个包含主键字段和向量字段的简单 Collection。 | Cloud"
type: docx
token: HWQYdK1lIoLiQGxaqMkc2ZeOnge
sidebar_position: 15
keywords: 
  - 知识库
  - 自然语言处理
  - AI 聊天机器人
  - 余弦距离
  - zilliz
  - zilliz cloud
  - cloud
  - CreateSimpleCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreateSimpleCollection()

此操作创建一个包含主键字段和向量字段的简单 Collection。

```c++
Status CreateSimpleCollection(const CreateSimpleCollectionRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = CreateSimpleCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPrimaryFieldName(primary_field_name)
    .WithPrimaryFieldType(primary_field_type)
    .WithVectorFieldName(vector_field_name)
    .WithDimension(dimension)
    .WithConsistencyLevel(level)
    .WithMetricType(metric_type)
    .WithAutoID(auto_id)
    .WithEnableDynamicField(enable_dynamic_field)
    .WithMaxLength(max_length);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称，若为空则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithPrimaryFieldName(const std::string& primary_field_name)`

    设置主键字段名称，默认值为 "id"。

- `WithPrimaryFieldType(DataType primary_field_type)`

    设置主键字段的数据类型，默认值为 INT64。

- `WithVectorFieldName(const std::string& vector_field_name)`

    设置向量字段名称，默认值为 "vector"。

- `WithDimension(int64_t dimension)`

    设置向量字段的维度，默认值为 0。您必须指定一个非零的维度值。

- `WithConsistencyLevel(milvus::[ConsistencyLevel](./Collections-ConsistencyLevel) level)`

    设置 Collection 的一致性级别，默认值为 BOUNDED。

- `WithMetricType(milvus::[MetricType](./Management-MetricType) metric_type)`

    设置 Collection 的度量类型，默认值为 COSINE。

- `WithAutoID(bool auto_id)`

    设置是否自动生成 ID，默认值为 false。

- `WithEnableDynamicField(bool enable_dynamic_field)`

    设置是否启用动态字段，默认值为 true。

- `WithMaxLength(int64_t max_length)`

    当主键字段为 VARCHAR 时，设置其最大长度，默认值为 65535。

**返回值：**

*Status*

检查 `status.IsOk()` 以确认操作成功。

**异常：**

- **StatusCode**

    检查 `status.Code()` 和 `status.Message()` 获取错误详情。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->CreateCollection(milvus::CreateSimpleCollectionRequest()
                                      .WithCollectionName(collection_name)
                                      .WithPrimaryFieldName(field_id)
                                      .WithVectorFieldName(field_vector)
                                      .WithDimension(dimension));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
