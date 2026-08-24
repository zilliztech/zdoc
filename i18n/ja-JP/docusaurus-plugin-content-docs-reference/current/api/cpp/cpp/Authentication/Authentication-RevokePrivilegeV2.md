---
title: "RevokePrivilegeV2() | Cloud"
slug: /cpp/cpp/Authentication-RevokePrivilegeV2
sidebar_label: "RevokePrivilegeV2()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ロールから権限または権限グループを取り消します。 | Cloud"
type: docx
token: RC3FdSxLbov3uixeCBlcWud8nCd
sidebar_position: 18
keywords: 
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - RevokePrivilegeV2()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RevokePrivilegeV2()

この操作は、ロールから権限または権限グループを取り消します。

```c++
Status RevokePrivilegeV2(const RevokePrivilegeV2Request& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = RevokePrivilegeV2Request()
    .WithRoleName(name)
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPrivilege(privilege);
```

**リクエストメソッド:**

- `WithRoleName(const std::string& name)`

    ロール名を設定します。

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。

- `WithCollectionName(const std::string& collection_name)`

    対象のコレクション名を設定します。

- `WithPrivilege(const std::string& privilege)`

    権限名を設定します。利用可能な権限については、[このページ](https://milvus.io/docs/grant_privileges.md)を参照してください。

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

status = client->RevokePrivilegeV2(milvus::RevokePrivilegeV2Request()
                                       .WithRoleName(role_name)
                                       .WithPrivilege(privilege_group_name)
                                       .WithCollectionName(collection_name));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
