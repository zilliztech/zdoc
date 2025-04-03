---
displayed_sidbar: javaSidebar
title: "listRoles() | Java | v2"
slug: /java/java/v2-Authentication-listRoles
sidebar_label: "listRoles()"
beta: false
notebook: false
description: "This operation lists all custom roles. | Java | v2"
type: docx
token: XIIyd3bMzoAVx3xVsoLcnQ2pnKh
sidebar_position: 14
keywords: 
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - zilliz
  - zilliz cloud
  - cloud
  - listRoles()
  - javaV225
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listRoles()

This operation lists all custom roles.

```java
public List<String> listRoles()
```

## Request Syntax{#request-syntax}

```java
MilvusClientV2 client = new MilvusClientV2(connectConfig);

List<String> roles = client.listRoles();
```

**RETURN TYPE:**

*List\<String\>*

**RETURNS:**

A list of strings containing the role names.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
List<String> roles = client.listRoles();
```

