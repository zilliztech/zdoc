---
title: "GrantPrivilege() | Cloud"
slug: /cpp/cpp/Authentication-GrantPrivilege
sidebar_label: "GrantPrivilege()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のオブジェクトに対してロールに権限を付与します。 | Cloud"
type: docx
token: FPhDdyJa4oTIAxx6dHAcn9nynld
sidebar_position: 24
keywords: 
  - NLP
  - ニューラルネットワーク
  - ディープラーニング
  - ナレッジベース
  - zilliz
  - zilliz cloud
  - クラウド
  - GrantPrivilege()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GrantPrivilege()

この操作は、特定のオブジェクトに対してロールに権限を付与します。

```c++
Status GrantPrivilege(const GrantPrivilegeRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = GrantPrivilegeRequest()
    .WithRoleName(name)
    .WithObjectType(object_type)
    .WithObjectName(object_name)
    .WithPrivilege(privilege)
    .WithDatabaseName(db_name);
```

**リクエストメソッド:**

- `WithRoleName(const std::string& name)`

    ロールの名前を設定します。

- `WithObjectType(const std::string& object_type)`

    `Collection` や `Global` など、対象オブジェクトの種類を設定します。

- `WithObjectName(const std::string& object_name)`

    対象オブジェクトの名前を設定します。`*` を使用すると、指定した種類のすべてのオブジェクトに権限が適用されます。

- `WithPrivilege(const std::string& privilege)`

    付与する権限の名前を設定します。利用可能な権限については、[Available Privileges](/docs/cluster-privileges) を参照してください。

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合は、デフォルトのデータベースが適用されます。

**戻り値:**

*Status*

`status.IsOk()` を確認して、成功したことを確かめます。

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

status = client->GrantPrivilege(
    milvus::GrantPrivilegeRequest()
        .WithRoleName(role_name)
        .WithObjectType("Collection")
        .WithObjectName(collection_name)
        .WithPrivilege("Search")
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
