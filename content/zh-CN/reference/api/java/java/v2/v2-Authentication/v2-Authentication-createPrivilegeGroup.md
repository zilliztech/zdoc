---
title: "createPrivilegeGroup() | Java | v2"
slug: /java/java/v2-Authentication-createPrivilegeGroup
sidebar_label: "createPrivilegeGroup()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会创建一个权限组。 | Java | v2"
type: docx
token: VDGtd5FmbobsfdxpGCZcQQlwnHf
sidebar_position: 2
keywords: 
  - 知识库
  - 自然语言处理
  - AI 聊天机器人
  - 余弦距离
  - zilliz
  - zilliz cloud
  - 云
  - createPrivilegeGroup()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createPrivilegeGroup()

此操作会创建一个权限组。

```java
public Void createPrivilegeGroup(CreatePrivilegeGroupReq request)
```

## 请求语法\{#request-syntax}

```java
createPrivilegeGroup(CreatePrivilegeGroupReq.builder()
    .groupName(String groupName)
    .build()
)
```

**构建器方法：**

- `groupName(String groupName)`

    要创建的权限组的名称。

**异常：**

- **MilvusClientExceptions**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

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
