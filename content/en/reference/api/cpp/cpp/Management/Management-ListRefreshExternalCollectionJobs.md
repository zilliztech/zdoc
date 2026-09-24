---
title: "ListRefreshExternalCollectionJobs() | Cloud"
slug: /cpp/cpp/Management-ListRefreshExternalCollectionJobs
sidebar_label: "ListRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists refresh jobs for external collections. Use it to inspect historical or in-flight external collection refresh activity. | Cloud"
type: docx
token: M9b1dFp2ioszBwxqFKUcs6gYn2e
sidebar_position: 24
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - zilliz
  - zilliz cloud
  - cloud
  - ListRefreshExternalCollectionJobs()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListRefreshExternalCollectionJobs()

This operation lists refresh jobs for external collections. Use it to inspect historical or in-flight external collection refresh activity.

```c++
Status ListRefreshExternalCollectionJobs(const ListRefreshExternalCollectionJobsRequest& request, ListRefreshExternalCollectionJobsResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = milvus::ListRefreshExternalCollectionJobsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection whose refresh jobs to list.

**RETURNS:**

*Status*

**EXCEPTIONS:**

- **std::exception**

    This exception can be raised if the request cannot be sent or the response cannot be parsed.

## Example\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::ListRefreshExternalCollectionJobsRequest();
milvus::ListRefreshExternalCollectionJobsResponse response;
status = client->ListRefreshExternalCollectionJobs(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
