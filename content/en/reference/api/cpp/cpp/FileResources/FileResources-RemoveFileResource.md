---
title: "RemoveFileResource() | Cloud"
slug: /cpp/cpp/FileResources-RemoveFileResource
sidebar_label: "RemoveFileResource()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation removes a registered file resource. Use it to clean up resources that are no longer referenced. | Cloud"
type: docx
token: Gs0EdiKeEoU5Exxxnb8ckz74nId
sidebar_position: 6
keywords: 
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - zilliz
  - zilliz cloud
  - cloud
  - RemoveFileResource()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RemoveFileResource()

This operation removes a registered file resource. Use it to clean up resources that are no longer referenced.

```c++
Status RemoveFileResource(const RemoveFileResourceRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = milvus::RemoveFileResourceRequest()
    .WithName("embedding_model");
```

**REQUEST METHODS:**

- `WithName(const std::string& name)`

    Sets the resource name to remove.

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

auto request = milvus::RemoveFileResourceRequest()
    .WithName("embedding_model");
status = client->RemoveFileResource(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: File Resources; action: CREATE; addedSince: v3.0.x */}
