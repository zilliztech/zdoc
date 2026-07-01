---
title: "commit() | Java | v2"
slug: /java/java/v2-RemoteBulkWriter-commit
sidebar_key: java/v2-RemoteBulkWriter-commit
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
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
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
remoteBulkWriter.commit(
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
remoteBulkWriter.commit(false);
```
