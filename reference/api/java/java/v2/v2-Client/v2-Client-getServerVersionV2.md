---
title: "getServerVersionV2() | Java | v2"
slug: /java/java/v2-Client-getServerVersionV2
sidebar_label: "getServerVersionV2()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets server version information. Use `detail(true)` when you need build time, Git commit, Go version, and deploy mode in addition to the version string. | Java | v2"
type: docx
token: KrSgdfCaJosFp5xwHIAcV0tAnec
sidebar_position: 5
keywords: 
  - Image Search
  - LLMs
  - Machine Learning
  - RAG
  - zilliz
  - zilliz cloud
  - cloud
  - getServerVersionV2()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getServerVersionV2()

This operation gets server version information. Use `detail(true)` when you need build time, Git commit, Go version, and deploy mode in addition to the version string.

```java
public GetServerVersionResp getServerVersionV2(GetServerVersionReq request)
```

## Request Syntax\{#request-syntax}

```java
getServerVersionV2(GetServerVersionReq.builder()
    .detail(Boolean detail)
    .build());
```

**BUILDER METHODS:**

- `detail(Boolean detail)`

    Whether to fetch detailed server build information. Defaults to `Boolean.FALSE`.

**RETURNS:**

*GetServerVersionResp*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when validation fails or the server returns an error for this operation.

## Example\{#example}

```java
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")
    .build());

GetServerVersionResp version = client.getServerVersionV2(GetServerVersionReq.builder()
    .detail(true)
    .build());
System.out.println(version.getVersion());
System.out.println(version.getGitCommit());
```

{/* category: Client; action: CREATE; addedSince: v3.0.x */}
