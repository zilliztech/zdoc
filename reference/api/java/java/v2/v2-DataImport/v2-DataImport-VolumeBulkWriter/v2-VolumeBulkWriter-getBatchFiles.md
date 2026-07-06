---
title: "getBatchFiles() | Java | v2"
slug: /java/java/v2-VolumeBulkWriter-getBatchFiles
sidebar_label: "getBatchFiles()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns a list of files passed to the current VolumeBulkWriter instance. | Java | v2"
type: docx
token: VlvQdg0fHoy8Uhxr8d6cpUnLn5y
sidebar_position: 4
keywords: 
  - Unstructured Data
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

This operation returns a list of files passed to the current VolumeBulkWriter instance.

```java
public List<List<String>> getBatchFiles()
```

## Request Syntax\{#request-syntax}

```java
volumeBulkWriter.getBatchFiles()
```

**PARAMETERS:**

*None*

**RETURNS TYPE:**

*List\<List\<String>>*

## Example\{#example}

```java
List<List<String>> batchFiles = volumeBulkWriter.getBatchFiles();
```

