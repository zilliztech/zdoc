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

The [Milvus C++ SDK](https://github.com/milvus-io/milvus-sdk-cpp) is the official C++ client for Milvus and Zilliz Cloud. It provides a native C++ API for managing collections, vectors, indexes, and database operations, with a fluent request-builder style.

## Features

- **Native C++ API** — Fluent request-builder pattern with `Status` return values
- **Collection and vector management** — Create, describe, load, and drop collections; manage schemas and indexes
- **Data operations** — Insert, upsert, delete, query, and search, including hybrid and sparse vector search
- **Database and user management** — RBAC, resource groups, aliases, and database administration
- **Modern field types** — Array, JSON, sparse, binary, float16/bfloat16, int8, and struct fields
- **Milvus and Zilliz Cloud** — Connect to both self-hosted Milvus and Zilliz Cloud instances via URI

## Compatibility

The following table shows the recommended milvus-sdk-cpp versions for each Milvus version:

| Milvus version | Recommended SDK version |
|:-----:|:-----:|
| 2.3.x | 2.3 (branch) |
| 2.4.x | v2.4.1 |
| 2.5.x | v2.5.4 |
| 2.6.x | v2.6.6 |
| 3.0.x | v3.0.2 |

## Installation

See the [Development Guide](https://github.com/milvus-io/milvus-sdk-cpp/blob/master/DEVELOPMENT.md) for details on how to compile and install the SDK from source.

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

In addition to the documents, you can also refer to the [example sets](https://github.com/milvus-io/milvus-sdk-cpp/tree/master/examples/src) in our [GitHub repository](https://github.com/milvus-io/milvus-sdk-cpp).
