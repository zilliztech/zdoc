---
title: "useDatabase() | Java | v2"
slug: /java/java/v2-Database-useDatabase
sidebar_label: "useDatabase()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は使用中のデータベースを変更します。 | Java | v2"
type: docx
token: LAJHdQKQQoPjmYxcfQgcvjvLnqh
sidebar_position: 7
keywords: 
  - 類似性検索
  - マルチモーダルRAG
  - llm hallucinations
  - ハイブリッド検索
  - zilliz
  - zilliz cloud
  - クラウド
  - useDatabase()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# useDatabase()

この操作は使用中のデータベースを変更します。

```java
public void useDatabase(String dbName)
```

## リクエスト構文\{#request-syntax}

```java
useDatabase(String dbName)
```

**PARAMETERS**

- **dbName** (*String*) -

    対象データベースの名前。

**RETURNS**

*void*

**EXCEPTIONS**

- InterruptedException

    この例外は、Milvus からの切断中に何らかのエラーが発生した場合に発生します。

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

// 2. Switch the client to another database
client.useDatabase("my_database")
```
