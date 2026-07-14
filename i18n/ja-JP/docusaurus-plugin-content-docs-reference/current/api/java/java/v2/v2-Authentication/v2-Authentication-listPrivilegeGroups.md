---
title: "listPrivilegeGroups() | Java | v2"
slug: /java/java/v2-Authentication-listPrivilegeGroups
sidebar_label: "listPrivilegeGroups()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はすべての権限グループを一覧表示します。 | Java | v2"
type: docx
token: TGsXduN5OoAjVyxZTvRc8HR2nse
sidebar_position: 13
keywords: 
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
  - zilliz
  - zilliz cloud
  - クラウド
  - listPrivilegeGroups()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listPrivilegeGroups()

この操作はすべての権限グループを一覧表示します。

```java
public ListPrivilegeGroupsResp listPrivilegeGroups(ListPrivilegeGroupsReq request)
```

## リクエスト構文\{#request-syntax}

```java
listPrivilegeGroups(ListPrivilegeGroupsReq.builder()
    .build()
)
```

**戻り値の型:**

*ListPrivilegeGroupsResp*

**戻り値:**

**ListPrivilegeGroupsResp** オブジェクトには以下のフィールドが含まれます。

- **privilegeGroups** (*List&lt;PrivilegeGroup&gt;*) -

    権限グループのリスト。各要素は **PrivilegeGroup** オブジェクトです。

    - **groupName** (String) -

        現在の権限グループの名前です。

    - **privileges** (List&lt;String&gt;) - 

        現在の権限グループに追加された権限です。

**例外:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.PrivilegeGroup;
import io.milvus.v2.service.rbac.request.ListPrivilegeGroupsReq;
import io.milvus.v2.service.rbac.response.ListPrivilegeGroupsResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List privilege groups
ListPrivilegeGroupsReq listPrivilegeGroupsReq = ListPrivilegeGroupsReq.builder()
        .build();
        
ListPrivilegeGroupsResp resp = client.listPrivilegeGroups(listPrivilegeGroupsReq);
List<PrivilegeGroup> groups = resp.getPrivilegeGroups();
for (PrivilegeGroup group : groups) {
    System.out.println(group.getGroupName() + group.getPrivileges());
}
```

