---
title: "FunctionType | Java | v2"
slug: /java/java/v2-Function-FunctionType
sidebar_label: "FunctionType"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "表示受支持的服务端函数类型，并提供按名称或数值代码进行转换的能力。 | Java | v2"
type: docx
token: HShjdZsU3oknh2x1ezkcRqGqn6b
sidebar_position: 4
keywords: 
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - FunctionType
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# FunctionType

表示受支持的服务端函数类型，并提供按名称或数值代码进行转换的能力。

```java
public enum FunctionType
```

## 常量\{#constants}

### UNKNOWN(0)\{#unknown0}

表示未知或不受支持的函数类型。当未找到匹配项时，`fromName()` 和 `fromCode()` 会返回此值。

### BM25(1)\{#bm251}

表示 BM25 全文评分函数。

### TEXTEMBEDDING(2)\{#textembedding2}

表示文本嵌入函数。

### RERANK(3)\{#rerank3}

表示重排函数。

### MINHASH(4)\{#minhash4}

表示 MinHash 函数。

### MOLFINGERPRINT(5)\{#molfingerprint5}

表示分子指纹函数。

**返回：**

*FunctionType*

用于描述服务端函数类型的枚举值。

## 示例\{#example}

```java
FunctionType byName = FunctionType.fromName("MinHash");
FunctionType byCode = FunctionType.fromCode(5);

int code = byName.getCode();
String name = byCode.getName();
```
