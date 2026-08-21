---
title: "ListRefreshExternalCollectionJobs() | Cloud"
slug: /cpp/cpp/Management-ListRefreshExternalCollectionJobs
sidebar_label: "ListRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists refresh jobs for external collections. Use it to inspect historical or in-flight external collection refresh activity. | Cloud"
type: docx
token: TjrfdFKTIoiaQ0x3NXUcMEvHnNb
sidebar_position: 4
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
auto request = milvus::ListRefreshExternalCollectionJobsRequest();
```

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

{/* category: File Resources; action: CREATE; addedSince: v3.0.x */}
