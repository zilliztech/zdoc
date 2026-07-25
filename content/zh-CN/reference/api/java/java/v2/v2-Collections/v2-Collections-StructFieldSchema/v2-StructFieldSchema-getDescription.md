---
displayed_sidbar: javaSidebar
title: "getDescription() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getDescription
sidebar_label: "getDescription()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation returns the description of an Array of Structs field. | Java | v2"
type: docx
token: QbfPdyw7EoXpGwxSkGgcytBBnAb
sidebar_position: 2
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - getDescription()
  - javaV226
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getDescription()

This operation returns the description of an Array of Structs field.

```java
public String getDescription()
```

## Request Syntax

```java
getDescription()
```

**RETURN TYPE:**

*String*

**RETURNS:**

The return value will be the description of the specified Array of Struct field.

## Examples

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getDescription();

// ""
```

