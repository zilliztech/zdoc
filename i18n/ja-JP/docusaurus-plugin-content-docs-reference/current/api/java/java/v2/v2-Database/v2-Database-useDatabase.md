---
title: "useDatabase() | Java | v2"
slug: /java/java/v2-Database-useDatabase
sidebar_label: "useDatabase()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、使用中のデータベースを変更します。 | Java | v2"
type: docx
token: I0cddYcHmorxaYxChficr214nAf
sidebar_position: 7
keywords: 
  - 類似検索
  - マルチモーダル RAG
  - LLM ハルシネーション
  - ハイブリッド検索
  - zilliz
  - zilliz cloud
  - クラウド
  - useDatabase()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# useDatabase()

この操作は、使用中のデータベースを変更します。

```java
public void useDatabase(String dbName)
```

## リクエスト構文\{#request-syntax}

```java
useDatabase(String dbName)
```

**パラメーター:**

- **dbName** (*String*) -

    対象データベースの名前です。

**例外:**

- **InterruptedException**

    Milvus から切断する際に何らかのエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Switch the client to another database
client.useDatabase("my_database");
```
