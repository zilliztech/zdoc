---
displayed_sidbar: javaSidebar
title: "getBatchFiles() | Java | v2"
slug: /java/java/v2-LocalBulkWriter-getBatchFiles
sidebar_label: "getBatchFiles()"
beta: false
notebook: false
description: "This operation returns a list of files passed to the current LocalBulkWriter instance. | Java | v2"
type: docx
token: BLFEde4BuoCjTSxjYSUcZerEnOb
sidebar_position: 4
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
  - zilliz
  - zilliz cloud
  - cloud
  - getBatchFiles()
  - javaV225
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - Vector Dimension
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getBatchFiles()

This operation returns a list of files passed to the current LocalBulkWriter instance.

```java
public List<List<String>> getBatchFiles()
```

## Request Syntax{#request-syntax}

```java
localBulkWriter.getBatchFiles()
```

**PARAMETERS:**

*None*

**RETURNS TYPE:**

*List\&lt;List\&lt;String&gt;&gt;*

## Example{#example}

```java
List<List<String>> batchFiles = localBulkWriter.getBatchFiles();
```
