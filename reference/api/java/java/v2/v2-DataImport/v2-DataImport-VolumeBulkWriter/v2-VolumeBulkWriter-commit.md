---
title: "commit() | Java | v2"
slug: /java/java/v2-VolumeBulkWriter-commit
sidebar_label: "commit()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation commits the appended data. | Java | v2"
type: docx
token: V39Ady6thoD9cCxBcopcquFKnzc
sidebar_position: 3
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
  - zilliz
  - zilliz cloud
  - cloud
  - commit()
  - javaV230
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
volumeBulkWriter.commit(
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
volumeBulkWriter.commit(false);
```

