---
title: "getStructField() | Java | v2"
slug: /java/java/v2-CollectionSchema-getStructField
sidebar_label: "getStructField()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この getter は、collection schema から名前で struct field schema を返します。 | Java | v2"
type: docx
token: KJSvdrks9o6WOsxr0rZcPXe5ngn
sidebar_position: 7
keywords: 
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似検索
  - マルチモーダル RAG
  - zilliz
  - zilliz cloud
  - cloud
  - getStructField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getStructField()

この getter は、collection schema から名前で struct field schema を返します。

```java
public CreateCollectionReq.StructFieldSchema getStructField(String fieldName)
```

**PARAMETERS:**

- **fieldName** (*String*) -

    struct field の名前。

**RETURNS:**

*CreateCollectionReq.StructFieldSchema*

**EXCEPTIONS:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```java
CollectionSchema schema = CollectionSchema.builder().build();
CreateCollectionReq.StructFieldSchema structField = schema.getStructField("metadata");
```
