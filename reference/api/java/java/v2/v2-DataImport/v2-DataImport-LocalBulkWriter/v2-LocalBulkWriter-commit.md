---
displayed_sidbar: javaSidebar
title: "commit() | Java | v2"
slug: /java/java/v2-LocalBulkWriter-commit
sidebar_label: "commit()"
beta: false
notebook: false
description: "This operation commits the appended data. | Java | v2"
type: docx
token: OUhTdWnXBoHqKdxTA0HcdMY5n4b
sidebar_position: 3
keywords: 
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases
  - zilliz
  - zilliz cloud
  - cloud
  - commit()
  - javaV225
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# commit()

This operation commits the appended data.

```java
 public void commit(boolean async)
```

## Request Syntax{#request-syntax}

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

## Examples{#examples}

```java
localBulkWriter.commit(false);
```
