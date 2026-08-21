---
title: "CommitImport() | Cloud"
slug: /cpp/cpp/DataImport-CommitImport
sidebar_label: "CommitImport()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Commit a 2PC import job created with options.autocommit=false, making its staged imported data visible. | Cloud"
type: docx
token: DvRYdqk6qonziIxPQlJcqZN9nBd
sidebar_position: 5
keywords: 
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
  - zilliz
  - zilliz cloud
  - cloud
  - CommitImport()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CommitImport()

Commit a 2PC import job created with options.auto_commit=false, making its staged imported data visible.

## Request Syntax\{#request-syntax}

```c++
static nlohmann::json CommitImport(const std::string& url, const std::string& job_id, const std::string& db_name = "default", const std::string& api_key = "")
```

**RETURNS:**

*nlohmann::json*

Returns the JSON response from the bulk-import endpoint.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

Demonstrates CommitImport() with the C++ SDK.

```c++
auto response = milvus::BulkImport::CommitImport(
    "YOUR_CLUSTER_ENDPOINT", "import-job-id", "default", "YOUR_CLUSTER_TOKEN");
```
