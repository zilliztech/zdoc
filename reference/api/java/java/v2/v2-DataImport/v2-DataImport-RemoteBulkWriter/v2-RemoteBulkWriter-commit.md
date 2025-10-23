---
title: "commit() | Java | v2"
slug: /java/java/v2-RemoteBulkWriter-commit
sidebar_label: "commit()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation commits the appended data. | Java | v2"
type: docx
token: SJ3ndk2d7oQbAOxP5iHcGtr1nrb
sidebar_position: 3
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - commit()
  - javaV225
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# commit()

This operation commits the appended data.

```java
 public void commit(boolean async)
```

## Request Syntax{#request-syntax}

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

## Examples{#examples}

```java
remoteBulkWriter.commit(false);
```
