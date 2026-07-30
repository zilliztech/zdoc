---
displayed_sidbar: javaSidebar
title: "commit() | Java | v2"
slug: /java/java/v2-RemoteBulkWriter-commit
sidebar_label: "commit()"
added_since: v2.5.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation commits the appended data. | Java | v2"
type: docx
token: SJ3ndk2d7oQbAOxP5iHcGtr1nrb
sidebar_position: 3
keywords: 
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
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
remoteBulkWriter.commit(
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
remoteBulkWriter.commit(false);
```
