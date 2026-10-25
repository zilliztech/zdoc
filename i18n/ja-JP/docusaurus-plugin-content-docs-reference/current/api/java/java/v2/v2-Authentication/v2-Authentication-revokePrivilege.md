---
title: "revokePrivilege() | Java | v2"
slug: /java/java/v2-Authentication-revokePrivilege
sidebar_label: "revokePrivilege()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ロールにすでに割り当てられている権限を取り消します。 | Java | v2"
type: docx
token: SOiMdD68wohoLqxFmltc6vwDnTf
sidebar_position: 17
keywords: 
  - 最近傍検索
  - Agentic RAG
  - RAG LLM アーキテクチャ
  - プライベート LLM
  - zilliz
  - zilliz cloud
  - cloud
  - revokePrivilege()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# revokePrivilege()

この操作は、ロールにすでに割り当てられている権限を取り消します。

```java
public void revokePrivilege(RevokePrivilegeReq request)
```

## リクエスト構文\{#request-syntax}

```java
revokePrivilege(RevokePrivilegeReq.builder()
    .dbName(String databaseName)
    .roleName(String roleName)
    .objectType(String objectType)
    .privilege(String privilege)
    .objectName(String objectName)
    .build()
)
```

**ビルダーメソッド：**

- `dbName(String databaseName)`

    データベースの名前です。

    このパラメーターはオプションです。このパラメーターを設定すると、権限の取り消しが指定したデータベース内に制限されます。

- `objectName(String objectName)`

    アクセスを制御するオブジェクトの名前です。たとえば、オブジェクトタイプが **コレクション** の場合、オブジェクト名はコレクションの名前です。オブジェクトタイプが **User** の場合、オブジェクト名はデータベースユーザーの名前です。

    **object_type** が **Global** に設定されている場合は、**object_name** をワイルドカード（**&ast;**）に設定し、指定したタイプのすべてのオブジェクトを示します。詳細については、Users and Roles ページの表の Relevant API 列を参照してください。

- `objectType(String objectType)`

    権限の取り消し対象となるオブジェクトのタイプです。

    指定可能な値：

    - **Global**: システム全体のオブジェクトです。ユーザーは、すべてのコレクション、ユーザー、またはシステム全体の設定に影響するアクションを実行できます。**object_type** が **Global** に設定されている場合は、**object_name** をワイルドカード（**&ast;**）に設定し、指定したタイプのすべてのオブジェクトを示します。

    - **コレクション**: コレクション固有のオブジェクトです。ユーザーは、特定のコレクション内でインデックスの作成、データの読み込み、データの挿入や削除、データのクエリなどのアクションを実行できます。

    - **User**: ユーザー管理に関連するオブジェクトです。ユーザーは、データベースユーザーの認証情報やロールを管理できます。たとえば、ユーザーの認証情報の更新やユーザー詳細の表示などです。

- `privilege(String privilege)`

    割り当てる権限の名前です。

    詳細については、Users and Roles ページの表の **Privilege name** 列を参照してください。

- `roleName(String roleName)`

    権限を取り消すロールの名前です。

**例外：**

- **MilvusClientExceptions**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.RevokePrivilegeReq;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Revoke a privilege
RevokePrivilegeReq revokePrivilegeReq = RevokePrivilegeReq.builder()
        .roleName("db_rw")
        .privilege("DescribeCollection")
        .objectName("*")
        .objectType("Global")
        .build();
client.revokePrivilege(revokePrivilegeReq);
```
