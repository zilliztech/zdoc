---
title: "DescribeUser() | Cloud"
slug: /cpp/cpp/Authentication-DescribeUser
sidebar_label: "DescribeUser()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ユーザーの情報を取得します。 | Cloud"
type: docx
token: WqOudbitToLoSRx9faGctun6nlf
sidebar_position: 7
keywords: 
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
  - マルチモーダルベクトルデータベース検索
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeUser()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DescribeUser()

ユーザーの情報を取得します。

```c++
Status DescribeUser(const DescribeUserRequest& request, DescribeUserResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DescribeUserRequest()
    .WithUserName(name);
```

**リクエストメソッド:**

- `WithUserName(const std::string& name)`

    ユーザー名を指定します。

**戻り値:**

*Status*

操作が成功したかどうかを示すステータスを返します。

**エラーハンドリング:**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK を使用した DescribeUser() の使用例です。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::DescribeUserRequest();
milvus::DescribeUserResponse response;
util::CheckStatus(client->DescribeUser(request, response));
```
