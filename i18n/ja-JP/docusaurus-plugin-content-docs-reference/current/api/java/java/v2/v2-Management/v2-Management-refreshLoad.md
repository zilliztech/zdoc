---
title: "refreshLoad() | Java | v2"
slug: /java/java/v2-Management-refreshLoad
sidebar_label: "refreshLoad()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は主に、bulkImport リクエストによって新しい segment が生成された際に使用され、新しい segment を強制的にメモリにロードします。 | Java | v2"
type: docx
token: Njodd6A2romru0xEX3cckwPlnpb
sidebar_position: 15
keywords: 
  - 自然言語処理
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - zilliz
  - zilliz cloud
  - クラウド
  - refreshLoad()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# refreshLoad()

この操作は主に、bulkImport リクエストによって新しい segment が生成された際に使用され、新しい segment を強制的にメモリにロードします。

```java
public void refreshLoad(RefreshLoadReq request)
```

## リクエスト構文\{#request-syntax}

```java
refreshLoad(RefreshLoadReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .async(Boolean async)
    .sync(Boolean sync)
    .timeout(Long timeout)
    .build()
);
```

**BUILDER メソッド:**

- `databaseName(String databaseName)` -

    データベースの名前です。指定しない場合は、現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)` -

    対象コレクションの名前です。

- `async(Boolean async)` -

    操作を非同期で実行するかどうか。デフォルトは `Boolean.TRUE` です。

- `sync(Boolean sync)` -

    操作が完了するまで同期的に待機するかどうか。デフォルトは `Boolean.TRUE` です。

- `timeout(Long timeout)` -

    タイムアウト時間（ミリ秒単位）です。デフォルトは `60000L` です。

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.RefreshLoadReq;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Refresh the load status of the collection \`test\`
RefreshLoadReq refreshLoadReq = RefreshLoadReq.builder()
        .collectionName("test")
        .build();
client.refreshLoad(refreshLoadReq);
```
