---
title: "getFunctionList() | Java | v2"
slug: /java/java/v2-CollectionSchema-getFunctionList
sidebar_label: "getFunctionList()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この getter は、collection schema で定義された関数のリストを返します。 | Java | v2"
type: docx
token: UJg8dnXiUoB6FnxanBicIzcLnsb
sidebar_position: 6
keywords: 
  - Embedding model
  - 画像類似検索
  - Context Window
  - 自然言語検索
  - zilliz
  - zilliz cloud
  - cloud
  - getFunctionList()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getFunctionList()

この getter は、collection schema で定義された関数のリストを返します。

```java
public List<CreateCollectionReq.Function> getFunctionList()
```

**戻り値:**

*List&lt;CreateCollectionReq.Function&gt;*

**例外:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合に送出されます。

## 例\{#example}

```java
CollectionSchema schema = CollectionSchema.builder().build();
List<CreateCollectionReq.Function> functions = schema.getFunctionList();
```
