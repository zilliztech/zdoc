---
title: "addPrivilegesToGroup() | Java | v2"
slug: /java/java/v2-Authentication-addPrivilegesToGroup
sidebar_label: "addPrivilegesToGroup()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会向指定的权限组添加权限。 | Java | v2"
type: docx
token: Zk2sduIEOoytTDxSFy0cUxiinpg
sidebar_position: 1
keywords: 
  - Zilliz
  - Milvus 向量 Database
  - Milvus Database
  - Milvus 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - addPrivilegesToGroup()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# addPrivilegesToGroup()

此操作会向指定的权限组添加权限。

```java
public Void addPrivilegesToGroup(AddPrivilegesToGroupReq request)
```

## 请求语法\{#request-syntax}

```java
addPrivilegesToGroup(AddPrivilegesToGroupReq.builder()
    .groupName(String groupName)
    .privileges(List<String> privileges)
    .build()
)
```

**构建器方法：**

- `groupName(String groupName)`

    目标权限组的名称。

- `privileges(List<String> privileges)`

    要添加到指定权限组中的权限。有关可用权限的详细信息，请参见 [管理集群角色（SDK）](/docs/cluster-roles-sdk)。

**异常：**

- **MilvusClientExceptions**

    此操作过程中发生任何错误时，将引发此异常。

## 示例\{#example}

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
