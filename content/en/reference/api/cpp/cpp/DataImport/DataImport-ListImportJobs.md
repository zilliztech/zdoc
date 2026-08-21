---
title: "ListImportJobs() | Cloud"
slug: /cpp/cpp/DataImport-ListImportJobs
sidebar_label: "ListImportJobs()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation retrieves a list of all bulk import jobs associated with a specific collection. It is useful for auditing past and in-progress import operations. | Cloud"
type: docx
token: Ls7kdwtuJoZfVUx1N3vc5tkznuh
sidebar_position: 3
keywords: 
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db
  - zilliz
  - zilliz cloud
  - cloud
  - ListImportJobs()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListImportJobs()

This operation retrieves a list of all bulk import jobs associated with a specific collection. It is useful for auditing past and in-progress import operations.

```c++
static nlohmann::json BulkImport::ListImportJobs(
    const std::string& url,
    const std::string& collection_name,
    const std::string& db_name = "default",
    const std::string& api_key = "")
```

## Request Syntax\{#request-syntax}

```c++
auto resp = milvus::BulkImport::ListImportJobs(
    url,
    collection_name,
    db_name,
    api_key);
```

**PARAMETERS:**

- `url` (*const std::string&*)

    **[REQUIRED]**

    The URL of the Milvus server, e.g. `"YOUR_CLUSTER_ENDPOINT"`.

- `collection_name` (*const std::string&*)

    **[REQUIRED]**

    The name of the collection whose import jobs to list.

- `db_name` (*const std::string&*)

    The name of the database that holds the collection. Defaults to `"default"`.

- `api_key` (*const std::string&*)

    The API key for authentication. Pass as `"username:password"` for Milvus or a cloud API key for Zilliz Cloud.

**RETURNS:**

*nlohmann::json*

A JSON object containing an array of import job records, or `nullptr` on failure. Each record includes the job ID, state, and creation time.

**EXCEPTIONS:**

- **std::exception**

    Thrown if the HTTP request fails or the response cannot be parsed. Check the return value for `nullptr` to detect failures.

## Example\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "root", "Milvus"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// List all import jobs for a collection
auto resp = milvus::BulkImport::ListImportJobs(
    "YOUR_CLUSTER_ENDPOINT",
    "my_collection",
    "default",
    "YOUR_CLUSTER_TOKEN"
);

if (!resp.is_null()) {
    for (auto& job : resp["data"]["records"]) {
        std::cout << "Job ID: " << job["jobId"]
                  << "  State: " << job["state"] << std::endl;
    }
} else {
    std::cout << "Failed to list import jobs" << std::endl;
}
```
