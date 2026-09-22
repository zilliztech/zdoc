---
title: "CheckHealth() | Cloud"
slug: /cpp/cpp/Client-CheckHealth
sidebar_label: "CheckHealth()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation checks the health of the connected Milvus server; the response reports whether the server is healthy and, if not, the reasons. | Cloud"
type: docx
token: H8bEdNoDNoQMojxNEWKc7xIQnPb
sidebar_position: 1
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - CheckHealth()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CheckHealth()

This operation checks the health of the connected Milvus server; the response reports whether the server is healthy and, if not, the reasons.

```c++
Status CheckHealth(const CheckHealthRequest& request, CheckHealthResponse& response)
```

**RETURNS:**

*Status*

Returns a status indicating whether the operation succeeded; the response carries the health flag and, if unhealthy, the reasons.

- **response** (*CheckHealthResponse*) -

    - **IsHealthy** (*bool*) -

        Get whether the Milvus server is healthy.

    - **Reasons** (*const std::vector&lt;std::string&gt;&*) -

        Get the reasons why the Milvus server is unhealthy.

    - **QuotaStates** (*const std::vector&lt;std::string&gt;&*) -

        Get the quota states that prevent the Milvus server from providing service.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or the returned Status for failure details.

## Example\{#example}

Call CheckHealth() on a connected MilvusClientV2 to check the server's health and report any failure reasons.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CheckHealthRequest request;
milvus::CheckHealthResponse response;
status = client->CheckHealth(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
