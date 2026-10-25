---
title: "listRoles() | Java | v2"
slug: /java/java/v2-Authentication-listRoles
sidebar_label: "listRoles()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出所有自定义角色。 | Java | v2"
type: docx
token: M4KYdO6CWofowQxFYDecYxjknEg
sidebar_position: 14
keywords: 
  - 向量 Database 示例
  - RAG 向量 Database
  - 什么是向量 db
  - 什么是向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - listRoles()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listRoles()

此操作会列出所有自定义角色。

```java
public List<String> listRoles()
```

## 请求语法\{#request-syntax}

```java
MilvusClientV2 client = new MilvusClientV2(connectConfig);

List<String> roles = client.listRoles();
```

**返回类型：**

*List&lt;String&gt;*

**返回：**

包含角色名称的字符串列表。

**参数：**

- **roleNames** （*List&lt;String&gt;*） -

    所有自定义角色名称的列表。

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

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

// 2. List roles
List<String> roles = client.listRoles();
```
