---
title: "appendRow() | Java | v2"
slug: /java/java/v2-LocalBulkWriter-appendRow
sidebar_label: "appendRow()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、LocalBulkWriter バッファに 1 行のデータを追加します。データは、バッファがいっぱいになったとき、または `commit()` が呼び出されたときにファイルに書き込まれます。 | Java | v2"
type: docx
token: OgXWdeRGhoxMYqxzNSrcSZAknIb
sidebar_position: 6
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - Milvus とは
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

この操作は、LocalBulkWriter バッファに 1 行のデータを追加します。データは、バッファがいっぱいになったとき、または `commit()` が呼び出されたときにファイルに書き込まれます。

```java
public void appendRow(JsonObject rowData) throws IOException, InterruptedException
```

**PARAMETERS:**

- **rowData** (*JsonObject*) -

    単一のデータ行を表す JSON オブジェクト。

**RETURNS:**

*void*

**EXCEPTIONS:**

- **IOException**

    この操作中にデータの読み取りまたは書き込みエラーが発生した場合にスローされる checked exception です。

- **InterruptedException**

    現在「ブロック中」（待機中、スリープ中、またはその他の理由で占有中）のスレッドが、`Thread.interrupt()` メソッドを使用する別のスレッドによって中断された場合にスローされる checked exception です。

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

## 例\{#example}

```java
LocalBulkWriter writer = new LocalBulkWriter(config);
JsonObject row = new JsonObject();
row.addProperty("id", 1L);
row.add("vector", gson.toJsonTree(new float[]{0.1f, 0.2f, 0.3f}));
writer.appendRow(row);
```
