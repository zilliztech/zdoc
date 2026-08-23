---
title: "DescribeAlias() | Cloud"
slug: /cpp/cpp/Collections-DescribeAlias
sidebar_label: "DescribeAlias()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the description of an alias. | Cloud"
type: docx
token: WGXadLPOjobTmnxp0oacSo1znEf
sidebar_position: 17
keywords: 
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeAlias()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DescribeAlias()

This operation returns the description of an alias.

```c++
Status DescribeAlias(const DescribeAliasRequest& request, DescribeAliasResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DescribeAliasRequest()
    .WithDatabaseName(db_name)
    .WithAlias(alias);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithAlias(const std::string& alias)`

    Sets the name of the alias.

**RETURNS:**

*Status* with *DescribeAliasResponse*

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

milvus::DescribeAliasResponse response;
status = client->DescribeAlias(
    milvus::DescribeAliasRequest()
        .WithAlias("my_alias"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Alias: " << response.Alias()
          << ", Collection: " << response.Collection() << std::endl;
```
