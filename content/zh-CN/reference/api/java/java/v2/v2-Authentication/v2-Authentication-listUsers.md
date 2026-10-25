---
title: "listUsers() | Java | v2"
slug: /java/java/v2-Authentication-listUsers
sidebar_label: "listUsers()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出所有现有用户的名称。 | Java | v2"
type: docx
token: Ewtkdz0gSo38D4xf9eecRyzynRd
sidebar_position: 15
keywords: 
  - Zilliz
  - Milvus 向量 Database
  - Milvus Database
  - Milvus 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - listUsers()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listUsers()

此操作会列出所有现有用户的名称。

```java
public List<String> listUsers()
```

## 请求语法\{#request-syntax}

```java
listUsers();
```

**返回类型：**

*List&lt;String&gt;*

**返回：**

一个包含所有用户名称的字符串列表。

**参数：**

- **userNames**（*List&lt;String&gt;*） -

    所有现有用户的名称列表。

**异常：**

- **MilvusClientExceptions**

    此操作过程中发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import java.util.List;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List users
List<String> resp = client.listUsers();
```
