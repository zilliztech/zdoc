---
title: "listUsers() | Java | v2"
slug: /java/java/v2-Authentication-listUsers
sidebar_label: "listUsers()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のすべてのユーザー名を一覧表示します。 | Java | v2"
type: docx
token: EfM3drSXlo4Yzyxq2GpcmvoHnTm
sidebar_position: 15
keywords: 
  - Zilliz
  - milvus ベクトルデータベース
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - listUsers()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listUsers()

この操作は、既存のすべてのユーザー名を一覧表示します。

```java
public List<String> listUsers()
```

## リクエスト構文\{#request-syntax}

```java
listUsers();
```

**RETURN TYPE:**

*List\<String\>*

**RETURNS:**

ユーザー名を含む文字列のリスト。

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List users
List<String> resp = client.listUsers();
```

