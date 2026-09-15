---
title: "C++ SDK 参考 | Cloud"
slug: /cpp
sidebar_label: "概览"
sidebar_position: 5
displayed_sidebar: cppSidebar
beta: FALSE
notebook: FALSE
---

import Admonition from '@theme/Admonition';

# C++ SDK 参考

[Milvus C++ SDK](https://github.com/milvus-io/milvus-sdk-cpp) 是 Milvus 和 Zilliz Cloud 的官方 C++ 客户端。它提供原生 C++ API，可通过流畅的请求构建器风格管理 Collection、向量、索引和 Database 操作。

## 功能特性

- **原生 C++ API** — 流畅的请求构建器模式，返回 `Status` 值
- **Collection 和向量管理** — 创建、描述、加载和删除 Collection；管理 Schema 和索引
- **数据操作** — 插入、upsert、删除、查询和搜索，包括混合搜索和稀疏向量搜索
- **Database 和用户管理** — RBAC、资源组、别名和 Database 管理
- **现代字段类型** — Array、JSON、稀疏、二进制、float16/bfloat16, int8 和 struct 字段
- **Milvus 和 Zilliz Cloud** — 通过 URI 连接自托管的 Milvus 和 Zilliz Cloud 实例

## 兼容性

下表列出了各 Milvus 版本推荐使用的 milvus-sdk-cpp 版本：

| Milvus 版本 | 推荐的 SDK 版本 |
|:-----:|:-----:|
| 2.3.x | 2.3 (branch) |
| 2.4.x | v2.4.1 |
| 2.5.x | v2.5.4 |
| 2.6.x | v2.6.6 |
| 3.0.x | v3.0.2 |

## 安装

有关如何从源代码编译并安装 SDK 的详细信息，请参见 [开发指南](https://github.com/milvus-io/milvus-sdk-cpp/blob/master/DEVELOPMENT.md)。

## 快速开始

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

## 示例

除文档外，您还可以参考我们 [GitHub 仓库](https://github.com/milvus-io/milvus-sdk-cpp) 中的[示例集](https://github.com/milvus-io/milvus-sdk-cpp/tree/master/examples/src)。
