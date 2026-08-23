---
title: "GetSDKVersion() | Cloud"
slug: /cpp/cpp/Client-GetSDKVersion
sidebar_label: "GetSDKVersion()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the SDK version. | Cloud"
type: docx
token: ZPS0ddywzo9DObxXS9Rc7yornDc
sidebar_position: 7
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - GetSDKVersion()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetSDKVersion()

This operation returns the SDK version.

```c++
Status GetSDKVersion(std::string& version)
```

**PARAMETERS:**

- **version** (*std::string&*)

    Sets a variable that holds the returned SDK version number.

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

// print the SDK version
client->GetSDKVersion(version);
std::cout << "The CPP SDK version is: " << version << std::endl;
```
