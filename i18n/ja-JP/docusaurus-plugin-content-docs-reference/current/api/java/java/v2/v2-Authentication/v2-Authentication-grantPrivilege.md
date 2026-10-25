---
title: "grantPrivilege() | Java | v2"
slug: /java/java/v2-Authentication-grantPrivilege
sidebar_label: "grantPrivilege()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ロールに権限を付与します。 | Java | v2"
type: docx
token: LcitdP8NuoIahexCUMQcOgg2nYg
sidebar_position: 10
keywords: 
  - 画像類似検索
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - grantPrivilege()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# grantPrivilege()

この操作は、ロールに権限を付与します。

```java
public void grantPrivilege(GrantPrivilegeReq request)
```

## リクエスト構文\{#request-syntax}

```java
grantPrivilege(GrantPrivilegeReq.builder()
    .roleName(String roleName)
    .dbName(String dbName)
    .objectType(String objectType)
    .privilege(String privilege)
    .objectName(String objectName)
    .build()
)
```

**ビルダーメソッド:**

- `roleName(String roleName)`

    権限を付与するロールの名前です。

- `dbName(String dbName)`

    権限を適用するデータベースの名前です。省略時は現在のデータベースがデフォルトになります。

- `objectType(String objectType)`

    権限を付与する対象オブジェクトのタイプです。

    指定可能な値:

    - **Global**: システム全体のオブジェクトです。ユーザーは、すべてのコレクション、ユーザー、またはシステム全体の設定に影響する操作を実行できます。**objectType** を **Global** に設定する場合は、**objectName** をワイルドカード（**&ast;**）に設定し、指定したタイプのすべてのオブジェクトを示します。

    - **コレクション**: コレクション固有のオブジェクトです。ユーザーは、特定のコレクション内でインデックスの作成、データのロード、データの挿入または削除、データのクエリなどの操作を実行できます。

    - **User**: ユーザー管理に関連するオブジェクトです。ユーザーは、ユーザー認証情報の更新やユーザー詳細の表示など、データベースユーザーの認証情報とロールを管理できます。

- `privilege(String privilege)`

    付与する権限の名前です。

    詳細については、[Manage クラスター Roles(SDK)](/docs/cluster-roles-sdk) ページの表にある **Privilege name** 列を参照してください。

- `objectName(String objectName)`

    アクセスを制御するオブジェクトの名前です。たとえば、オブジェクトタイプが **コレクション** の場合、オブジェクト名はコレクションの名前です。オブジェクトタイプが **User** の場合、オブジェクト名はデータベースユーザーの名前です。

    **object_type** を **Global** に設定する場合は、**object_name** をワイルドカード（**&ast;**）に設定し、指定したタイプのすべてのオブジェクトを示します。詳細については、[Manage クラスター Roles(SDK)](/docs/cluster-roles-sdk) ページの表にある Relevant API 列を参照してください。

**例外:**

- **MilvusClientExceptions**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.GrantPrivilegeReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Grant privileges
GrantPrivilegeReq grantPrivilegeReq = GrantPrivilegeReq.builder()
        .roleName("db_rw")
        .objectType("User")
        .objectName("user_1")
        .privilege("SelectUser")
        .build();
client.grantPrivilege(grantPrivilegeReq);
```
