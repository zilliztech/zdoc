---
title: "revokePrivilegeV2() | Java | v2"
slug: /java/java/v2-Authentication-revokePrivilegeV2
sidebar_label: "revokePrivilegeV2()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のロールから権限または権限グループを取り消します。 | Java | v2"
type: docx
token: FZN8dtlIRoMSGBxF7b1cWX48n0b
sidebar_position: 18
keywords: 
  - 自然言語検索
  - 類似性検索
  - マルチモーダルRAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
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

    対象ロールの名前。

- `privilege(String privilege)`

    指定されたロールから取り消す権限または権限グループ。利用可能な権限の詳細については、[権限](/docs/cluster-privileges) を参照してください。

- `dbName(String dbName)`

    対象リソースのデータベース。この操作の後、指定されたロールは、指定されたデータベース内で指定された権限へのアクセスを失います。

- `collectionName(String collectionName)`

    指定されたデータベース内の対象リソースのコレクション。この操作の後、指定されたロールは、指定されたコレクション内で指定された権限へのアクセスを失います。

**戻り値:**

*void*

**例外:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.RevokePrivilegeReqV2;

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
    .build()
        
client.revokePrivilegeV2(revokePrivilegeReqV2);
```

