---
title: "GrantPrivilegeV2() | Cloud"
slug: /cpp/cpp/Authentication-GrantPrivilegeV2
sidebar_label: "GrantPrivilegeV2()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ロールに権限または権限グループを付与します。 | Cloud"
type: docx
token: RkNpdn17xopIkwxeBxYcmQj0nFg
sidebar_position: 11
keywords: 
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - zilliz
  - zilliz cloud
  - cloud
  - GrantPrivilegeV2()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GrantPrivilegeV2()

この操作は、ロールに権限または権限グループを付与します。

```c++
Status GrantPrivilegeV2(const GrantPrivilegeV2Request& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = GrantPrivilegeV2Request()
    .WithRoleName(name)
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPrivilege(privilege);
```

**リクエストメソッド:**

- `WithRoleName(const std::string& name)`

    ロール名を設定します。

- `WithDatabaseName(const std::string& db_name)`

    ロールの対象となるデータベース名を設定します。

- `WithCollectionName(const std::string& collection_name)`

    ロールの対象となるコレクション名を設定します。

- `WithPrivilege(const std::string& privilege)`

    ロールに割り当てる権限名を設定します。利用可能な権限については、[このページ](https://milvus.io/docs/grant_privileges.md)を参照してください。

**戻り値:**

*Status*

`status.IsOk()` を確認し、成功したかどうかを判断します。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` および `status.Message()` を確認してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->GrantPrivilegeV2(
    milvus::GrantPrivilegeV2Request()
        .WithRoleName(role_name)
        .WithPrivilege(privilege_group_name)
        .WithCollectionName(collection_name)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
