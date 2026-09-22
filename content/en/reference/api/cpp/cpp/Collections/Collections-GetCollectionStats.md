---
title: "GetCollectionStats() | Cloud"
slug: /cpp/cpp/Collections-GetCollectionStats
sidebar_label: "GetCollectionStats()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation fetches statistics of a collection, such as the row count. Currently, only the row count is returned. | Cloud"
type: docx
token: V2TUd3ZWJoiv4LxTUFfc8H3Nnrc
sidebar_position: 26
keywords: 
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - zilliz
  - zilliz cloud
  - cloud
  - GetCollectionStats()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetCollectionStats()

This operation fetches statistics of a collection, such as the row count. Currently, only the row count is returned.

```c++
Status GetCollectionStats(const GetCollectionStatsRequest& request, GetCollectionStatsResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = GetCollectionStatsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database is used if the name is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

**RETURNS:**

*Status*

Returns a Status indicating whether the operation succeeded. The collection statistics, currently the row count, are carried in the response object.

- **response** (*GetCollectionStatsResponse*) -

    - **Stats** (*const CollectionStat&*) -

        Get collection stats.

        - **RowCount** (*uint64_t*) -

            Return row count of this collection.

        - **Name** (*const std::string&*) -

            Get collection name.

        - **Statistics** (*const std::unordered_map&lt;std::string, std::string>&*) -

            Get the raw key/value statistics map of this collection.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or the returned Status for failure details.

## Example\{#example}

Call GetCollectionStats() on a connected MilvusClientV2 to fetch the statistics of a collection and read the row count from the response.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::GetCollectionStatsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
milvus::GetCollectionStatsResponse response;
status = client->GetCollectionStats(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Row count: " << response.Stats().RowCount() << std::endl;
```
