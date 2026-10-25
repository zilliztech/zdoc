---
title: "dropPrivilegeGroup() | Java | v2"
slug: /java/java/v2-Authentication-dropPrivilegeGroup
sidebar_label: "dropPrivilegeGroup()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、権限グループを作成します。 | Java | v2"
type: docx
token: CPCydbcK5oiXF4xm20ycwXu5nSh
sidebar_position: 7
keywords: 
  - 画像類似性検索
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似性検索
  - zilliz
  - zilliz cloud
  - cloud
  - dropPrivilegeGroup()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropPrivilegeGroup()

この操作では、権限グループを作成します。

```java
public Void dropPrivilegeGroup(DropPrivilegeGroupReq request)
```

## リクエスト構文\{#request-syntax}

```java
dropPrivilegeGroup(DropPrivilegeGroupReq.builder()
    .groupName(String groupName)
    .build()
)
```

**ビルダーメソッド:**

- `groupName(String groupName)`

    削除する権限グループの名前です。

**例外:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.DropPrivilegeGroupReq;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop a privilege group
DropPrivilegeGroupReq dropPrivilegeGroupReq = DropPrivilegeGroupReq.builder()
        .groupName("read_only")
        .build();
        
client.dropPrivilegeGroup(dropPrivilegeGroupReq);
```
