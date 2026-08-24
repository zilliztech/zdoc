---
title: "DropRole() | Cloud"
slug: /cpp/cpp/Authentication-DropRole
sidebar_label: "DropRole()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はロールを削除します。 | Cloud"
type: docx
token: QRNudMVJXoG1flxBkEocI2pynef
sidebar_position: 9
keywords: 
  - Dense ベクトル
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - DropRole()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropRole()

この操作はロールを削除します。

```c++
Status DropRole(const DropRoleRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropRoleRequest()
    .WithRoleName(name)
    .WithForceDrop(force_drop);
```

**リクエストメソッド:**

- `WithRoleName(const std::string& name)`

    ロール名を設定します。

- `WithForceDrop(bool force_drop)`

    ロールを強制削除するかどうかのフラグを設定します。

**戻り値:**

*Status*

`status.IsOk()` を確認して、成功したかどうかを判定します。

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

status = client->DropRole(
    milvus::DropRoleRequest()
        .WithRoleName(role_name)
        .WithForceDrop(false)
);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
