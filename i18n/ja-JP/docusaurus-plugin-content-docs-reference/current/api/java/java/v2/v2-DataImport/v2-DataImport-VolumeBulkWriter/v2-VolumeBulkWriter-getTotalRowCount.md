---
title: "getTotalRowCount() | Java | v2"
slug: /java/java/v2-VolumeBulkWriter-getTotalRowCount
sidebar_label: "getTotalRowCount()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、この VolumeBulkWriter インスタンスによって書き込まれた行の総数を返します。 | Java | v2"
type: docx
token: JgY9doHQjoNBfMxVnpfcZeHongb
sidebar_position: 5
keywords: 
  - マネージド Milvus
  - Serverless ベクトルデータベース
  - Milvus オープンソース
  - Milvus の仕組み
  - zilliz
  - zilliz cloud
  - クラウド
  - getTotalRowCount()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getTotalRowCount()

この操作は、この VolumeBulkWriter インスタンスによって書き込まれた行の総数を返します。

```java
public Long getTotalRowCount()
```

**戻り値の型:**

*Long*

**戻り値:**

これまでに追加された行の総数です。

**パラメーター:**

- **totalRowCount** (*Long*) -

    これまでに追加された行の総数です。

**例外:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```java
VolumeBulkWriter writer = new VolumeBulkWriter(config);
// ... append rows
Long totalRows = writer.getTotalRowCount();
System.out.println("Total rows written: " + totalRows);
```
