---
title: "getName() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getName
sidebar_label: "getName()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回 Array of Structs 字段的名称。 | Java | v2"
type: docx
token: DZcddGCD3oh29txhnB5cuxzzn4d
sidebar_position: 7
keywords: 
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - getName()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getName()

此操作返回 Array of Structs 字段的名称。

```java
public String getName()
```

## 请求语法\{#request-syntax}

```java
getName()
```

**返回类型：**

*String*

**返回：**

返回值将是指定的 Array of Struct 字段的名称。

## 示例\{#examples}

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getName();

// "array_of_structs"
```

