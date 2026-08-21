---
title: "CurrentUsedDatabase() | Cloud"
slug: /cpp/cpp/Client-CurrentUsedDatabase
sidebar_label: "CurrentUsedDatabase()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the currently used database name. This API is useful in multi-database scenarios. | Cloud"
type: docx
token: ZmS3drufioCOIBxq3PSc26O7nie
sidebar_position: 5
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - CurrentUsedDatabase()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CurrentUsedDatabase()

This operation returns the currently used database name. This API is useful in multi-database scenarios.

```c++
Status CurrentUsedDatabase(std::string& db_name)
```

**PARAMETERS:**

- **db_name** (*std::string&*)

    Sets a variable that holds the name of the currently used database.

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

std::string current_db_name;
client->CurrentUsedDatabase(current_db_name);
std::cout << "Current in-used database: " << current_db_name << std::endl;
```
