---
title: "Connect() | Cloud"
slug: /cpp/cpp/Client-Connect
sidebar_label: "Connect()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation establishes the connection between the client and the Milvus server using the given connection parameters. | Cloud"
type: docx
token: TuY9d4LfuoEptYxb25HcXmqcncb
sidebar_position: 2
keywords: 
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - Connect()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Connect()

This operation establishes the connection between the client and the Milvus server using the given connection parameters.

```c++
Status Connect(const ConnectParam& connect_param)
```

**RETURNS:**

*Status*

Returns a Status indicating whether the connection was established successfully.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

Connects to a Milvus server using a URI and token credentials, then checks the returned status.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
