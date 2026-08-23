---
title: "DropIndex() | Cloud"
slug: /cpp/cpp/Management-DropIndex
sidebar_label: "DropIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops the index from a field. | Cloud"
type: docx
token: JstbdGVJwocHJ0xQ8M8cagZHn2a
sidebar_position: 5
keywords: 
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - DropIndex()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropIndex()

This operation drops the index from a field.

```c++
Status DropIndex(const DropIndexRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DropIndexRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithIndexName(index_name);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

- `WithFieldName(const std::string& field_name)`

    Sets the name of the field. 

- `WithIndexName(const std::string& index_name)`

    Sets the name of the index.

    <Admonition type="info" icon="📘" title="Notes">

    If both the field name and the index name are specified, the index name will be used; otherwise, it falls back to the field name.

    </Admonition>

**RETURNS:**

*Status*

Check `status.IsOk()` to confirm success.

**EXCEPTIONS:**

- **StatusCode**

    Check `status.Code()` and `status.Message()` for error details.

## Example\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->DropIndex(
    milvus::DropIndexRequest()
        .WithCollectionName(collection_name)
        .WithFieldName(field_face)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
