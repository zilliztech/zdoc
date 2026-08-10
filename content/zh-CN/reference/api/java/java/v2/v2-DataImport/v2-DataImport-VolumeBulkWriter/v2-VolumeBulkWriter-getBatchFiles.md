---
title: "getBatchFiles() | Java | v2"
slug: /java/java/v2-VolumeBulkWriter-getBatchFiles
sidebar_label: "getBatchFiles()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回传递给当前 VolumeBulkWriter 实例的文件列表。 | Java | v2"
type: docx
token: VlvQdg0fHoy8Uhxr8d6cpUnLn5y
sidebar_position: 4
keywords: 
  - 非结构化数据
  - 向量 Database
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

此操作返回传递给当前 VolumeBulkWriter 实例的文件列表。

```java
public List<List<String>> getBatchFiles()
```

## 请求语法\{#request-syntax}

```java
volumeBulkWriter.getBatchFiles()
```

**参数：**

*无*

**返回类型：**

*List\<List\<String>>*

## 示例\{#example}

```java
List<List<String>> batchFiles = volumeBulkWriter.getBatchFiles();
```

