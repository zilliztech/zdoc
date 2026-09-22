---
title: "Optimize() | Cloud"
slug: /cpp/cpp/Management-Optimize
sidebar_label: "Optimize()"
beta: false
added_since: v2.6.3
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation optimizes a collection's segments by waiting for pending index builds, compacting toward the requested target segment size, and refreshing the load state if the collection is loaded. With the async option the work runs in a background task exposed through the OptimizeTask handle, which yields the final result. | Cloud"
type: docx
token: NlpedMAt2of5d6xPHvucRSzjnVe
sidebar_position: 18
keywords: 
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - zilliz
  - zilliz cloud
  - cloud
  - Optimize()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Optimize()

This operation optimizes a collection's segments by waiting for pending index builds, compacting toward the requested target segment size, and refreshing the load state if the collection is loaded. With the async option the work runs in a background task exposed through the OptimizeTask handle, which yields the final result.

```c++
Status Optimize(const OptimizeRequest& request, OptimizeTaskPtr& task)
```

## Request Syntax\{#request-syntax}

```c++
auto request = OptimizeRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithTargetSize(target_size)
    .WithAsync(async)
    .WithTimeoutMs(timeout_ms);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the name of the target database; the default database is used if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection to be optimized. This value cannot be empty.

- `WithTargetSize(const std::string& target_size)`

    Sets the target segment size for optimization, such as "512MB" or "1GB".

- `WithAsync(bool async)`

    Sets whether the optimization runs asynchronously. When true, Optimize() returns as soon as the background task starts; when false, the call blocks until the optimization completes.

- `WithTimeoutMs(int64_t timeout_ms)`

    Sets the overall task timeout in milliseconds. Zero means no overall timeout.

**RETURNS:**

*Status*

Returns a Status indicating whether the operation succeeded. In synchronous mode it reflects the outcome of the whole optimization run; in asynchronous mode it indicates whether the background task was started, whose final status is available through the OptimizeTask handle.

- **response** (*OptimizeTaskPtr*) -

    - **GetResult** (*Status*) -

        Wait for task result. Timeout zero means wait forever.

        - **StatusText** (*const std::string&*) -

            Get status text.

        - **CollectionName** (*const std::string&*) -

            Get collection name.

        - **CompactionID** (*int64_t*) -

            Get compaction ID.

        - **TargetSize** (*const std::string&*) -

            Get normalized target size.

        - **ProgressHistory** (*const std::vector&lt;std::string&gt;&*) -

            Get progress history.

    - **Cancel** (*bool*) -

        Cancel the task cooperatively.

    - **IsDone** (*bool*) -

        Whether the task is done.

    - **IsCancelled** (*bool*) -

        Whether the task is cancelled.

    - **CurrentProgress** (*std::string*) -

        Current progress message.

    - **ProgressHistory** (*std::vector&lt;std::string&gt;*) -

        Progress message history.

    - **TaskStatus** (*Status*) -

        Final task status if done, otherwise OK.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or the returned Status for failure details.

## Example\{#example}

Call Optimize() on a connected MilvusClientV2 to compact a collection's segments toward the target size, using the OptimizeTask handle for the final result.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::OptimizeRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithTargetSize(target_size);
status = client->Optimize(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
