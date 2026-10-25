---
title: "dropRole() | Java | v2"
slug: /java/java/v2-Authentication-dropRole
sidebar_label: "dropRole()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はカスタムロールを削除します。 | Java | v2"
type: docx
token: EzGSdmnVYoWJ0WxiglLcoxn2neb
sidebar_position: 8
keywords: 
  - nlp search
  - hallucinations llm
  - Multimodal search
  - ベクトル search algorithms
  - zilliz
  - zilliz cloud
  - cloud
  - dropRole()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropRole()

この操作はカスタムロールを削除します。

```java
public void dropRole(DropRoleReq request)
```

## リクエスト構文\{#request-syntax}

```java
dropRole(DropRoleReq.builder()
    .roleName(String roleName)
    .build()
)
```

**ビルダーメソッド:**

- `roleName(String roleName)`

    削除するロールの名前。

- `forceDrop(boolean forceDrop)`

    *void*

**例外:**

- **MilvusClientExceptions**

    この操作の実行中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.DropRoleReq;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop a role
DropRoleReq dropRoleReq = DropRoleReq.builder()
        .roleName("test")
        .build();
client.dropRole(dropRoleReq);
```
