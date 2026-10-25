---
title: "getCompactionPlans() | Java | v2"
slug: /java/java/v2-Management-getCompactionPlans
sidebar_label: "getCompactionPlans()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、どのセグメントが結合されるかを示すマージプランを含め、特定の Compaction ジョブの Compaction プランを返します。 | Java | v2"
type: docx
token: BDNBdbEOioqnlKxRd3DcY7wRncg
sidebar_position: 23
keywords: 
  - ベクトルデータベースとは
  - ベクトルデータベースの比較
  - Faiss
  - 動画検索
  - zilliz
  - zilliz cloud
  - クラウド
  - getCompactionPlans()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getCompactionPlans()

この操作は、どのセグメントが結合されるかを示すマージプランを含め、特定の Compaction ジョブの Compaction プランを返します。

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

**ビルダーメソッド：**

- `compactionID(Long compactionID)` -

    **[必須]**

    `compact()` によって返される Compaction ジョブの ID です。

**戻り値の型：**

*GetCompactionPlansResp*

**戻り値：**

レスポンスには、Compaction の状態とマージプランが含まれます。

**パラメーター：**

- **compactionId** (*Long*) -

    Compaction ジョブの ID です。

- **state** (*CompactionState*) -

    Compaction ジョブの状態です。指定可能な値は、`UndefiedState(0)`、`Executing(1)`、`Completed(2)` です。

- **plans** (*List&lt;CompactionPlan&gt;*) -

    マージプランのリストです。各マージプランは、次のフィールドを含む **CompactionPlan** オブジェクトです。

    - **target** (*Long*) -

        ソースセグメントの結合先となるターゲットセグメントの ID です。

    - **sources** (*List&lt;Long&gt;*) -

        ターゲットセグメントに結合されるソースセグメントの ID です。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

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
