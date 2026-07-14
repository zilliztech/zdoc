---
title: "add() | Java | v2"
slug: /java/java/v2-EmbeddingList-add
sidebar_label: "add()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、EmbeddingList インスタンスにベクトル埋め込みを追加します。 | Java | v2"
type: docx
token: PUOBd229uoQGUIxnHLWcMSidnQh
sidebar_position: 1
keywords: 
  - 非構造化データとは
  - ベクトル埋め込み
  - Vector store
  - オープンソースの vector database
  - zilliz
  - zilliz cloud
  - cloud
  - add()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# add()

この操作は、**[EmbeddingList](./v2-Collections-EmbeddingList)** インスタンスにベクトル埋め込みを追加します。

```java
public void add(BaseVector vector)
```

**PARAMETERS:**

- **vector** (*BaseVector*) -

    現在の EmbeddingList に追加するベクトル埋め込み。 

**RETURN TYPE:**

*[EmbeddingList](./v2-Collections-EmbeddingList)*

**RETURNS:**

他の `add()` メソッドを連結して呼び出すために再利用できる EmbeddingList インスタンス。

**EXCEPTIONS:**

- **MilvusClientException**

    異なる型のベクトル埋め込みが指定された場合に、この例外が発生します。

## 例:\{#examples}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.data.EmbeddingList;
import io.milvus.v2.service.vector.request.data.FloatVec;
        
// 1. Initialize an EmbeddingList
EmbeddingList embeddingList = new EmbeddingList();

// 2. Add vector embedding
embeddingList.add(new FloatVec[0.1, 0.2, 0.3, 0.4, 0.5])
```
