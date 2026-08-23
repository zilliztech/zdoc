---
title: "AliasDesc | Cloud"
slug: /cpp/cpp/Collections-AliasDesc
sidebar_label: "AliasDesc"
beta: false
added_since: v2.6.1
last_modified: false
deprecate_since: false
notebook: false
description: "This class represents the metadata of a collection alias. It is returned by calling `Desc()` on a `DescribeAliasResponse` object. | Cloud"
type: docx
token: Rt1adnttKolmjfxwFc1cgf01nff
sidebar_position: 3
keywords: 
  - Image Search
  - LLMs
  - Machine Learning
  - RAG
  - zilliz
  - zilliz cloud
  - cloud
  - AliasDesc
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AliasDesc

This class represents the metadata of a collection alias. It is returned by calling `Desc()` on a `DescribeAliasResponse` object.

```c++
AliasDesc();
AliasDesc(std::string alias_name, std::string db_name, std::string collection_name);
```

**METHODS:**

- `const std::string& Name() const`

    Name of the alias.

- `const std::string& DatabaseName() const`

    Name of the database the alias belongs to.

- `const std::string& CollectionName() const`

    Name of the collection this alias points to.

## Example\{#example}

```c++
#include <milvus/MilvusClientV2.h>
using namespace milvus;

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));

DescribeAliasResponse response;
auto status = client->DescribeAlias(
    DescribeAliasRequest()
        .WithAlias("my_alias"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

const AliasDesc& desc = response.Desc();
std::cout << "Alias:      " << desc.Name() << "\n"
          << "Collection: " << desc.CollectionName() << "\n"
          << "Database:   " << desc.DatabaseName() << "\n";
```
