---
title: "getBatchFiles() | Java | v2"
slug: /java/java/v2-LocalBulkWriter-getBatchFiles
sidebar_label: "getBatchFiles()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns a list of files passed to the current LocalBulkWriter instance. | Java | v2"
type: docx
token: BLFEde4BuoCjTSxjYSUcZerEnOb
sidebar_position: 4
keywords: 
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases
  - zilliz
  - zilliz cloud
  - cloud
  - getBatchFiles()
  - javaV226
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - Question answering system
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getBatchFiles()

This operation returns a list of files passed to the current LocalBulkWriter instance.

```java
public List<List<String>> getBatchFiles()
```

## Request Syntax\{#request-syntax}

```java
localBulkWriter.getBatchFiles()
```

**PARAMETERS:**

*None*

**RETURNS TYPE:**

*List\<List\<String>>*

## Example\{#example}

```java
List<List<String>> batchFiles = localBulkWriter.getBatchFiles();
```
