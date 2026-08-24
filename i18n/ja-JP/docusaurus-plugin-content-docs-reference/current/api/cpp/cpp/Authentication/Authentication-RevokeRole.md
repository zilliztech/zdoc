---
title: "RevokeRole() | Cloud"
slug: /cpp/cpp/Authentication-RevokeRole
sidebar_label: "RevokeRole()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ユーザーからロールを取り消します。 | Cloud"
type: docx
token: EyJ4d9M4joZE3WxIoIac1hTNnng
sidebar_position: 19
keywords: 
  - 類似検索
  - マルチモーダルRAG
  - LLM幻覚
  - ハイブリッド検索
  - zilliz
  - zilliz cloud
  - cloud
  - RevokeRole()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RevokeRole()

この操作は、ユーザーからロールを取り消します。

```c++
Status RevokeRole(const RevokeRoleRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = RevokeRoleRequest()
    .WithUserName(name)
    .WithRoleName(name);
```

**リクエストメソッド:**

- `WithUserName(const std::string& name)`

    この操作の対象となるユーザー名を設定します。

- `WithRoleName(const std::string& name)`

    取り消すロールの名前を設定します。

**戻り値:**

*Status*

`status.IsOk()` を確認して、成功したかどうかを判断します。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` と `status.Message()` を確認してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->RevokeRole(
    milvus::RevokeRoleRequest()
        .WithUserName(user_name)
        .WithRoleName(role_name)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
