---
displayed_sidbar: javaSidebar
title: "commit() | Java | v2"
slug: /java/java/v2-LocalBulkWriter-commit
sidebar_label: "commit()"
added_since: v2.5.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation commits the appended data. | Java | v2"
type: docx
token: OUhTdWnXBoHqKdxTA0HcdMY5n4b
sidebar_position: 3
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - commit()
  - javaV226
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# commit()

This operation commits the appended data.

```java
 public void commit(boolean async)
```

## Request Syntax

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

## Examples

```java
localBulkWriter.commit(false);
```
