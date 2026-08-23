---
title: "AddFileResource() | Cloud"
slug: /cpp/cpp/FileResources-AddFileResource
sidebar_label: "AddFileResource()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation registers a file resource with Milvus. Use it when server-side features need a named file resource. | Cloud"
type: docx
token: QAmzdvwmEoZP55xwBQicVB0cnwh
sidebar_position: 1
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - AddFileResource()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AddFileResource()

This operation registers a file resource with Milvus. Use it when server-side features need a named file resource.

```c++
Status AddFileResource(const AddFileResourceRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = milvus::AddFileResourceRequest()
    .WithName("embedding_model")
    .WithPath("/models/embedding.bin");
```

**REQUEST METHODS:**

- `WithName(const std::string& name)`

    Sets the resource name.

- `WithPath(const std::string& path)`

    Sets the file path for the resource.

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

auto request = milvus::AddFileResourceRequest()
    .WithName("embedding_model")
    .WithPath("/models/embedding.bin");
status = client->AddFileResource(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: File Resources; action: CREATE; addedSince: v3.0.x */}
