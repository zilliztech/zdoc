---
title: "appendRow() | Java | v2"
slug: /java/java/v2-LocalBulkWriter-appendRow
sidebar_label: "appendRow()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、1 行を検証してライターに追加します。バッファリングされたデータが設定済みの `chunkSize` を超えると、ライターは現在のファイルを自動的にコミットします。 | Java | v2"
type: docx
token: LzctdSxZ9ogGTwxx1yXcTc7ynvf
sidebar_position: 6
keywords: 
  - milvus データベース
  - milvus ベクトルデータベース
  - Zilliz Cloud
  - milvus とは
  - zilliz
  - zilliz cloud
  - クラウド
  - appendRow()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# appendRow()

この操作では、1 行を検証してライターに追加します。バッファリングされたデータが設定済みの `chunkSize` を超えると、ライターは現在のファイルを自動的にコミットします。

`StructFieldSchema` のフィールドには、binary、float16、bfloat16、int8 のベクトル値を格納できます。

```java
public void appendRow(JsonObject rowData)
```

**例外：**

- **例外**

    リクエストの検証、トランスポート、またはサーバーでの実行に失敗した場合に発生します。正確な失敗理由については、例外メッセージを確認してください。

## 例\{#example}

```java
JsonObject row = new JsonObject();
row.addProperty("id", 1L);
row.addProperty("title", "Dune");
writer.appendRow(row);
```
