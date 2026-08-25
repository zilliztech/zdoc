---
title: "ConsistencyLevel | Cloud"
slug: /cpp/cpp/Collections-ConsistencyLevel
sidebar_label: "ConsistencyLevel"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此枚举用于控制搜索和查询操作的数据可见性保证。您可以通过 `SearchRequest:WithConsistencyLevel()` 或 `QueryRequest::WithConsistencyLevel()` 按请求设置一致性级别，也可以通过 `CreateCollectionRequest::WithConsistencyLevel()` 设置 Collection 的默认一致性级别。 | Cloud"
type: docx
token: PSxodxjuFo7SZFxP9qZc09ELn5c
sidebar_position: 12
keywords: 
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - zilliz
  - zilliz cloud
  - cloud
  - ConsistencyLevel
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ConsistencyLevel

此枚举用于控制搜索和查询操作的数据可见性保证。您可以通过 `SearchRequest::WithConsistencyLevel()` 或 `QueryRequest::WithConsistencyLevel()` 按请求设置一致性级别，也可以通过 `CreateCollectionRequest::WithConsistencyLevel()` 设置 Collection 的默认一致性级别。

```c++
enum class ConsistencyLevel {
    NONE      = -1,
    STRONG    = 0,
    SESSION   = 1,
    BOUNDED   = 2,
    EVENTUALLY = 3,
};
```

**取值：**

- **NONE** (-1)

    未针对当前请求指定一致性级别，将使用 Collection 级别的默认值。

- **STRONG** (0)

    所有读取操作均能反映最新已提交的写入数据。这是最严格的一致性保证，但由于查询节点需等待最新数据完成复制，可能会导致较高的延迟。

- **SESSION** (1)

    在单个客户端会话内，读取操作始终能看到该会话中之前的写入数据。其他会话的写入数据可能不会立即可见。

- **BOUNDED** (2)

    读取数据的滞后时间可配置（默认为 5 秒）。该级别兼顾了数据新鲜度与吞吐量，适用于大多数生产环境工作负载。

- **EVENTUALLY** (3)

    不保证数据新鲜度。查询节点直接基于本地现有数据返回结果。该级别可提供最低延迟，但可能会返回过期数据。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
#include <milvus/MilvusClientV2.h>
#include <milvus/types/ConsistencyLevel.h>
using namespace milvus;

// Per-request: require strong consistency for a critical query
QueryRequest query;
query.WithCollectionName("my_collection")
     .WithFilter("id in [1, 2, 3]")
     .AddOutputField("vec")
     .WithConsistencyLevel(ConsistencyLevel::STRONG);

// Per-request: accept bounded staleness for a high-throughput search
SearchRequest search;
search.WithCollectionName("my_collection")
      .WithAnnsField("vec")
      .WithLimit(10)
      .WithConsistencyLevel(ConsistencyLevel::BOUNDED);

// Collection-level default: set when creating the collection
auto status = client->CreateCollection(
    CreateCollectionRequest()
        .WithCollectionName("my_collection")
        .WithCollectionSchema(schema)
        .WithConsistencyLevel(ConsistencyLevel::BOUNDED));
```
