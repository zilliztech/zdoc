---
title: "getFunctions() | Java | v2"
slug: /java/java/v2-FunctionScore-getFunctions
sidebar_label: "getFunctions()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この getter は、この FunctionScore オブジェクトで定義された関数のリストを返します。 | Java | v2"
type: docx
token: RsqKdZaMnoHbaRxYr1fcqRbRnth
sidebar_position: 3
keywords: 
  - Vector Dimension
  - ANN Search
  - ベクトル埋め込みとは
  - vector database tutorial
  - zilliz
  - zilliz cloud
  - cloud
  - getFunctions()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getFunctions()

この getter は、この FunctionScore オブジェクトで定義された関数のリストを返します。

```java
public List<CreateCollectionReq.Function> getFunctions()
```

**戻り値:**

*List&lt;CreateCollectionReq.Function&gt;*

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```java
FunctionScore score = FunctionScore.builder()
    .addFunction(func)
    .build();
List<CreateCollectionReq.Function> functions = score.getFunctions();
```
