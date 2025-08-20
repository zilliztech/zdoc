---
displayed_sidbar: javaSidebar
title: "getBatchFiles() | Java | v2"
slug: /java/java/v2-RemoteBulkWriter-getBatchFiles
sidebar_label: "getBatchFiles()"
beta: false
notebook: false
description: "This operation returns a list of files passed to the current LocalBulkWriter instance. | Java | v2"
type: docx
token: YlpQdEUnKoFR3xxizt2cCV8UnZb
sidebar_position: 4
keywords: 
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - zilliz
  - zilliz cloud
  - cloud
  - getBatchFiles()
  - javaV225
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
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
remoteBulkWriter.getBatchFiles()
```

**PARAMETERS:**

*None*

**RETURNS TYPE:**

*List\&lt;List\&lt;String&gt;&gt;*

## Example{#example}

```java
List<List<String>> batchFiles = remoteBulkWriter.getBatchFiles();
```
