---
title: "CollectionDesc | Cloud"
slug: /cpp/cpp/Collections-CollectionDesc
sidebar_label: "CollectionDesc"
beta: false
added_since: v2.6.1
last_modified: false
deprecate_since: false
notebook: false
description: "此类表示 Collection 的完整 Schema 及运行时元数据。可通过在 `Desc()` 对象上调用 `DescribeCollectionResponse` 获取。 | Cloud"
type: docx
token: QZ7hdS2KRofUiYx9c8TcMXkknPc
sidebar_position: 9
keywords: 
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example
  - zilliz
  - zilliz cloud
  - cloud
  - CollectionDesc
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CollectionDesc

此类表示 Collection 的完整 Schema 及运行时元数据。可通过在 `Desc()` 对象上调用 `DescribeCollectionResponse` 获取。

```c++
const CollectionDesc& desc = response.Desc();
```

**方法：**

- `const std::string& DatabaseName() const`

    该 Collection 所属 Database 的名称。

- `const std::string& CollectionName() const`

    Collection 名称。

- `const std::string& Description() const`

    Collection 的可读描述。

- `int64_t NumShards() const`

    Collection 的分片数量。

- `const CollectionSchema& Schema() const`

    Collection 的 Schema，包含字段定义和动态字段设置。详情请参见 CollectionSchema。

- `int64_t ID() const`

    服务端分配的 Collection ID。

- `const std::vector<std::string>& Alias() const`

    关联到此 Collection 的别名列表。

- `uint64_t CreatedTime() const`

    Collection 创建时的 UTC 时间戳（微秒）。

- `uint64_t UpdateTime() const`

    最近一次 Schema 更新的 UTC 时间戳（微秒）。

- `const std::unordered_map<std::string, std::string>& Properties() const`

    Collection 级别的属性，以键值对形式存储（如 TTL 设置）。

## 示例\{#example}

```c++
#include <milvus/MilvusClientV2.h>
using namespace milvus;

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));

DescribeCollectionResponse response;
auto status = client->DescribeCollection(
    DescribeCollectionRequest()
        .WithCollectionName("my_collection"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

const CollectionDesc& desc = response.Desc();
std::cout << "Name:   " << desc.CollectionName() << "\n"
          << "ID:     " << desc.ID() << "\n"
          << "Shards: " << desc.NumShards() << "\n"
          << "Fields: " << desc.Schema().Fields().size() << "\n";
```
