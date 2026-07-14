---
title: "appendRow() | Java | v2"
slug: /java/java/v2-RemoteBulkWriter-appendRow
sidebar_label: "appendRow()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、RemoteBulkWriter バッファに 1 行のデータを追加します。バッファがいっぱいになったとき、または `commit()` が呼び出されたときに、データはリモートストレージにアップロードされます。 | Java | v2"
type: docx
token: PLJTd37DWozRwbx74AIcQyh4nmc
sidebar_position: 6
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - appendRow()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# appendRow()

この操作は、RemoteBulkWriter バッファに 1 行のデータを追加します。バッファがいっぱいになったとき、または `commit()` が呼び出されたときに、データはリモートストレージにアップロードされます。

```java
public void appendRow(JsonObject rowData) throws IOException, InterruptedException
```

**PARAMETERS:**

- **rowData** (*JsonObject*) -

    単一のデータ行を表す JSON オブジェクト。

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```java
RemoteBulkWriter writer = new RemoteBulkWriter(config);
JsonObject row = new JsonObject();
row.addProperty("id", 1L);
row.add("vector", gson.toJsonTree(new float[]{0.1f, 0.2f, 0.3f}));
writer.appendRow(row);
```
