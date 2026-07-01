---
title: "commit() | Java | v2"
slug: /java/java/v2-VolumeBulkWriter-commit
sidebar_key: java/v2-VolumeBulkWriter-commit
sidebar_label: "commit()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation commits the appended data. | Java | v2"
type: docx
token: V39Ady6thoD9cCxBcopcquFKnzc
sidebar_position: 3
keywords: 
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz
  - zilliz
  - zilliz cloud
  - cloud
  - commit()
  - javaV230
displayed_sidebar: javaSidebar

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

