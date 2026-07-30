---
displayed_sidbar: javaSidebar
title: "getBatchFiles() | Java | v2"
slug: /java/java/v2-RemoteBulkWriter-getBatchFiles
sidebar_label: "getBatchFiles()"
added_since: v2.5.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation returns a list of files passed to the current LocalBulkWriter instance. | Java | v2"
type: docx
token: YlpQdEUnKoFR3xxizt2cCV8UnZb
sidebar_position: 4
keywords: 
  - rag llm architecture
  - private llms
  - nn search
  - llm eval
  - zilliz
  - zilliz cloud
  - cloud
  - getBatchFiles()
  - javaV226
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getBatchFiles()

This operation returns a list of files passed to the current LocalBulkWriter instance.

```java
public List<List<String>> getBatchFiles()
```

## Request Syntax

```java
remoteBulkWriter.getBatchFiles()
```

**PARAMETERS:**

*None*

**RETURNS TYPE:**

*List\<List\<String>>*

## Example

```java
List<List<String>> batchFiles = remoteBulkWriter.getBatchFiles();
```
