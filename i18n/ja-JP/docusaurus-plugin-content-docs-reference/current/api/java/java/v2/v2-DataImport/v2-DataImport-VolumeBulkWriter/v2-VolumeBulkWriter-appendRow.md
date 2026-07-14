---
title: "appendRow() | Java | v2"
slug: /java/java/v2-VolumeBulkWriter-appendRow
sidebar_label: "appendRow()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、VolumeBulkWriter バッファにデータの 1 行を追加します。バッファがいっぱいになったとき、または `commit()` が呼び出されたときに、データはファイルに書き込まれます。 | Java | v2"
type: docx
token: TfLbdZoRvoa4RyxUWwncTDm2nHh
sidebar_position: 1
keywords: 
  - Vector index
  - オープンソースのベクターデータベース
  - オープンソース vector db
  - ベクターデータベースの例
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

この操作は、VolumeBulkWriter バッファにデータの 1 行を追加します。バッファがいっぱいになったとき、または `commit()` が呼び出されたときに、データはファイルに書き込まれます。

```java
public void appendRow(JsonObject rowData) throws IOException, InterruptedException
```

**PARAMETERS:**

- **rowData** (*JsonObject*) -

    1 行のデータを表す JSON オブジェクト。

**RETURNS:**

*void*

**EXCEPTIONS:**

- **IOException**

    この操作中にデータの読み取りまたは書き込みエラーが発生した場合にスローされる checked exception です。

- **InterruptedException**

    現在「ブロック」されている（待機中、スリープ中、またはその他の理由で処理が占有されている）スレッドが、`Thread.interrupt()` メソッドを使用する別のスレッドによって中断された場合にスローされる checked exception です。

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合に発生する例外です。

## Example\{#example}

```java
VolumeBulkWriter writer = new VolumeBulkWriter(config);
JsonObject row = new JsonObject();
row.addProperty("id", 1L);
row.add("vector", gson.toJsonTree(new float[]{0.1f, 0.2f, 0.3f}));
writer.appendRow(row);
```

