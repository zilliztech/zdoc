---
title: "AliasDesc | Cloud"
slug: /cpp/cpp/Collections-AliasDesc
sidebar_label: "AliasDesc"
beta: false
added_since: v2.6.1
last_modified: false
deprecate_since: false
notebook: false
description: "此类表示 Collection 别名的元数据。通过调用 `Desc()` 对象的 `DescribeAliasResponse` 方法返回。 | Cloud"
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

此类表示 Collection 别名的元数据。通过调用 `Desc()` 对象的 `DescribeAliasResponse` 方法返回。

```c++
AliasDesc();
AliasDesc(std::string alias_name, std::string db_name, std::string collection_name);
```

**方法：**

- `const std::string& Name() const`

    别名名称。

- `const std::string& DatabaseName() const`

    该别名所属 Database 的名称。

- `const std::string& CollectionName() const`

    该别名指向的 Collection 名称。

## 示例\{#example}

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
