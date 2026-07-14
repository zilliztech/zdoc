---
title: "listRoles() | Java | v2"
slug: /java/java/v2-Authentication-listRoles
sidebar_label: "listRoles()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はすべてのカスタムロールを一覧表示します。 | Java | v2"
type: docx
token: XIIyd3bMzoAVx3xVsoLcnQ2pnKh
sidebar_position: 14
keywords: 
  - ベクトルデータベースの例
  - rag ベクトルデータベース
  - ベクトル db とは
  - ベクトルデータベースとは
  - zilliz
  - zilliz cloud
  - クラウド
  - listRoles()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listRoles()

この操作はすべてのカスタムロールを一覧表示します。

```java
public List<String> listRoles()
```

## リクエスト構文\{#request-syntax}

```java
MilvusClientV2 client = new MilvusClientV2(connectConfig);

List<String> roles = client.listRoles();
```

**戻り値の型:**

*List\<String\>*

**戻り値:**

ロール名を含む文字列のリスト。

**例外:**

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

// 2. List roles
List<String> roles = client.listRoles();
```

