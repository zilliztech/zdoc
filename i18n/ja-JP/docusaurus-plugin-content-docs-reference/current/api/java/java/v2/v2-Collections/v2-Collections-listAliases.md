---
title: "listAliases() | Java | v2"
slug: /java/java/v2-Collections-listAliases
sidebar_label: "listAliases()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定のコレクションに存在するすべてのエイリアスを一覧表示します。 | Java | v2"
type: docx
token: DqOKdIhSZoQpDWxsUeocILbXn4g
sidebar_position: 17
keywords: 
  - milvus ベクトル db
  - Zilliz Cloud
  - Milvus とは
  - milvus データベース
  - zilliz
  - zilliz cloud
  - cloud
  - listAliases()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listAliases()

この操作は、特定のコレクションに存在するすべてのエイリアスを一覧表示します。

```java
public ListAliasResp listAliases()
```

## リクエスト構文\{#request-syntax}

```java
MilvusClientV2.listAliases(ListAliasesReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build();
)
```

**BUILDER メソッド:**

- `databaseName(String databaseName)`

    対象のコレクションが属するデータベースの名前。

- `collectionName(String collectionName)`

    この操作の対象コレクションの名前。

**戻り値の型:**

*ListAliasResp*

**戻り値:**

指定されたコレクションのエイリアスの一覧を含む **ListAliasResp** オブジェクト。コレクションにエイリアスがない場合は、空のリストが返されます。

**パラメータ:**

- **alias** (*List\<String\>*)

    エイリアスを含む文字列のリスト。

- **collectionName** (*String*)

    コレクションの名前。

**例外:**

- **MilvusClientExceptions**

    この操作の実行中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.ListAliasesReq;
import io.milvus.v2.service.utility.response.ListAliasResp;
import java.util.List;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List aliases
ListAliasesReq listAliasesReq = ListAliasesReq.builder()
        .databaseName("my_database")
        .collectionName("my_collection")
        .build();
ListAliasResp listAliasResp = client.listAliases(listAliasesReq);
```
