---
title: "RefreshExternalCollection() | Cloud"
slug: /cpp/cpp/Management-RefreshExternalCollection
sidebar_label: "RefreshExternalCollection()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation starts a refresh job for an external collection. Use it after external data changes and the collection metadata needs to be refreshed. | Cloud"
type: docx
token: GjhbdmL5PorgMXxkHTPcvVt6nul
sidebar_position: 5
keywords: 
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
  - zilliz
  - zilliz cloud
  - cloud
  - RefreshExternalCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RefreshExternalCollection()

This operation starts a refresh job for an external collection. Use it after external data changes and the collection metadata needs to be refreshed.

```c++
Status RefreshExternalCollection(const RefreshExternalCollectionRequest& request, RefreshExternalCollectionResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = milvus::RefreshExternalCollectionRequest()
    .WithExternalSource("s3")
    .WithExternalSpec({{"bucket", "milvus-data"}, {"path", "collections/book"}});
```

**REQUEST METHODS:**

- `WithExternalSource(const std::string& external_source)`

    Sets the external source type.

- `WithExternalSpec(const nlohmann::json& external_spec)`

    Sets provider-specific refresh configuration as JSON.

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

auto request = milvus::RefreshExternalCollectionRequest()
    .WithExternalSource("s3")
    .WithExternalSpec({{"bucket", "milvus-data"}, {"path", "collections/book"}});
milvus::RefreshExternalCollectionResponse response;
status = client->RefreshExternalCollection(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: File Resources; action: CREATE; addedSince: v3.0.x */}
