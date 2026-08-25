---
title: "AlterCollectionProperties() | Cloud"
slug: /cpp/cpp/Collections-AlterCollectionProperties
sidebar_label: "AlterCollectionProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作修改 Collection 属性。 | Cloud"
type: docx
token: H5oLd8ZVfooSgixa5O9cyq37nCb
sidebar_position: 7
keywords: 
  - 音频相似性搜索
  - 弹性向量 Database
  - Pinecone 对比 Milvus
  - Chroma 对比 Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - AlterCollectionProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterCollectionProperties()

此操作修改 Collection 属性。

```c++
Status AlterCollectionProperties(const AlterCollectionPropertiesRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = AlterCollectionPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithProperties(properties);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    设置该 Collection 要修改的属性。可用属性请参阅[支持的属性](https://milvus.io/docs/modify-collection.md#Supported-properties)。

- `AddProperty(const std::string& key, const std::string& property)`

    设置该 Collection 的某个属性。可用属性请参阅[支持的属性](https://milvus.io/docs/modify-collection.md#Supported-properties)。

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

status = client->AlterCollectionProperties(
    milvus::AlterCollectionPropertiesRequest()
        .WithDatabaseName(db_name)
        .WithCollectionName(collection_name)
        .AddProperty(milvus::COLLECTION_TTL_SECONDS, "20")
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
