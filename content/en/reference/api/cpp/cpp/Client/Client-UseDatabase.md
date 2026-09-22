---
title: "UseDatabase() | Cloud"
slug: /cpp/cpp/Client-UseDatabase
sidebar_label: "UseDatabase()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation switches the client's connection to another database on the same Milvus server. | Cloud"
type: docx
token: G70Odip3yoLDIwxaUGEc2e2Snoh
sidebar_position: 13
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

This operation switches the client's connection to another database on the same Milvus server.

```c++
Status UseDatabase(const std::string& db_name)
```

**RETURNS:**

*Status*

Returns a status indicating whether the operation succeeded.

**ERROR HANDLING:**

- **std::exception**

    Thrown when the client fails to switch to the target database. Inspect the exception message or returned Status for failure details.

## Example\{#example}

Call UseDatabase() on a connected MilvusClientV2 to switch the connection to another database.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->UseDatabase();
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
