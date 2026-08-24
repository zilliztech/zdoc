---
title: "AlterRole() | Cloud"
slug: /cpp/cpp/Authentication-AlterRole
sidebar_label: "AlterRole()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "既存のロールの説明を変更します。 | Cloud"
type: docx
token: HkRQd5kF5om421xNwSmcoaz3nxb
sidebar_position: 2
keywords: 
  - milvus ベクトル データベース
  - milvus db
  - milvus ベクトル db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - AlterRole()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterRole()

既存のロールの説明を変更します。

```c++
Status AlterRole(const AlterRoleRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = AlterRoleRequest()
    .WithRoleName(role_name)
    .WithDescription(description);
```

**リクエストメソッド:**

- `WithRoleName(const std::string& role_name)`

    MilvusClientV2::AlterRole() で使用されます。

- `WithDescription(const std::string& description)`

**戻り値:**

*Status*

操作の成否を示すステータスを返します。

**エラーハンドリング:**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK を使用した AlterRole() の実行例です。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::AlterRoleRequest();
util::CheckStatus(client->AlterRole(request));
```
