---
title: "GetServerVersion() | Cloud"
slug: /cpp/cpp/Client-GetServerVersion
sidebar_label: "GetServerVersion()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the Zilliz Cloud server version. | Cloud"
type: docx
token: VgZtdAUzyoJplBxYfdMc1OGonng
sidebar_position: 8
keywords: 
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - GetServerVersion()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetServerVersion()

This operation returns the Zilliz Cloud server version.

```c++
Status GetServerVersion(std::string& version)
```

**PARAMETERS:**

- **version** (*std::string&*)

    Sets a variable that holds the returned server version number.

**RETURNS:**

*Status*

Check `status.IsOk()` to confirm success.

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

std::string version;
status = client->GetServerVersion(version);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "The milvus server version is: " << version << std::endl;
```
