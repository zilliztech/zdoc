---
title: "CollectionDesc | Cloud"
slug: /cpp/cpp/Collections-CollectionDesc
sidebar_label: "CollectionDesc"
beta: false
added_since: v2.6.1
last_modified: false
deprecate_since: false
notebook: false
description: "此类表示 Collection 的完整 Schema 和运行时元数据。它由在 `DescribeCollectionResponse` 对象上调用 `Desc()` 返回。 | Cloud"
type: docx
token: QZ7hdS2KRofUiYx9c8TcMXkknPc
sidebar_position: 9
keywords: 
  - 向量索引
  - 开源向量 Database
  - 开源向量 Database
  - 向量 Database 示例
  - Zilliz
  - Zilliz Cloud
  - 云
  - CollectionDesc
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# CollectionDesc

此类表示 Collection 的完整 Schema 和运行时元数据。它由在 `DescribeCollectionResponse` 对象上调用 `Desc()` 返回。

```c++
const CollectionDesc& desc = response.Desc();
```

**方法：**

- `const std::string& DatabaseName() const`

    该 Collection 所属 Database 的名称。

- `const std::string& CollectionName() const`

    Collection 的名称。

- `const std::string& Description() const`

    Collection 的可读描述。

- `int64_t NumShards() const`

    该 Collection 中分片的数量。

- `const CollectionSchema& Schema() const`

    Collection 的 Schema，包括字段定义和动态字段设置。有关详细信息，请参见 CollectionSchema。

- `int64_t ID() const`

    由服务器分配的 Collection ID。

- `const std::vector<std::string>& Alias() const`

    附加到该 Collection 的别名列表。

- `uint64_t CreatedTime() const`

    创建该 Collection 的 UTC 时间戳（微秒）。

- `uint64_t UpdateTime() const`

    最近一次 Schema 更新的 UTC 时间戳（微秒）。

- `const std::unordered_map<std::string, std::string>& Properties() const`

    Collection 级属性，以键值对形式表示（例如 TTL 设置）。

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
