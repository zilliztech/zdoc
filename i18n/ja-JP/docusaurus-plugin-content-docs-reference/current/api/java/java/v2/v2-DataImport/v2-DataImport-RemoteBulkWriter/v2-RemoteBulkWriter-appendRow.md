---
title: "appendRow() | Java | v2"
slug: /java/java/v2-RemoteBulkWriter-appendRow
sidebar_label: "appendRow()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "1 行を検証して writer に追加します。バッファリングされたデータが設定された `chunkSize` を超えると、writer は現在のファイルを自動的にコミットします。 | Java | v2"
type: docx
token: ZWoqd1OFgoYwGyxWmz9ciWwsnZx
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

1 行を検証して writer に追加します。バッファリングされたデータが設定された `chunkSize` を超えると、writer は現在のファイルを自動的にコミットします。

[`StructFieldSchema`](./v2-Collections-StructFieldSchema) フィールドには、binary、float16、bfloat16、および int8 vector 値を含めることができます。

```java
public void appendRow(JsonObject rowData)
```

**戻り値:**

*void*

この操作は値を返しません。

**例外:**

- **Exception**

    リクエストの検証、トランスポート、またはサーバー実行に失敗した場合に発生します。正確な失敗理由については、例外メッセージを確認してください。

## 例\{#example}

```java
JsonObject row = new JsonObject();
row.addProperty("id", 1L);
row.addProperty("title", "Dune");
writer.appendRow(row);
```
