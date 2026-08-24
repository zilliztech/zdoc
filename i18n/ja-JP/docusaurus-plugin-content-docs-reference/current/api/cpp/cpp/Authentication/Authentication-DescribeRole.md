---
title: "DescribeRole() | Cloud"
slug: /cpp/cpp/Authentication-DescribeRole
sidebar_label: "DescribeRole()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ロールの詳細情報を取得します。 | Cloud"
type: docx
token: U8KCdu2BRohC5CxZK7vch6TGnrc
sidebar_position: 6
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeRole()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DescribeRole()

ロールの詳細情報を取得します。

```c++
Status DescribeRole(const DescribeRoleRequest& request, DescribeRoleResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DescribeRoleRequest()
    .WithRoleName(name)
    .WithDatabaseName(db_name);
```

**リクエスト メソッド:**

- `WithRoleName(const std::string& name)`

    ロール名を設定します。

- `WithDatabaseName(const std::string& db_name)`

    ロールが割り当てられているデータベース名を設定します。

**戻り値:**

*Status*

操作の成否を示すステータスを返します。

**エラー処理:**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返されたステータスを確認してください。

## 例\{#example}

C++ SDK を使用した DescribeRole() の使用例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::DescribeRoleRequest();
milvus::DescribeRoleResponse response;
util::CheckStatus(client->DescribeRole(request, response));
```
