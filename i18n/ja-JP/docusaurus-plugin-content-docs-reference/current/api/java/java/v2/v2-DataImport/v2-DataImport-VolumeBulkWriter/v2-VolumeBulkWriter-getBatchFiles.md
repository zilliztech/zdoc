---
title: "getBatchFiles() | Java | v2"
slug: /java/java/v2-VolumeBulkWriter-getBatchFiles
sidebar_label: "getBatchFiles()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在の VolumeBulkWriter インスタンスに渡されたファイルのリストを返します。 | Java | v2"
type: docx
token: VlvQdg0fHoy8Uhxr8d6cpUnLn5y
sidebar_position: 4
keywords: 
  - 非構造化データ
  - vector database
  - IVF
  - knn
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

この操作は、現在の VolumeBulkWriter インスタンスに渡されたファイルのリストを返します。

```java
public List<List<String>> getBatchFiles()
```

## リクエスト構文\{#request-syntax}

```java
volumeBulkWriter.getBatchFiles()
```

**パラメータ:**

*なし*

**戻り値の型:**

*List\<List\<String>>*

## 例\{#example}

```java
List<List<String>> batchFiles = volumeBulkWriter.getBatchFiles();
```

