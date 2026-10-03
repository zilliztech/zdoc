---
title: "FunctionType | Java | v2"
slug: /java/java/v2-Function-FunctionType
sidebar_label: "FunctionType"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Represents the supported server-side function types and provides conversion by name or numeric code. | Java | v2"
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

Represents the supported server-side function types and provides conversion by name or numeric code.

```java
public enum FunctionType
```

## Constants\{#constants}

### UNKNOWN(0)\{#unknown0}

Represents an unknown or unsupported function type. `fromName()` and `fromCode()` return this value when no match is found.

### BM25(1)\{#bm251}

Represents the BM25 full-text scoring function.

### TEXTEMBEDDING(2)\{#textembedding2}

Represents a text-embedding function.

### RERANK(3)\{#rerank3}

Represents a reranking function.

### MINHASH(4)\{#minhash4}

Represents a MinHash function.

### MOLFINGERPRINT(5)\{#molfingerprint5}

Represents a molecular-fingerprint function.

**RETURNS:**

*FunctionType*

An enum value describing the server-side function type.

## Example\{#example}

```java
FunctionType byName = FunctionType.fromName("MinHash");
FunctionType byCode = FunctionType.fromCode(5);

int code = byName.getCode();
String name = byCode.getName();
```
