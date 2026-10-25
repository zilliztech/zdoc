---
title: "removePrivilegesFromGroup() | Java | v2"
slug: /java/java/v2-Authentication-removePrivilegesFromGroup
sidebar_label: "removePrivilegesFromGroup()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会从特定权限组中移除权限。 | Java | v2"
type: docx
token: PsIEd5UbFoIHIzxkXyCcgKwXnoe
sidebar_position: 16
keywords: 
  - 什么是向量嵌入
  - 向量 Database 教程
  - 向量 Database 如何工作
  - 向量 Database 对比
  - zilliz
  - zilliz cloud
  - 云
  - removePrivilegesFromGroup()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# removePrivilegesFromGroup()

此操作会从特定权限组中移除权限。

```java
public Void removePrivilegesFromGroup(RemovePrivilegesFromGroupReq request)
```

## 请求语法\{#request-syntax}

```java
removePrivilegesFromGroup(RemovePrivilegesFromGroupReq.builder()
    .groupName(String groupName)
    .privileges(List<String> privileges)
    .build()
)
```

**构建器方法：**

- `groupName(String groupName)`

    目标权限组的名称。

- `privileges(List<String> privileges)`

    要从指定权限组中删除的权限。有关可用权限的详细信息，请参见向角色授予权限或权限组。

**异常：**

- **MilvusClientExceptions**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

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
