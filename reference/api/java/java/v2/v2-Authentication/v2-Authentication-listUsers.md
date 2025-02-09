---
displayed_sidbar: javaSidebar
title: "listUsers() | Java | v2"
slug: /java/java/v2-Authentication-listUsers
sidebar_label: "listUsers()"
beta: false
notebook: false
description: "This operation lists the names of all existing users. | Java | v2"
type: docx
token: EfM3drSXlo4Yzyxq2GpcmvoHnTm
sidebar_position: 10
keywords: 
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - zilliz
  - zilliz cloud
  - cloud
  - listUsers()
  - javaV2
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listUsers()

This operation lists the names of all existing users.

```java
public List<String> listUsers()
```

## Request Syntax{#request-syntax}

```java
listUsers();
```

**RETURN TYPE:**

*List\<String\>*

**RETURNS:**

A list of strings containing the user names.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
List<String> resp = client.listUsers();
```

