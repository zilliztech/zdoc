---
title: "UpdateUser() | Cloud"
slug: /cpp/cpp/Authentication-UpdateUser
sidebar_label: "UpdateUser()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "ユーザーのパスワードを更新します。 | Cloud"
type: docx
token: XXBwdXvCWo1te0xWjifc19kUnjf
sidebar_position: 22
keywords: 
  - 自然言語処理データベース
  - 低コストベクトルデータベース
  - マネージドベクトルデータベース
  - Pineconeベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - UpdateUser()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# UpdateUser()

ユーザーのパスワードを更新します。

```c++
Status UpdateUser(const UpdateUserRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = UpdateUserRequest()
    .WithUserName(user_name)
    .WithDescription(description);
```

**リクエストメソッド:**

- `WithUserName(const std::string& user_name)`

    MilvusClientV2::UpdateUser() で使用されます。

- `WithDescription(const std::string& description)`

**戻り値:**

*Status*

操作の成否を示すステータスを返します。

**エラーハンドリング:**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK を使用した UpdateUser() の使用例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::UpdateUserRequest();
util::CheckStatus(client->UpdateUser(request));
```
