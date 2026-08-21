---
title: "GetRefreshExternalCollectionProgress() | Cloud"
slug: /cpp/cpp/Management-GetRefreshExternalCollectionProgress
sidebar_label: "GetRefreshExternalCollectionProgress()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets progress for a refresh-external-collection job. Use it to poll job completion and inspect failure reasons. | Cloud"
type: docx
token: X9AodAxugobD0Yxt7S9c27z9nNg
sidebar_position: 2
keywords: 
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite
  - zilliz
  - zilliz cloud
  - cloud
  - GetRefreshExternalCollectionProgress()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetRefreshExternalCollectionProgress()

This operation gets progress for a refresh-external-collection job. Use it to poll job completion and inspect failure reasons.

```c++
Status GetRefreshExternalCollectionProgress(const GetRefreshExternalCollectionProgressRequest& request, GetRefreshExternalCollectionProgressResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = milvus::GetRefreshExternalCollectionProgressRequest()
    .WithJobID(job_id);
```

**REQUEST METHODS:**

- `WithJobID(int64_t job_id)`

    Sets the refresh job ID returned by `RefreshExternalCollection()`.

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

auto request = milvus::GetRefreshExternalCollectionProgressRequest()
    .WithJobID(job_id);
milvus::GetRefreshExternalCollectionProgressResponse response;
status = client->GetRefreshExternalCollectionProgress(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: File Resources; action: CREATE; addedSince: v3.0.x */}
