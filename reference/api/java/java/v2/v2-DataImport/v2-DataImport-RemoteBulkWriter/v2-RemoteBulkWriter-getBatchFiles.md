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
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - zilliz
  - zilliz cloud
  - cloud
  - getBatchFiles()
  - javaV225
  - Recommender systems
  - information retrieval
  - dimension reduction
  - hnsw algorithm
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

*List\<List\<String>*

## Example{#example}

```java
List<List<String>> batchFiles = remoteBulkWriter.getBatchFiles();
```
