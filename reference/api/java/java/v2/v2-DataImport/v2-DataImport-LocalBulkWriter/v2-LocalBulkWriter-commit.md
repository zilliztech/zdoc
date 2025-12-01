---
title: "commit() | Java | v2"
slug: /java/java/v2-LocalBulkWriter-commit
sidebar_label: "commit()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation commits the appended data. | Java | v2"
type: docx
token: OUhTdWnXBoHqKdxTA0HcdMY5n4b
sidebar_position: 3
keywords: 
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - commit()
  - javaV226
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# commit()

This operation commits the appended data.

```java
 public void commit(boolean async)
```

## Request Syntax\{#request-syntax}

```java
localBulkWriter.commit(
    boolean async
)
```

**PARAMETERS:**

- **async** (*boolean*) -

    Whether the commit operation returns immediately after being called.

**RETURN TYPE:**

*void*

## Examples\{#examples}

```java
localBulkWriter.commit(false);
```
