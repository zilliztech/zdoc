---
title: "getTotalRowCount() | Java | v2"
slug: /java/java/v2-LocalBulkWriter-getTotalRowCount
sidebar_label: "getTotalRowCount()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、この LocalBulkWriter インスタンスによって書き込まれた行の合計数を返します。 | Java | v2"
type: docx
token: AUQvd5EdFomWEWx3DrwcffYHnmb
sidebar_position: 7
keywords: 
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database
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

この操作は、この LocalBulkWriter インスタンスによって書き込まれた行の合計数を返します。

```java
public Long getTotalRowCount()
```

**戻り値:**

*Long*

**例外:**

- **MilvusClientException**

    この例外は、この操作の実行中に何らかのエラーが発生した場合にスローされます。

## Example\{#example}

```java
LocalBulkWriter writer = new LocalBulkWriter(config);
// ... append rows
Long totalRows = writer.getTotalRowCount();
System.out.println("Total rows written: " + totalRows);
```
