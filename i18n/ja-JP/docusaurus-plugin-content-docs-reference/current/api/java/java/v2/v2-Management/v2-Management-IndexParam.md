---
title: "IndexParam | Java | v2"
slug: /java/java/v2-Management-IndexParam
sidebar_label: "IndexParam"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "IndexParam インスタンスは、コレクションフィールドにインデックスを設定するためのパラメータを保持します。 | Java | v2"
type: docx
token: PpTcd5ptzoYJjZxRPdMcQvSjnDc
sidebar_position: 10
keywords: 
  - Milvus データベース
  - Milvus ベクトルデータベース
  - Zilliz Cloud
  - Milvus とは
  - zilliz
  - Zilliz Cloud
  - クラウド
  - IndexParam
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# IndexParam

IndexParam インスタンスは、コレクションフィールドにインデックスを設定するためのパラメータを保持します。

```java
IndexParam.builder()
    .fieldName(String fieldName)
    .indexType(IndexType indexType)
    .metricType(MetricType metricType)
    .extraParams(Map<String, Object> extraParams)
    .build()
```

**BUILDER METHODS:**

- `fieldName(String fieldName)` -

    インデックスを作成するフィールドの名前です。

- `indexType(IndexType indexType)` -

    フィールドに構築するインデックスの種類です。利用可能なインデックスタイプについては、IndexType を参照してください。

- `metricType(MetricType metricType)` -

    ベクトル類似度を測定するためのメトリックタイプです。利用可能なメトリックタイプについては、MetricType を参照してください。

- `extraParams(Map<String, Object> extraParams)` -

    追加のインデックス固有パラメータをキーと値のペアとして指定します。たとえば、HNSW インデックスの場合は `{"M": 16, "efConstruction": 256}` です。

**RETURN TYPE:**

*IndexParam*

**RETURNS:**

**IndexParam** オブジェクトには、以下のフィールドが含まれます。

**PARAMETERS:**

- **fieldName** (*String*) -

    インデックスを作成するフィールドの名前です。

- **indexName** (*String*) -

    インデックスの名前です。

- **indexType** (*IndexType*) -

    フィールドに構築するインデックスの種類です。デフォルト：`AUTOINDEX`。

- **metricType** (*MetricType*) -

    ベクトル類似度を測定するためのメトリックタイプです。

- **extraParams** (*Map&lt;String, Object&gt;*) -

    追加のインデックス固有パラメータをキーと値のペアとして指定します。たとえば、`nlist` や `M` などです。

**EXCEPTIONS:**

*MilvusClientException*

この例外は、この操作中にエラーが発生した場合にスローされます。

## 例\{#example}

```java
import io.milvus.v2.common.IndexParam;

import java.util.HashMap;

IndexParam indexParam = IndexParam.builder()
    .fieldName("vector")
    .indexType(IndexParam.IndexType.HNSW)
    .metricType(IndexParam.MetricType.COSINE)
    .extraParams(new HashMap<String, Object>() {{
        put("M", 16);
        put("efConstruction", 256);
    }})
    .build();
```
