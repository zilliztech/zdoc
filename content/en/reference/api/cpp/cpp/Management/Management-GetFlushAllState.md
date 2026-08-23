---
title: "GetFlushAllState() | Cloud"
slug: /cpp/cpp/Management-GetFlushAllState
sidebar_label: "GetFlushAllState()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation checks whether a flush-all action has completed. Use it when you need to poll completion separately from the initial flush request. | Cloud"
type: docx
token: TBtpd6bsLoelhbx2iXDccaVDnqe
sidebar_position: 22
keywords: 
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - GetFlushAllState()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetFlushAllState()

This operation checks whether a flush-all action has completed. Use it when you need to poll completion separately from the initial flush request.

```c++
Status GetFlushAllState(const GetFlushAllStateRequest& request, GetFlushAllStateResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = milvus::GetFlushAllStateRequest()
    .WithDatabaseName("default")
    .WithFlushAllTs(flush_all_ts);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the database used for the original flush-all operation.

- `WithFlushAllTs(uint64_t flush_all_ts)`

    Sets the timestamp returned by `FlushAll()`.

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

auto request = milvus::GetFlushAllStateRequest()
    .WithDatabaseName("default")
    .WithFlushAllTs(flush_all_ts);
milvus::GetFlushAllStateResponse response;
status = client->GetFlushAllState(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Management; action: CREATE; addedSince: v3.0.x */}
