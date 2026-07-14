---
title: "describeAlias() | Java | v2"
slug: /java/java/v2-Collections-describeAlias
sidebar_label: "describeAlias()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作はエイリアスの詳細を表示します。 | Java | v2"
type: docx
token: BDqGdp4uqo3XRexslRNcts9knmd
sidebar_position: 11
keywords: 
  - rag ベクターデータベース
  - ベクターデータベースとは
  - ベクターデータベースとは何か
  - ベクターデータベース比較
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

この操作はエイリアスの詳細を表示します。

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

    データベース名。指定しない場合は現在のデータベースがデフォルトになります。

- `alias(String alias)` -

    エイリアス名。

**戻り値:**

*DescribeAliasResp*

エイリアスの詳細を含む **DescribeAliasResp** オブジェクト。

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.DescribeAliasReq;
import io.milvus.v2.service.utility.response.DescribeAliasResp;

// 1. クライアントをセットアップします
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. エイリアスの詳細を取得します
DescribeAliasReq describeAliasReq = DescribeAliasReq.builder()
        .databaseName("my_database")
        .collectionName("my_collection")
        .alias("test_alias")
        .build();
DescribeAliasResp describeAliasResp = client.describeAlias(describeAliasReq);
```
