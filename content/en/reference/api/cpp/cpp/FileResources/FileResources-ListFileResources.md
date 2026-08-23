---
title: "ListFileResources() | Cloud"
slug: /cpp/cpp/FileResources-ListFileResources
sidebar_label: "ListFileResources()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists registered file resources. Use it to discover resource names and paths available to server-side features. | Cloud"
type: docx
token: LHdcdoz6OoQajtx3SMMcGLjcnFh
sidebar_position: 3
keywords: 
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - ListFileResources()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListFileResources()

This operation lists registered file resources. Use it to discover resource names and paths available to server-side features.

```c++
Status ListFileResources(const ListFileResourcesRequest& request, ListFileResourcesResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = milvus::ListFileResourcesRequest();
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

auto request = milvus::ListFileResourcesRequest();
milvus::ListFileResourcesResponse response;
status = client->ListFileResources(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: File Resources; action: CREATE; addedSince: v3.0.x */}
