---
title: "shutdownGracefully() | Java | v2"
slug: /java/java/v2-VolumeFileManager-shutdownGracefully
sidebar_label: "shutdownGracefully()"
beta: false
added_since: false
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Closes the current Volume storage session and releases its resources. | Java | v2"
type: docx
token: F1GvdNp0rosDfCxonr7cJpzcn9w
sidebar_position: 3
keywords: 
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database
  - zilliz
  - zilliz cloud
  - cloud
  - shutdownGracefully()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# shutdownGracefully()

Closes the current Volume storage session and releases its resources.

```java
public void shutdownGracefully()
```

**RETURNS:**

*void*

This operation does not return a value.

**EXCEPTIONS:**

- **Exception**

    Raised when request validation, transport, or server execution fails. Inspect the exception message for the exact failure reason.

## Example\{#example}

```java
manager.shutdownGracefully();
```
