---
title: "dropIndexProperties() | Java | v2"
slug: /java/java/v2-Management-dropIndexProperties
sidebar_label: "dropIndexProperties()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたインデックスプロパティをデフォルト値にリセットします。 | Java | v2"
type: docx
token: NQSXdTousodlN4xy1WZc7Nc8n2e
sidebar_position: 6
keywords: 
  - RAG ベクトルデータベース
  - ベクトルデータベースとは
  - ベクトルデータベースとは何か
  - ベクトルデータベースの比較
  - zilliz
  - zilliz cloud
  - クラウド
  - dropIndexProperties()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropIndexProperties()

この操作は、指定されたインデックスプロパティをデフォルト値にリセットします。

```java
public Void dropIndexProperties(DropIndexPropertiesReq request)
```

## リクエスト構文\{#request-syntax}

```java
dropIndexProperties(DropIndexPropertiesReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .indexName(String indexName)
    .propertyKeys(List<String> propertyKeys)
    .build()
)
```

**ビルダーメソッド：**

- `databaseName(String databaseName)`

    対象コレクションを保持するデータベースの名前です。

- `collectionName(String collectionName)`

    対象コレクションの名前です。

- `indexName(String indexName)`

    対象インデックスの名前です。

- `propertyKeys(List<String> propertyKeys)`

    削除するプロパティです。プロパティ値は文字列である必要があります。使用可能なデータベースプロパティは以下の通りです。

    - **mmap.enabled** -

        現在のインデックスで mmap を有効にするかどうかを指定します。

**例外：**

- **MilvusClientExceptions**

    この操作中にエラーが発生した場合に、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.index.request.DropIndexPropertiesReq;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop the \`mmap.enabled\` property
List<String> propertyKeys = new ArrayList<>();
propertyKeys.add("mmap.enabled");

DropIndexPropertiesReq dropIndexPropertiesReq = DropIndexPropertiesReq.builder()
        .collectionName("test")
        .indexName("vector")
        .propertyKeys(propertyKeys)
        .build();
client.dropIndexProperties(dropIndexPropertiesReq);
```
