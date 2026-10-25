---
title: "getCompactionState() | Java | v2"
slug: /java/java/v2-Management-getCompactionState
sidebar_label: "getCompactionState()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定の Compaction 操作の状態を取得します。 | Java | v2"
type: docx
token: A2Vpd1kXsoF5uexKYb8ckcGMnWe
sidebar_position: 8
keywords: 
  - LLM ハルシネーション
  - ハイブリッド検索
  - 字句検索
  - 最近傍検索
  - zilliz
  - zilliz cloud
  - クラウド
  - getCompactionState()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getCompactionState()

この操作は、特定の Compaction 操作の状態を取得します。

```java
public GetCompactionStateResp getCompactionState(GetCompactionStateReq request)
```

## リクエスト構文\{#request-syntax}

```java
getCompactionState(GetCompactionStateReq.builder()
    .compactionID(Long compactionID)
    .build();
)
```

**BUILDER メソッド:**

- `compactionID(Long compactionID)`

    Compaction 操作の ID です。この ID は、`compact()` 呼び出しによって返されます。

**戻り値の型:**

*GetCompactionStateResp*

**戻り値:**

以下のパラメーターを含む GetCompactionStateResp インスタンスです。

**パラメーター:**

- **state** (*CompactionState*) -

    指定された Compaction 操作の現在の状態です。取り得る値は次のとおりです。

    - UndefiedState(0)

    - Executing(1)

    - Completed(2)

- **executingPlanNo** (*Long*) -

    対応する実行プランの ID です。

- **timeoutPlanNo** (*Long*) -

    タイムアウトプランの ID です。

- **completedPlanNo** (*Long*) -

    完了したプランの ID です。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.CompactReq;
import io.milvus.v2.service.utility.request.GetCompactionStateReq;
import io.milvus.v2.service.utility.response.CompactResp;
import io.milvus.v2.service.utility.response.GetCompactionStateResp;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Compact a collection
client.compact(CompactReq.builder()
    .collectionName("my_collection")
    .build());

// 3. Get the compaction status
client.getCompactionState(GetCompactionStateReq.builder()
    .compactionID(3431948932481L)
    .build());
```
