---
title: "getParams() | Java | v2"
slug: /java/java/v2-FunctionScore-getParams
sidebar_label: "getParams()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この getter は、この FunctionScore オブジェクトのパラメータマップを返します。 | Java | v2"
type: docx
token: DUJsdflImor0joxV14ecSwpnnDb
sidebar_position: 4
keywords: 
  - AI チャットボット
  - cosine distance
  - vector database とは
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - getParams()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getParams()

この getter は、この FunctionScore オブジェクトのパラメータマップを返します。

```java
public Map<String, String> getParams()
```

**戻り値:**

*Map&lt;String, String&gt;*

**例外:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## Example\{#example}

```java
FunctionScore score = FunctionScore.builder()
    .params(Map.of("weight", "0.8"))
    .build();
Map<String, String> params = score.getParams();
```
