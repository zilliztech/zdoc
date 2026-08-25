---
title: "C++ SDK Reference | Cloud"
slug: /cpp
sidebar_label: "Overview"
sidebar_position: 5
displayed_sidebar: cppSidebar
beta: FALSE
notebook: FALSE
---

import Admonition from '@theme/Admonition';

# C++ SDK Reference

[Milvus C++ SDK](https://github.com/milvus-io/milvus-sdk-cpp) 是 Milvus 和 Zilliz Cloud 的官方 C++ 客户端。它提供原生 C++ API，支持以流畅的请求构建器风格管理 Collection、向量、索引及 Database 操作。

## Features

- **原生 C++ API** — 采用流畅的请求构建器模式，返回 `Status` 类型值
- **Collection 与向量管理** — 创建、描述、加载和删除 Collection；管理 Schema 与索引
- **数据操作** — 支持插入、upsert、删除、查询和搜索，涵盖混合搜索与稀疏向量搜索
- **Database 与用户管理** — 支持 RBAC、资源组、别名及 Database 管理
- **现代字段类型** — 支持 Array、JSON、稀疏、二进制、float16/bfloat16, int8 及 struct 字段
- **Milvus 与 Zilliz Cloud** — 通过 URI 连接自托管的 Milvus 和 Zilliz Cloud 实例

## Compatibility

下表列出了各 Milvus 版本推荐使用的 milvus-sdk-cpp 版本：

| Milvus 版本 | 推荐的 SDK 版本 |
|:-----:|:-----:|
| 2.3.x | 2.3 (branch) |
| 2.4.x | v2.4.1 |
| 2.5.x | v2.5.4 |
| 2.6.x | v2.6.6 |
| 3.0.x | v3.0.2 |

## Installation

如需了解如何从源代码编译并安装 SDK，请参阅 [Development Guide](https://github.com/milvus-io/milvus-sdk-cpp/blob/master/DEVELOPMENT.md)。

## Quick Start

```cpp
#include <milvus/MilvusClientV2.h>

using namespace milvus;

int main() {
    auto client = MilvusClientV2::Create();
    ConnectParam connect_param{"http://localhost:19530", "root:Milvus"};
    auto status = client->Connect(connect_param);
    if (!status.IsOk()) {
        return 1;
    }

    // Create a simple collection with a primary field and a vector field
    CreateSimpleCollectionRequest req;
    req.WithCollectionName("my_collection")
       .WithPrimaryFieldName("id")
       .WithVectorFieldName("embedding")
       .WithDimension(128);
    status = client->CreateSimpleCollection(req);

    client->Disconnect();
    return 0;
}
```

import DocCardList from '@theme/DocCardList';

<DocCardList />

## Examples

除文档外，您还可以参考我们 [GitHub repository](https://github.com/milvus-io/milvus-sdk-cpp) 中的[示例集](https://github.com/milvus-io/milvus-sdk-cpp/tree/master/examples/src)。
