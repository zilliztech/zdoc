---
title: "getBatchFiles() | Java | v2"
slug: /java/java/v2-LocalBulkWriter-getBatchFiles
sidebar_label: "getBatchFiles()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在の LocalBulkWriter インスタンスに渡されたファイルのリストを返します。 | Java | v2"
type: docx
token: BLFEde4BuoCjTSxjYSUcZerEnOb
sidebar_position: 4
keywords: 
  - ハイブリッドベクトル検索
  - 動画の重複排除
  - 動画の類似検索
  - Vector retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - getBatchFiles()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getBatchFiles()

この操作は、現在の LocalBulkWriter インスタンスに渡されたファイルのリストを返します。

```java
public List<List<String>> getBatchFiles()
```

## リクエスト構文\{#request-syntax}

```java
localBulkWriter.getBatchFiles()
```

**パラメータ:**

*なし*

**戻り値の型:**

*List\<List\<String>>*

## 例\{#example}

```java
List<List<String>> batchFiles = localBulkWriter.getBatchFiles();
```
