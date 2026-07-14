---
title: "alterCollectionField() | Java | v2"
slug: /java/java/v2-Collections-alterCollectionField
sidebar_label: "alterCollectionField()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された collection field のプロパティを変更します。 | Java | v2"
type: docx
token: OtrZdy7OtoC9N9xb8TjcCtM7nfc
sidebar_position: 2
keywords: 
  - Milvus とは
  - Milvus database
  - Milvus lite
  - Milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# alterCollectionField()

この操作は、指定された collection field のプロパティを変更します。

```java
public Void alterCollectionField(AlterCollectionFieldReq request)
```

## リクエスト構文\{#request-syntax}

```java
alterCollectionField(AlterCollectionFieldReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .fieldName(String fieldName)
    .properties(Map<String, String> properties)
    .build()
)
```

**ビルダーメソッド:**

- `databaseName(String databaseName)`

    対象の collection を保持する database の名前。

- `collectionName(String collectionName)`

    **[REQUIRED]**

    対象の collection の名前。

- `fieldName(String fieldName)`

    **[REQUIRED]**

    対象 field の名前。

- `properties(Map<String, String> properties)`

    **[REQUIRED]**

    変更するプロパティとその期待値です。プロパティ値は文字列である必要があることに注意してください。利用可能な database プロパティは次のとおりです。

    - **max_length** -

        挿入可能な文字列の最大バイト長。マルチバイト文字（例: Unicode 文字）は 1 文字あたり 1 バイトを超える場合があるため、挿入する文字列のバイト長が指定された制限を超えないようにしてください。値の範囲: [1, 65,535]。

        これは varchar field では必須です。

    - **max_capacity** -

        Array field 値内の要素数。

        これは array field では必須です。

    - **mmap_enabled** -

        Milvus が field データを完全に読み込む代わりにメモリにマップするかどうか。詳細については、MMap-enabled Data Storage を参照してください。

**戻り値:**

*void*

**例外:**

- **MilvusClientExceptions**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AlterCollectionFieldReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Alter the `max_length` property of a VarChar field named `varchar`
Map<String, String> properties = new HashMap<>()
properties.put("max_length", "512")

AlterCollectionFieldReq alterCollectionFieldReq = AlterCollectionFieldReq.builder()
        .collectionName("test")
        .fieldName("varchar")
        .properties(properties)
        .build();
client.alterCollectionField(alterCollectionFieldReq)
```

