---
title: "add() | Java | v2"
slug: /java/java/v2-EmbeddingList-add
sidebar_label: "add()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、EmbeddingList インスタンスにベクトル埋め込みを追加します。 | Java | v2"
type: docx
token: CJcWdpdqLoZiEExhfagc9A0jnag
sidebar_position: 36
keywords: 
  - 非構造化データとは
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースのベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - add()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# add()

この操作は、**[EmbeddingList](./v2-Collections-EmbeddingList)** インスタンスにベクトル埋め込みを追加します。

```java
public void add(BaseVector vector)
```

**パラメーター:**

- **ベクトル**（*BaseVector*） -

    現在の EmbeddingList に追加するベクトル埋め込み。

**例外:**

- **MilvusClientException**

    異なるタイプのベクトル埋め込みが提供された場合に、この例外が発生します。

## 例\{#examples}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.data.EmbeddingList;
import io.milvus.v2.service.vector.request.data.FloatVec;

// 1. Initialize an EmbeddingList
EmbeddingList embeddingList = new EmbeddingList();

// 2. Add vector embedding
embeddingList.add(new FloatVec(new float[]{0.1f, 0.2f, 0.3f, 0.4f, 0.5f}));
```
