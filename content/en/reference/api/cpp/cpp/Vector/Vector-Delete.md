---
title: "Delete() | Cloud"
slug: /cpp/cpp/Vector-Delete
sidebar_label: "Delete()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation deletes entities by a filtering expression or an ID array. | Cloud"
type: docx
token: B9XjdA1Cgo0oBRxglOlcrlPan9e
sidebar_position: 1
keywords: 
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - zilliz
  - zilliz cloud
  - cloud
  - Delete()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Delete()

This operation deletes entities by a filtering expression or an ID array.

```c++
Status Delete(const DeleteRequest& request, DeleteResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DeleteRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionName(partition_name)
    .WithFilter(filter)
    .WithFilterTemplates(value)
    .WithIDs(id_array);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

- `WithPartitionName(const std::string& partition_name)`

    Sets the names of the partitions. If it is empty, the default partition applies.

- `WithFilter(const std::string& filter)`

    Sets a filter expression.

- `AddFilterTemplate(std::string key, nlohmann::json&& filter_template)`

    Adds a filter template. This takes effect only if `WithFilter()` is set.  Read this page for more about [filter templating](https://milvus.io/docs/filtering-templating.md).

- `WithFilterTemplates(std::unordered_map<std::string, nlohmann::json>&& filter_templates)`

    Sets filter templates. This takes effect only if `WithFilter()` is set.  Read this page for more about [filter templating](https://milvus.io/docs/filtering-templating.md).

- `WithIDs(std::vector<int64_t>&& id_array)`

    Sets a set of integer primary keys. This takes effect only if `WithFilter()` is empty.

**RETURNS:**

*Status* with *DeleteResponse*

Check `status.IsOk()` to confirm success.

### DmlResults\{#dmlresults}

This class carries the outcome of a data-mutation operation (insert, upsert, or delete). It is accessed via `Results()` on `InsertResponse`, `UpsertResponse`, or `DeleteResponse`.

```c++
const DmlResults& results = response.Results();
```

**METHODS:**

- `const IDArray& IdArray() const`

    The IDs of the entities that were inserted, upserted, or deleted. For auto-ID collections the server fills this in after insert. See IDArray for how to read integer or string IDs.

- `uint64_t Timestamp() const`

    Server-side operation timestamp. Can be passed as the `guarantee_timestamp` in subsequent search or query calls to ensure read-your-writes consistency.

- `uint64_t InsertCount() const`

    Number of rows that were inserted. Populated for `InsertResponse` and `UpsertResponse`.

- `uint64_t DeleteCount() const`

    Number of rows that were deleted. Populated for `DeleteResponse` and `UpsertResponse`.

- `uint64_t UpsertCount() const`

    Number of rows that were upserted (inserted as new or replaced existing). Populated for `UpsertResponse`.

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

milvus::DeleteResponse resp_delete;
status = client->Delete(milvus::DeleteRequest()
                            .WithCollectionName(collection_name)
                            .WithPartitionName(partition_name)
                            .WithFilter(field_id + "== 5"),
                        resp_delete);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
