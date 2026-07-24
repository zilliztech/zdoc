---
title: "appendRow() | Java | v2"
slug: /java/java/v2-VolumeBulkWriter-appendRow
sidebar_label: "appendRow()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "1 行を検証し、writer に追加します。バッファされたデータが設定済みの `chunkSize` を超えると、writer は現在のファイルを自動的にコミットします。 | Java | v2"
type: docx
token: IBAFdWOAKogmCIxHzVIc4NaDn4g
sidebar_position: 1
keywords: 
  - ベクトルインデックス
  - ベクトルデータベース オープンソース
  - オープンソース ベクトル db
  - ベクトルデータベース 例
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

1 行を検証し、writer に追加します。バッファされたデータが設定済みの `chunkSize` を超えると、writer は現在のファイルを自動的にコミットします。

[`StructFieldSchema`](./v2-Collections-StructFieldSchema) フィールドには、binary、float16、bfloat16、int8 の vector 値を含めることができます。

```java
public void appendRow(JsonObject rowData)
```

**RETURNS:**

*void*

この操作は値を返しません。

**EXCEPTIONS:**

- **Exception**

    リクエストの検証、転送、またはサーバー実行に失敗した場合に発生します。正確な失敗理由については、例外メッセージを確認してください。

## Example\{#example}

```java
JsonObject row = new JsonObject();
row.addProperty("id", 1L);
row.addProperty("title", "Dune");
writer.appendRow(row);
```
