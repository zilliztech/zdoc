---
title: "CreateUser() | Cloud"
slug: /cpp/cpp/Authentication-CreateUser
sidebar_label: "CreateUser()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ユーザー名とパスワードを指定して、Milvus にログインするユーザーを作成します。 | Cloud"
type: docx
token: InqLdJ931o15yIxpt1bcfYFinAf
sidebar_position: 5
keywords: 
  - What is unstructured data
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースのベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - CreateUser()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreateUser()

ユーザー名とパスワードを指定して、Milvus にログインするユーザーを作成します。

```c++
Status CreateUser(const CreateUserRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = CreateUserRequest()
    .WithUserName(name)
    .WithPassword(password)
    .WithDescription(description);
```

**リクエスト メソッド:**

- `WithUserName(const std::string& name)`

    ユーザー名を設定します。

- `WithPassword(const std::string& password)`

    ユーザーのパスワードを設定します。

- `WithDescription(const std::string& description)`

    ユーザーの説明を設定します。

**戻り値:**

*Status*

操作が成功したかどうかを示すステータスを返します。

**エラー処理:**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK で CreateUser() を使用する例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::CreateUserRequest();
util::CheckStatus(client->CreateUser(request));
```
