---
title: "createPrivilegeGroup() | Java | v2"
slug: /java/java/v2-Authentication-createPrivilegeGroup
sidebar_label: "createPrivilegeGroup()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、権限グループを作成します。 | Java | v2"
type: docx
token: VDGtd5FmbobsfdxpGCZcQQlwnHf
sidebar_position: 2
keywords: 
  - ナレッジベース
  - 自然言語処理
  - AI チャットボット
  - コサイン距離
  - zilliz
  - Zilliz Cloud
  - クラウド
  - createPrivilegeGroup()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createPrivilegeGroup()

この操作では、権限グループを作成します。

```java
public Void createPrivilegeGroup(CreatePrivilegeGroupReq request)
```

## リクエスト構文\{#request-syntax}

```java
createPrivilegeGroup(CreatePrivilegeGroupReq.builder()
    .groupName(String groupName)
    .build()
)
```

**ビルダーメソッド：**

- `groupName(String groupName)`

    作成する権限グループの名前です。

**例外：**

- **MilvusClientExceptions**

    この操作中にエラーが発生した場合に、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.CreatePrivilegeGroupReq;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create a privilege group
CreatePrivilegeGroupReq createPrivilegeGroupReq = CreatePrivilegeGroupReq.builder()
        .groupName("read_only")
        .build();
        
client.createPrivilegeGroup(createPrivilegeGroupReq);
```
