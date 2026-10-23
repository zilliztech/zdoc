---
title: "RevokePrivilege() | Cloud"
slug: /cpp/cpp/Authentication-RevokePrivilege
sidebar_label: "RevokePrivilege()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のオブジェクトに対してロールから権限を取り消します。 | Cloud"
type: docx
token: IA1jdFAQ7ooZj5xkQT8cz6H3ndb
sidebar_position: 25
keywords: 
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - LLM-as-a-judge
  - ハイブリッドベクトル検索
  - zilliz
  - zilliz cloud
  - cloud
  - RevokePrivilege()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RevokePrivilege()

この操作は、特定のオブジェクトに対してロールから権限を取り消します。

```c++
Status RevokePrivilege(const RevokePrivilegeRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = RevokePrivilegeRequest()
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

    対象オブジェクトの種類（`Collection`、`Global` など）を設定します。

- `WithObjectName(const std::string& object_name)`

    対象オブジェクトの名前を設定します。指定した種類のすべてのオブジェクトに権限を適用するには、`*` を使用します。

- `WithPrivilege(const std::string& privilege)`

    取り消す権限の名前を設定します。利用可能な権限については、[Available Privileges](/docs/cluster-privileges) を参照してください。

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合は、デフォルトのデータベースが適用されます。

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

status = client->RevokePrivilege(
    milvus::RevokePrivilegeRequest()
        .WithRoleName(role_name)
        .WithObjectType("Collection")
        .WithObjectName(collection_name)
        .WithPrivilege("Search")
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
