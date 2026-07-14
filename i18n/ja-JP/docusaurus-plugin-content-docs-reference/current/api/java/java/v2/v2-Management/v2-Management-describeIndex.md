---
title: "describeIndex() | Java | v2"
slug: /java/java/v2-Management-describeIndex
sidebar_label: "describeIndex()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は特定のインデックスの詳細を取得します。 | Java | v2"
type: docx
token: SgJ7dKfisomLkqx1E3BccMO7nqf
sidebar_position: 4
keywords: 
  - vector db の比較
  - openai vector db
  - 自然言語処理データベース
  - 安価な vector データベース
  - zilliz
  - zilliz cloud
  - cloud
  - describeIndex()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeIndex()

この操作は特定のインデックスの詳細を取得します。

```java
public DescribeIndexResp describeIndex(DescribeIndexReq request)
```

## Request Syntax\{#request-syntax}

```java
describeIndex(DescribeIndexReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .fieldName(String fieldName)
    .indexName(String indexName)
    .timestamp(Long timestamp)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    データベース名。指定しない場合は現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)` -

    対象コレクションの名前。

- `fieldName(String fieldName)` -

    対象フィールドの名前。

- `indexName(String indexName)` -

    対象インデックスの名前。

- `timestamp(Long timestamp)` -

    タイムトラベルクエリ用のタイムスタンプ。デフォルトは `0L` です。

**RETURNS:**

*DescribeIndexResp*

指定されたインデックスの詳細を含む **DescribeIndexResp** オブジェクト。

**EXCEPTIONS:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.index.request.DescribeIndexReq;
import io.milvus.v2.service.index.response.DescribeIndexResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Describe the index for the field "vector"
DescribeIndexReq describeIndexReq = DescribeIndexReq.builder()
        .collectionName("test")
        .fieldName("vector")
        .build();
DescribeIndexResp describeIndexResp = client.describeIndex(describeIndexReq);
```
