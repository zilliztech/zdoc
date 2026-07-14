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
  - managed milvus
  - Serverless vector database
  - milvus open source
  - milvus はどのように動作するか
  - zilliz
  - zilliz cloud
  - cloud
  - getTotalRowCount()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getTotalRowCount()

この操作は、この VolumeBulkWriter インスタンスによって書き込まれた行の総数を返します。

```java
public Long getTotalRowCount()
```

**戻り値:**

*Long*

**例外:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合に送出されます。

## 例\{#example}

```java
VolumeBulkWriter writer = new VolumeBulkWriter(config);
// ... append rows
Long totalRows = writer.getTotalRowCount();
System.out.println("Total rows written: " + totalRows);
```

