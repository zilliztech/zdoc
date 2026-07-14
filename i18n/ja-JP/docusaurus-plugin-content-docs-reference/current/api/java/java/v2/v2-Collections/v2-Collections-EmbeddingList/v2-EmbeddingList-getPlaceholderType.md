---
title: "getPlaceholderType() | Java | v2"
slug: /java/java/v2-EmbeddingList-getPlaceholderType
sidebar_label: "getPlaceholderType()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この getter は embedding list の placeholder type を返します。これは vector データ形式を示します。 | Java | v2"
type: docx
token: D0UGdkudVo5vtLxlZw3c6cdqnmc
sidebar_position: 4
keywords: 
  - マネージド vector データベース
  - Pinecone vector データベース
  - 音声検索
  - セマンティック検索とは
  - zilliz
  - zilliz cloud
  - クラウド
  - getPlaceholderType()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getPlaceholderType()

この getter は embedding list の placeholder type を返します。これは vector データ形式を示します。

```java
public PlaceholderType getPlaceholderType()
```

**戻り値:**

*PlaceholderType*

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```java
EmbeddingList embeddingList = new EmbeddingList();
PlaceholderType type = embeddingList.getPlaceholderType();
```
