---
title: "DescribeUser() | Cloud"
slug: /cpp/cpp/Authentication-DescribeUser
sidebar_label: "DescribeUser()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、指定したユーザーの詳細（付与されているロールを含む）を取得します。 | Cloud"
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

この操作では、指定したユーザーの詳細（付与されているロールを含む）を取得します。

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

    詳細を取得するユーザーの名前を設定します。

**戻り値:**

*Status*

操作が成功したかどうかを示すステータスを返します。

- **response** (*DescribeUserResponse*) -

    - **Desc** (*const UserDesc&*) -

        ユーザーの説明を取得します。

        - **Name** (*const std::string&*) -

            ユーザーの名前を取得します。

        - **Description** (*const std::string&*) -

            ユーザーの説明を取得します。

        - **Roles** (*const std::ベクトル&lt;std::string&gt;&*) -

            ユーザーのロール名を取得します。

**エラーハンドリング:**

- **std::exception**

    リクエストの構築、転送、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

次の例では、DescribeUser() を使用してユーザーの詳細を取得する方法を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DescribeUserRequest()
    .WithUserName(name);
status = client->DescribeUser(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
