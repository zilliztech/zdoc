---
title: "getBatchFiles() | Java | v2"
slug: /java/java/v2-RemoteBulkWriter-getBatchFiles
sidebar_label: "getBatchFiles()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在の LocalBulkWriter インスタンスに渡されたファイルのリストを返します。 | Java | v2"
type: docx
token: YlpQdEUnKoFR3xxizt2cCV8UnZb
sidebar_position: 4
keywords: 
  - Deep Learning
  - ナレッジベース
  - 自然言語処理
  - AI チャットボット
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
remoteBulkWriter.getBatchFiles()
```

**パラメータ:**

*なし*

**戻り値の型:**

*List\<List\<String>>*

## 例\{#example}

```java
List<List<String>> batchFiles = remoteBulkWriter.getBatchFiles();
```
