---
title: "IndexParam | Java | v2"
slug: /java/java/v2-Management-IndexParam
sidebar_label: "IndexParam"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "IndexParam は、コレクションフィールドのインデックスを設定するためのパラメータを定義します。 | Java | v2"
type: docx
token: SXgodgq99ozZoHxfnakc0fpCnJh
sidebar_position: 10
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - Milvus とは
  - zilliz
  - zilliz cloud
  - cloud
  - IndexParam
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# IndexParam

IndexParam は、コレクションフィールドのインデックスを設定するためのパラメータを定義します。

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

**RETURNS:**

*IndexParam*

**EXCEPTIONS:**

*MilvusClientException*

この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## Example\{#example}

```java
import io.milvus.v2.common.IndexParam;

IndexParam indexParam = IndexParam.builder()
    .fieldName("vector")
    .indexType(IndexParam.IndexType.HNSW)
    .metricType(IndexParam.MetricType.COSINE)
    .extraParams(Map.of("M", 16, "efConstruction", 256))
    .build();
```
