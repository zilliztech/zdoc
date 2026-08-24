---
title: "UpdatePassword() | Cloud"
slug: /cpp/cpp/Authentication-UpdatePassword
sidebar_label: "UpdatePassword()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "ユーザーのパスワードを更新します。 | Cloud"
type: docx
token: BXaGduFMvolXlnxaIFkcKy3Nnhu
sidebar_position: 21
keywords: 
  - milvus ベクトル データベース
  - milvus db
  - milvus ベクトル db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - UpdatePassword()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# UpdatePassword()

ユーザーのパスワードを更新します。

```c++
Status UpdatePassword(const UpdatePasswordRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = UpdatePasswordRequest()
    .WithUserName(name)
    .WithOldPassword(password1)
    .WithNewPassword(password2);
```

**リクエスト メソッド:**

- `WithUserName(const std::string& name)`

    ユーザー名を設定します。

- `WithOldPassword(const std::string& password)`

    ユーザーの現在のパスワードを設定します。

- `WithNewPassword(const std::string& password)`

    ユーザーの新しいパスワードを設定します。

**戻り値:**

*Status*

`status.IsOk()` を確認し、処理の成否を判定します。

**例外:**

- **StatusCode**

    エラーの詳細は、`status.Code()` および `status.Message()` を参照してください。

## 使用例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->UpdatePassword(
    milvus::UpdatePasswordRequest()
        .WithUserName(user_name)
        .WithOldPassword("P@ssw0rd!")
        .WithNewPassword("P@ssw1rd#")
);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
