---
title: "revokePrivilegeV2() | Java | v2"
slug: /java/java/v2-Authentication-revokePrivilegeV2
sidebar_label: "revokePrivilegeV2()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定のロールから権限または権限グループを取り消します。 | Java | v2"
type: docx
token: Ai9jdBRUdoOaD4xOrtAcrwj2nEe
sidebar_position: 18
keywords: 
  - 自然言語検索
  - 類似性検索
  - マルチモーダル RAG
  - LLM ハルシネーション
  - zilliz
  - zilliz cloud
  - クラウド
  - revokePrivilegeV2()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# revokePrivilegeV2()

この操作は、特定のロールから権限または権限グループを取り消します。

```java
public Void revokePrivilegeV2(RevokePrivilegeReqV2 request)
```

## リクエスト構文\{#request-syntax}

```java
revokePrivilegeV2(RevokePrivilegeReqV2.builder()
    .roleName(String roleName)
    .privilege(String privilege)
    .dbName(String dbName)
    .collectionName(String collectionName)
    .build()
)
```

**ビルダーメソッド:**

- `roleName(String roleName)`

    対象ロールの名前です。

- `privilege(String privilege)`

    指定したロールから取り消す権限または権限グループです。使用可能な権限の詳細については、Grant Privileges or Privilege Group to Roles を参照してください。

- `dbName(String dbName)`

    対象リソースのデータベースです。この操作の後、指定したロールは、指定したデータベース内で指定した権限へのアクセスを失います。

- `collectionName(String collectionName)`

    指定したデータベース内の対象リソースのコレクションです。この操作の後、指定したロールは、指定したコレクション内で指定した権限へのアクセスを失います。

**例外:**

- **MilvusClientExceptions**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.RevokePrivilegeReqV2;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Revoke privilege or privilege group
RevokePrivilegeReqV2 revokePrivilegeReqV2 = RevokePrivilegeReqV2.builder()
    .roleName("my_role")
    .privilege("read_only")
    .dbName("my_db")
    .collectionName("my_collection")
    .build();

client.revokePrivilegeV2(revokePrivilegeReqV2);
```
