---
title: "getBatchFiles() | Java | v2"
slug: /java/java/v2-RemoteBulkWriter-getBatchFiles
sidebar_label: "getBatchFiles()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回传递给当前 LocalBulkWriter 实例的文件列表。 | Java | v2"
type: docx
token: YlpQdEUnKoFR3xxizt2cCV8UnZb
sidebar_position: 4
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
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

此操作返回传递给当前 LocalBulkWriter 实例的文件列表。

```java
public List<List<String>> getBatchFiles()
```

## 请求语法\{#request-syntax}

```java
remoteBulkWriter.getBatchFiles()
```

**参数：**

*无*

**返回类型：**

*List\<List\<String>>*

## 示例\{#example}

```java
List<List<String>> batchFiles = remoteBulkWriter.getBatchFiles();
```
