---
title: "listDatabases() | Java | v2"
slug: /java/java/v2-Database-listDatabases
sidebar_label: "listDatabases()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出所有 Database 名称。 | Java | v2"
type: docx
token: X2dbdeazuofnEVxVQtgcBHujnvf
sidebar_position: 6
keywords: 
  - LLM 评估
  - 稀疏向量与稠密向量
  - 稠密向量
  - 分层可导航小世界
  - Zilliz
  - Zilliz Cloud
  - 云
  - listDatabases()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listDatabases()

此操作会列出所有 Database 名称。

```java
public ListDatabasesResp listDatabases()
```

**返回类型：**

*ListDatabasesResp*

**返回：**

ListDatabasesResp 对象包含所有 Database 名称的列表。

**参数：**

- **databaseNames** (*List&lt;String&gt;*) -

    所有 Database 名称的列表。

**异常：**

- **MilvusClientExceptions**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.database.response.ListDatabasesResp;
import java.util.List;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List databases
ListDatabasesResp listDatabasesResp = client.listDatabases();
List<String> dbNames = listDatabasesResp.getDatabaseNames();
```
