---
title: "removePrivilegesFromGroup() | Java | v2"
slug: /java/java/v2-Authentication-removePrivilegesFromGroup
sidebar_label: "removePrivilegesFromGroup()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定の権限グループから権限を削除します。 | Java | v2"
type: docx
token: PsIEd5UbFoIHIzxkXyCcgKwXnoe
sidebar_position: 16
keywords: 
  - ベクトル埋め込みとは
  - ベクトルデータベースのチュートリアル
  - ベクトルデータベースの仕組み
  - ベクトルデータベースの比較
  - zilliz
  - zilliz cloud
  - クラウド
  - removePrivilegesFromGroup()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# removePrivilegesFromGroup()

この操作は、特定の権限グループから権限を削除します。

```java
public Void removePrivilegesFromGroup(RemovePrivilegesFromGroupReq request)
```

## リクエスト構文\{#request-syntax}

```java
removePrivilegesFromGroup(RemovePrivilegesFromGroupReq.builder()
    .groupName(String groupName)
    .privileges(List<String> privileges)
    .build()
)
```

**ビルダーメソッド:**

- `groupName(String groupName)`

    対象の権限グループの名前です。

- `privileges(List<String> privileges)`

    指定した権限グループから削除する権限です。使用可能な権限の詳細については、Grant Privileges or Privilege Group to Roles を参照してください。

**例外:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.RemovePrivilegesFromGroupReq;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Remove privileges from a group
List<String> privileges = new ArrayList<>();
privileges.add("Query");
privileges.add("Search");

RemovePrivilegesFromGroupReq removePrivilegesFromGroupReq = RemovePrivilegesFromGroupReq.builder()
        .groupName("read_only")
        .privileges(privileges)
        .build();
        
client.removePrivilegesFromGroup(removePrivilegesFromGroupReq);
```
