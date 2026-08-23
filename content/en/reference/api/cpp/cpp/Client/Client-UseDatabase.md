---
title: "UseDatabase() | Cloud"
slug: /cpp/cpp/Client-UseDatabase
sidebar_label: "UseDatabase()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation shifts the connection from one database to another. | Cloud"
type: docx
token: GvrfdEbvAoziA8xsAgPcBXDJnAb
sidebar_position: 12
keywords: 
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing
  - zilliz
  - zilliz cloud
  - cloud
  - UseDatabase()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# UseDatabase()

This operation shifts the connection from one database to another.

```c++
Status UseDatabase(const std::string& db_name)
```

**PARAMETERS:**

- **db_name** (*const std::string&*)

    Sets the name of the database to use.

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

status = client->UseDatabase(db_name);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
