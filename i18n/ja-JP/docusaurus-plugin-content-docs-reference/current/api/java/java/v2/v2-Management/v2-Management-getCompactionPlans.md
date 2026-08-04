---
title: "getCompactionPlans() | Java | v2"
slug: /java/java/v2-Management-getCompactionPlans
sidebar_label: "getCompactionPlans()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、どのセグメントが結合されるかを示すマージプランを含め、特定の compaction ジョブの compaction プランを返します。 | Java | v2"
type: docx
token: BDNBdbEOioqnlKxRd3DcY7wRncg
sidebar_position: 23
keywords: 
  - vector database とは
  - vector database の比較
  - Faiss
  - 動画検索
  - zilliz
  - zilliz cloud
  - クラウド
  - getCompactionPlans()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getCompactionPlans()

この操作は、どのセグメントが結合されるかを示すマージプランを含め、特定の compaction ジョブの compaction プランを返します。

```java
public GetCompactionPlansResp getCompactionPlans(GetCompactionPlansReq request)
```

## リクエスト構文\{#request-syntax}

```java
getCompactionPlans(GetCompactionPlansReq.builder()
    .compactionID(Long compactionID)
    .build()
);
```

**BUILDER メソッド:**

- `compactionID(Long compactionID)` -

    **[必須]**

    `compact()` によって返される compaction ジョブの ID。

**戻り値:**

*GetCompactionPlansResp*

レスポンスには、compaction の状態とマージプランが含まれます。

**例外:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```java
import io.milvus.v2.service.utility.request.GetCompactionPlansReq;
import io.milvus.v2.service.utility.response.GetCompactionPlansResp;

GetCompactionPlansResp plans = client.getCompactionPlans(
    GetCompactionPlansReq.builder()
        .compactionID(jobId)
        .build()
);
System.out.println(plans);
```
