---
title: "grantRole() | Java | v2"
slug: /java/java/v2-Authentication-grantRole
sidebar_label: "grantRole()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はユーザーにロールを付与します。 | Java | v2"
type: docx
token: JB90dbBNRoz1I2xZY5rcSmJ1nSb
sidebar_position: 12
keywords: 
  - オーディオ類似性検索
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - grantRole()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# grantRole()

この操作はユーザーにロールを付与します。

```java
public void grantRole(GrantRoleReq request)
```

## リクエスト構文\{#request-syntax}

```java
grantRole(GrantRoleReq.builder()
    .roleName(String roleName)
    .userName(String userName)
    .build()
)
```

**BUILDER メソッド:**

- `roleName(String roleName)`

    割り当てるロールの名前。

- `userName(String userName)`

    既存ユーザーの名前。

**戻り値:**

*void*

**例外:**

- **MilvusClientExceptions**

    この操作の実行中にエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.GrantRoleReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Grant role to a user
GrantRoleReq grantRoleReq = GrantRoleReq.builder()
        .roleName("db_ro")
        .userName("test")
        .build();
client.grantRole(grantRoleReq);
```

