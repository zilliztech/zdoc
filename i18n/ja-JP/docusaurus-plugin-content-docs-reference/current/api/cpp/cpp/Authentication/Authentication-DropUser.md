---
title: "DropUser() | Cloud"
slug: /cpp/cpp/Authentication-DropUser
sidebar_label: "DropUser()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "ユーザーを削除する操作です。 | Cloud"
type: docx
token: FtGndkY80oH1PNx04hvclmVCnDg
sidebar_position: 10
keywords: 
  - スパースベクトル
  - ベクトル次元
  - ANN検索
  - ベクトル埋め込みとは
  - zilliz
  - zilliz cloud
  - cloud
  - DropUser()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropUser()

この操作はユーザーを削除します。

```c++
Status DropUser(const DropUserRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropUserRequest()
    .WithUserName(name);
```

**リクエストメソッド:**

- `WithUserName(const std::string& name)`

    ユーザー名を設定します。

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

status = client->DropUser(
    milvus::DropUserRequest()
        .WithUserName(user_name)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
