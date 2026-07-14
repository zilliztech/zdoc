---
title: "alterIndexProperties() | Java | v2"
slug: /java/java/v2-Management-alterIndexProperties
sidebar_label: "alterIndexProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたインデックスのプロパティを変更します。 | Java | v2"
type: docx
token: ITkydrfmroQyLLxusZtc6t1nnjf
sidebar_position: 1
keywords: 
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - 非構造化データ
  - ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - alterIndexProperties()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# alterIndexProperties()

この操作は、指定されたインデックスのプロパティを変更します。

```java
public Void alterIndexProperties(AlterIndexPropertiesReq request)
```

## リクエスト構文\{#request-syntax}

```java
alterIndexProperties(AlterIndexPropertiesReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .indexName(String indexName)
    .properties(Map<String, String> properties)
    .build()
)
```

**ビルダーメソッド:**

- `databaseName(String databaseName)`

    対象のコレクションを保持するデータベースの名前。

- `collectionName(String collectionName)`

    対象のコレクションの名前。

- `indexName(String indexName)`

    対象のインデックスの名前。

- `properties(Map<String, String> properties)`

    変更するプロパティとその期待される値です。プロパティ値は文字列である必要があることに注意してください。利用可能なデータベースプロパティは次のとおりです。

    - **mmap.enabled** -

        現在のインデックスに対して mmap を有効にするかどうか。

**戻り値:**

*void*

**例外:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.index.request.AlterIndexPropertiesReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Alter the `mmap.enabled` property
Map<String, String> properties = new HashMap<>()
properties.put("mmap.enabled", "true")

AlterIndexPropertiesReq alterIndexPropertiesReq = AlterIndexPropertiesReq.builder()
        .collectionName("test")
        .indexName("vector")
        .properties(properties)
        .build();
client.alterIndexProperties(alterCollectionFieldReq)
```

