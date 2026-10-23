---
title: "UpdatePassword() | Cloud"
slug: /cpp/cpp/Authentication-UpdatePassword
sidebar_label: "UpdatePassword()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はユーザーのパスワードを更新します。 | Cloud"
type: docx
token: Livud2dUIotCQbxD8SFc8oWwnGp
sidebar_position: 21
keywords: 
  - Milvus ベクトルデータベース
  - Milvus DB
  - Milvus ベクトル DB
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

この操作はユーザーのパスワードを更新します。

```c++
Status UpdatePassword(const UpdatePasswordRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = UpdatePasswordRequest()
    .WithUserName(name)
    .WithOldPassword(password1)
    .WithNewPassword(password2)
    .WithDescription(description)
    .WithResetConnection(reset_connection);
```

**リクエストメソッド：**

- `WithUserName(const std::string& name)`

    ユーザーの名前を設定します。

- `WithOldPassword(const std::string& password)`

    ユーザーのパスワードを設定します。

- `WithNewPassword(const std::string& password)`

    ユーザーの新しいパスワードを設定します。

- `WithDescription(const std::string& description)`

    ユーザーの説明を設定します。

- `WithResetConnection(bool reset_connection)`

    パスワードの更新後にクライアント接続をリセットするかどうかを指定します。パスワードは、再接続を試行する前にサーバーで更新されます。再接続に失敗した場合、返される Status は、パスワードが更新されたものの、新しい認証情報を使用して接続を手動で再確立する必要があることを報告します。

**戻り値：**

*Status*

成功したことを確認するには、`status.IsOk()` を確認してください。

**例外：**

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
