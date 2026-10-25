---
title: "DescribeRole() | Cloud"
slug: /cpp/cpp/Authentication-DescribeRole
sidebar_label: "DescribeRole()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定したロールの詳細情報を提供します。 | Cloud"
type: docx
token: U8KCdu2BRohC5CxZK7vch6TGnrc
sidebar_position: 6
keywords: 
  - AI ハルシネーション
  - AI エージェント
  - セマンティック検索
  - 異常検知
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeRole()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# DescribeRole()

この操作は、指定したロールの詳細情報を提供します。

```c++
Status DescribeRole(const DescribeRoleRequest& request, DescribeRoleResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DescribeRoleRequest()
    .WithRoleName(name)
    .WithDatabaseName(db_name);
```

**リクエストメソッド:**

- `WithRoleName(const std::string& name)`

    詳細を取得するロールの名前を設定します。

- `WithDatabaseName(const std::string& db_name)`

    ロールのスコープとなるデータベース名を設定します。任意です。

**戻り値:**

*Status*

操作が成功したかどうかを示すステータスを返します。

- **response** (*DescribeRoleResponse*) -

    - **Desc** (*const RoleDesc&*) -

        ロールの説明を取得します。

        - **Name** (*const std::string&*) -

            ロールの名前を取得します。

        - **Description** (*const std::string&*) -

            ロールの説明を取得します。

        - **GrantItems** (*const std::ベクトル&lt;GrantItem&gt;&*) -

            ロールの特権項目を取得します。

            - **object_type_** (*std::string*) -

                特権のタイプ。

            - **object_name_** (*std::string*) -

                特権の名前。

            - **db_name_** (*std::string*) -

                有効となるデータベース。

            - **role_name_** (*std::string*) -

                付与先のロール。

            - **privilege_** (*std::string*) -

                特権。

            - **grantor_name_** (*std::string*) -

                付与者の名前。

**エラー処理:**

- **std::exception**

    リクエストの構築、転送、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

MilvusClientV2 に接続した後、&lt;role_name&gt; という名前のロールの詳細を取得します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DescribeRoleRequest()
    .WithRoleName(name)
    .WithDatabaseName(db_name);
status = client->DescribeRole(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
