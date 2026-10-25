---
title: "addPrivilegesToGroup() | Java | v2"
slug: /java/java/v2-Authentication-addPrivilegesToGroup
sidebar_label: "addPrivilegesToGroup()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定の権限グループに権限を追加します。 | Java | v2"
type: docx
token: Zk2sduIEOoytTDxSFy0cUxiinpg
sidebar_position: 1
keywords: 
  - Zilliz
  - Milvus ベクトルデータベース
  - Milvus データベース
  - Milvus ベクトルデータベース
  - zilliz
  - Zilliz Cloud
  - クラウド
  - addPrivilegesToGroup()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# addPrivilegesToGroup()

この操作は、特定の権限グループに権限を追加します。

```java
public Void addPrivilegesToGroup(AddPrivilegesToGroupReq request)
```

## リクエスト構文\{#request-syntax}

```java
addPrivilegesToGroup(AddPrivilegesToGroupReq.builder()
    .groupName(String groupName)
    .privileges(List<String> privileges)
    .build()
)
```

**ビルダーメソッド:**

- `groupName(String groupName)`

    対象の権限グループの名前です。

- `privileges(List<String> privileges)`

    指定した権限グループに追加する権限です。使用可能な権限の詳細については、[クラスターロールの管理（SDK）](/docs/cluster-roles-sdk) を参照してください。

**例外:**

- **MilvusClientExceptions**

    この例外は、この操作の実行中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.AddPrivilegesToGroupReq;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. add privileges to group
List<String> privileges = new ArrayList<>();
privileges.add("Query");
privileges.add("Search");

AddPrivilegesToGroupReq addPrivilegesToGroupReq = AddPrivilegesToGroupReq.builder()
        .groupName("read_only")
        .privileges(privileges)
        .build();
        
client.addPrivilegesToGroup(addPrivilegesToGroupReq);
```
