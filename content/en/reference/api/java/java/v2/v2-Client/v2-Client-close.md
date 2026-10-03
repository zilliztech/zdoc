---
title: "close() | Java | v2"
slug: /java/java/v2-Client-close
sidebar_label: "close()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation closes the client and releases the underlying gRPC channel, cancelling pending async retries and waiting up to one minute for in-flight calls to finish. | Java | v2"
type: docx
token: TX2vdOOxtomTrQxK4EbcjxPCn1g
sidebar_position: 4
keywords: 
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - zilliz
  - zilliz cloud
  - cloud
  - close()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# close()

This operation closes the client and releases the underlying gRPC channel, cancelling pending async retries and waiting up to one minute for in-flight calls to finish.

```java
public void close()
```

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Example\{#example}

Close the client after all operations are complete.

```java
client.close();
```
