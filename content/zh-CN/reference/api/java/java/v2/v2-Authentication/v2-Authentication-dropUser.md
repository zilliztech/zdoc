---
title: "dropUser() | Java | v2"
slug: /java/java/v2-Authentication-dropUser
sidebar_label: "dropUser()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除一个用户。 | Java | v2"
type: docx
token: RFv2dtZ1qoP9XQxJEGqcgLGUnhc
sidebar_position: 9
keywords: 
  - 向量 Database 如何工作
  - 向量数据库对比
  - OpenAI 向量数据库
  - 自然语言处理 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - dropUser()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropUser()

此操作会删除一个用户。

```java
public void dropUser(DropUserReq request)
```

## 请求语法\{#request-syntax}

```java
dropUser(DropUserReq.builder()
    .userName(String userName)
    .build()
)
```

**构建器方法：**

- `userName(String userName)`

    要删除的用户名称。

**返回值：**

*void*

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.DropUserReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop a user
DropUserReq dropUserReq = DropUserReq.builder()
        .userName("test")
        .build();
client.dropUser(dropUserReq);
```
