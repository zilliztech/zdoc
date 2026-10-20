---
title: "alterCollectionField() | Java | v2"
slug: /java/java/v2-Collections-alterCollectionField
sidebar_label: "alterCollectionField()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation modifies the properties of a specified コレクション field. | Java | v2"
type: docx
token: NRGzdPUvRoyltmxsdqKchWFTnTe
sidebar_position: 2
keywords: 
  - Milvus とは
  - milvus データベース
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

This operation modifies the properties of a specified コレクション field.

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

    The name of the データベース that holds the target コレクション.

- `collectionName(String collectionName)`

    **[REQUIRED]**

    The name of the target コレクション.

- `fieldName(String fieldName)`

    **[REQUIRED]**

    対象 field の名前。

- `properties(Map<String, String> properties)`

    **[REQUIRED]**

    The properties to modify and their expected values. Note that the property values should be strings. Available データベース properties are as follows:

    - **max_length** -

        挿入可能な文字列の最大バイト長。マルチバイト文字（例: Unicode 文字）は 1 文字あたり 1 バイトを超える場合があるため、挿入する文字列のバイト長が指定された制限を超えないようにしてください。値の範囲: [1, 65,535]。

        これは varchar field では必須です。

    - **max_capacity** -

        Array field 値内の要素数。

        これは array field では必須です。

    - **mmap_enabled** -

        Milvus が field データを完全に読み込む代わりにメモリにマップするかどうか。詳細については、MMap-enabled Data Storage を参照してください。

- `property(String key, String value)`

    *void*

**例外:**

- **MilvusClientExceptions**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AlterCollectionFieldReq;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Alter the \`max_length\` property of a VarChar field named \`varchar\`
Map<String, String> properties = new HashMap<>();
properties.put("max_length", "512");

AlterCollectionFieldReq alterCollectionFieldReq = AlterCollectionFieldReq.builder()
        .collectionName("test")
        .fieldName("varchar")
        .properties(properties)
        .build();
client.alterCollectionField(alterCollectionFieldReq);
```
