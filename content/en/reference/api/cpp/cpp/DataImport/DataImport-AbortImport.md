---
title: "AbortImport() | Cloud"
slug: /cpp/cpp/DataImport-AbortImport
sidebar_label: "AbortImport()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Abort a 2PC import job created with options.autocommit=false, discarding its staged imported data. | Cloud"
type: docx
token: GUnjd6RiHooH3CxHbjOc81vInBf
sidebar_position: 4
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - AbortImport()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AbortImport()

Abort a 2PC import job created with options.auto_commit=false, discarding its staged imported data.

## Request Syntax\{#request-syntax}

```c++
static nlohmann::json AbortImport(const std::string& url, const std::string& job_id, const std::string& db_name = "default", const std::string& api_key = "")
```

**RETURNS:**

*nlohmann::json*

Returns the JSON response from the bulk-import endpoint.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

Demonstrates AbortImport() with the C++ SDK.

```c++
auto response = milvus::BulkImport::AbortImport(
    "YOUR_CLUSTER_ENDPOINT", "import-job-id", "default", "YOUR_CLUSTER_TOKEN");
```
