---
title: "GetServerVersionV2() | Cloud"
slug: /cpp/cpp/Client-GetServerVersionV2
sidebar_label: "GetServerVersionV2()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the Milvus server version. When the request's `WithDetail(true)` is set, the response also carries the build time, git commit, Go version, and deploy mode of the server. | Cloud"
type: docx
token: EVSGdMtnqoaLzixGFkfcrdCHnNe
sidebar_position: 9
keywords: 
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database
  - zilliz
  - zilliz cloud
  - cloud
  - GetServerVersionV2()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetServerVersionV2()

This operation returns the Milvus server version. When the request's `WithDetail(true)` is set, the response also carries the build time, git commit, Go version, and deploy mode of the server.

```c++
Status GetServerVersionV2(const GetServerVersionRequest& request, GetServerVersionResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = GetServerVersionRequest()
    .WithDetail(detail);
```

**REQUEST METHODS:**

- `WithDetail(bool detail)`

    When `true`, the response also carries the server build time, git commit, Go version, and deploy mode.

**RETURNS:**

*Status* with *GetServerVersionResponse*

Check `status.IsOk()` to confirm success.

### GetServerVersionResponse\{#getserverversionresponse}

**METHODS:**

- `const std::string& Version() const`

    Returns the server version.

- `const std::string& BuildTime() const`

    Returns the server build time. Populated when the request sets `WithDetail(true)`.

- `const std::string& GitCommit() const`

    Returns the server git commit. Populated when the request sets `WithDetail(true)`.

- `const std::string& GoVersion() const`

    Returns the Go version used to build the server. Populated when the request sets `WithDetail(true)`.

- `const std::string& DeployMode() const`

    Returns the server deploy mode. Populated when the request sets `WithDetail(true)`.

**EXCEPTIONS:**

- **StatusCode**

    Check `status.Code()` and `status.Message()` for error details.

## Example\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::GetServerVersionRequest request;
request.WithDetail(true);
milvus::GetServerVersionResponse response;
status = client->GetServerVersionV2(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "The milvus server version is: " << response.Version() << std::endl;
```
