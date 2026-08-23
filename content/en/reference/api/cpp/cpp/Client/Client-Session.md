---
title: "Session() | Cloud"
slug: /cpp/cpp/Client-Session
sidebar_label: "Session()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Create a cluster-scoped session exposing DQL interfaces only. | Cloud"
type: docx
token: VTkhdUYKvoYBPRx7EDiczhJhnhe
sidebar_position: 13
keywords: 
  - rag llm architecture
  - private llms
  - nn search
  - llm eval
  - zilliz
  - zilliz cloud
  - cloud
  - Session()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Session()

Create a cluster-scoped session exposing DQL interfaces only.

## Request Syntax\{#request-syntax}

```c++
Status Session(const std::string& cluster_id, MilvusClientV2SessionPtr& session)
```

**RETURNS:**

*Status*

Returns a status indicating whether the operation succeeded.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

Demonstrates Session() with the C++ SDK.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

milvus::MilvusClientV2SessionPtr session;
util::CheckStatus(client->Session("cluster-a", session));
```
