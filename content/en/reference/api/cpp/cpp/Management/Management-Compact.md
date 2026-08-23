---
title: "Compact() | Cloud"
slug: /cpp/cpp/Management-Compact
sidebar_label: "Compact()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation manually triggers a compaction action. In normal cases, users do not need to run this operation because Milvus automatically triggers compactions internally. It is mainly used for maintenance or debugging purposes. | Cloud"
type: docx
token: ZidndgXjGoLam3xqLOOcmFTYnBh
sidebar_position: 2
keywords: 
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - zilliz
  - zilliz cloud
  - cloud
  - Compact()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Compact()

This operation manually triggers a compaction action. In normal cases, users do not need to run this operation because Milvus automatically triggers compactions internally. It is mainly used for maintenance or debugging purposes.

```c++
Status Compact(const CompactRequest& request, CompactResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = CompactRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithClusteringCompaction(clustering_compaction)
    .WithTargetSize(target_size);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

- `WithClusteringCompaction(bool clustering_compaction)`

    Sets the cluserting compaction flag. 

    - **True**: Conducts clustering compaction and reports an error if there is no clustering key.

    - **False**: Conducts normal compaction.

- `WithTargetSize(int64_t target_size)`

    Sets the target segment size in bytes for compaction planning. Use values greater than 0 to guide output segment sizing.

**RETURNS:**

*Status* with *CompactResponse*

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

milvus::CompactResponse response;
status = client->Compact(
    milvus::CompactRequest()
        .WithCollectionName("my_collection"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Compaction ID: " << response.CompactionID() << std::endl;
```
