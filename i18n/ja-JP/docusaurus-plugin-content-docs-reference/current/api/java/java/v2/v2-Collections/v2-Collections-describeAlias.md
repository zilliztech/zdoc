---
title: "describeAlias() | Java | v2"
slug: /java/java/v2-Collections-describeAlias
sidebar_label: "describeAlias()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はエイリアスの詳細を表示します。 | Java | v2"
type: docx
token: VStqdo03iougInxoHwMc8SJKnCe
sidebar_position: 10
keywords: 
  - rag ベクトルデータベース
  - ベクトルデータベースとは
  - ベクトルデータベースとは何か
  - ベクトルデータベースの比較
  - zilliz
  - zilliz cloud
  - クラウド
  - describeAlias()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeAlias()

この操作は、エイリアスの詳細を表示します。

```java
public DescribeAliasResp describeAlias(DescribeAliasReq request)
```

## リクエスト構文\{#request-syntax}

```java
describeAlias(DescribeAliasReq.builder()
    .databaseName(String databaseName)
    .alias(String alias)
    .build()
);
```

**BUILDER メソッド:**

- `databaseName(String databaseName)` -

    データベースの名前です。指定しない場合は、現在のデータベースがデフォルトになります。

- `alias(String alias)` -

    エイリアス名です。

**戻り値の型:**

*DescribeAliasResp*

**戻り値:**

エイリアスの詳細を含む **DescribeAliasResp** オブジェクトです。

**パラメータ:**

- **databaseName** (*String*) -

    エイリアスが属するデータベースの名前です。

- **collectionName** (*String*) -

    エイリアスが参照するコレクションの名前です。

- **alias** (*String*) -

    エイリアス名です。

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.DescribeAliasReq;
import io.milvus.v2.service.utility.response.DescribeAliasResp;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Describe alias
DescribeAliasReq describeAliasReq = DescribeAliasReq.builder()
        .databaseName("my_database")
        .collectionName("my_collection")
        .alias("test_alias")
        .build();
DescribeAliasResp describeAliasResp = client.describeAlias(describeAliasReq);
```
