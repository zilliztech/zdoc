---
title: "AddCollectionField() | Cloud"
slug: /cpp/cpp/Collections-AddCollectionField
sidebar_label: "AddCollectionField()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Add a field to an existing collection. | Cloud"
type: docx
token: KMuzdtwSaoadnbx0caLcHCAGn1b
sidebar_position: 1
keywords: 
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - zilliz
  - zilliz cloud
  - cloud
  - AddCollectionField()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AddCollectionField()

Add a field to an existing collection.

```c++
Status AddCollectionField(const AddCollectionFieldRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = AddCollectionFieldRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithField(field_schema);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Set target db name, use default database if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Set name of the collection.

- `WithField(FieldSchema&& field_schema)`

    Set the field schema.

**RETURNS:**

*Status*

Returns a status indicating whether the operation succeeded.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

Demonstrates AddCollectionField() with the C++ SDK.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::AddCollectionFieldRequest();
util::CheckStatus(client->AddCollectionField(request));
```
