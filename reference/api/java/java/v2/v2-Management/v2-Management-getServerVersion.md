---
title: "getServerVersion() | Java | v2"
slug: /java/java/v2-Management-getServerVersion
sidebar_key: java/v2-Management-getServerVersion
sidebar_label: "getServerVersion()"
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
beta: false
notebook: false
description: "This operation returns the version string of the connected . | Java | v2"
type: docx
token: FuDHdadxHoX9qSxe4aac4wzNnRh
sidebar_position: 23
keywords: 
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - zilliz
  - zilliz cloud
  - cloud
  - getServerVersion()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getServerVersion()

This operation returns the version string of the connected .

```java
public String getServerVersion()
```

**RETURNS:**

*String*

The version string of the server (e.g., `"2.6.13"`).

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
String version = client.getServerVersion();
System.out.println(version); // "2.6.13"
```
