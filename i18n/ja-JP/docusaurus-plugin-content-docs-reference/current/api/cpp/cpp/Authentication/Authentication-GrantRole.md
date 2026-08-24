---
title: "GrantRole() | Cloud"
slug: /cpp/cpp/Authentication-GrantRole
sidebar_label: "GrantRole()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "ユーザーにロールを付与する操作です。 | Cloud"
type: docx
token: HTwuddpIBoOKoMxhde4c9BMHnwd
sidebar_position: 12
keywords: 
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
  - zilliz
  - zilliz cloud
  - cloud
  - GrantRole()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GrantRole()

この操作は、ユーザーにロールを付与します。

```c++
Status GrantRole(const GrantRoleRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = GrantRoleRequest()
    .WithUserName(name)
    .WithRoleName(name);
```

**リクエスト メソッド:**

- `WithUserName(const std::string& name)`

    この操作の対象となるユーザー名を設定します。

- `WithRoleName(const std::string& name)`

    付与するロール名を設定します。

**戻り値:**

*Status*

`status.IsOk()` を確認し、処理の成否を判定します。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` および `status.Message()` を参照してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->GrantRole(
    milvus::GrantRoleRequest()
        .WithUserName(user_name)
        .WithRoleName(role_name)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
