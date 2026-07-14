---
title: "grantPrivilegeV2() | Java | v2"
slug: /java/java/v2-Authentication-grantPrivilegeV2
sidebar_label: "grantPrivilegeV2()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のロールに権限または権限グループを付与します。 | Java | v2"
type: docx
token: MFv3drbbXouqVxxE1OicBBl5ndf
sidebar_position: 11
keywords: 
  - ベクトルデータベース
  - IVF
  - knn
  - 画像検索
  - zilliz
  - zilliz cloud
  - クラウド
  - grantPrivilegeV2()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# grantPrivilegeV2()

この操作は、特定のロールに権限または権限グループを付与します。

```java
public Void grantPrivilegeV2(GrantPrivilegeReqV2 request)
```

## リクエスト構文\{#request-syntax}

```java
grantPrivilegeV2(GrantPrivilegeReqV2.builder()
    .roleName(String roleName)
    .privilege(String privilege)
    .dbName(String dbName)
    .collectionName(String collectionName)
    .build()
)
```

**BUILDER メソッド:**

- `roleName(String roleName)`

    対象ロールの名前です。

- `privilege(String privilege)`

    指定したロールに付与する権限または権限グループです。使用可能な権限の詳細については、[Privileges](/docs/cluster-privileges) を参照してください。

- `dbName(String dbName)`

    対象リソースのデータベースです。指定したロールは、指定したデータベース内で指定した権限にアクセスできます。

- `collectionName(String collectionName)`

    指定したデータベース内の対象リソースコレクションです。指定したロールは、指定したコレクション内で指定した権限にアクセスできます。

**戻り値:**

*void*

**例外:**

- **MilvusClientExceptions**

    この例外は、この操作の実行中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.GrantPrivilegeReqV2;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Grant privilege or privilege group
GrantPrivilegeReqV2 grantPrivilegeReqV2 = GrantPrivilegeReqV2.builder()
    .roleName("my_role")
    .privilege("Search")
    .dbName("my_db")
    .collectionName("my_collection")
    .build()
        
client.grantPrivilegeV2(grantPrivilegeReqV2);
```

