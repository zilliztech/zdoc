---
title: "flush() | Java | v2"
slug: /java/java/v2-Management-flush
sidebar_label: "flush()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はストリーミングデータをディスクにフラッシュし、現在のセグメントをシールします。 | Java | v2"
type: docx
token: SfTCdUemEoNBDbxvn7PcHguFnPn
sidebar_position: 7
keywords: 
  - ANNS
  - ベクトル検索
  - kNN アルゴリズム
  - HNSW
  - zilliz
  - zilliz cloud
  - クラウド
  - flush()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# flush()

この操作はストリーミングデータをディスクにフラッシュし、現在のセグメントをシールします。

```java
public void flush(FlushReq request)
```

## リクエスト構文\{#request-syntax}

```java
flush(FlushReq.builder()
    .databaseName(String databaseName)
    .collectionNames(List<String> collectionNames)
    .waitFlushedTimeoutMs(Long waitFlushedTimeoutMs)
    .build()
);
```

**ビルダーメソッド：**

- `databaseName(String databaseName)` -

    データベース名です。指定しない場合は、現在のデータベースがデフォルトになります。

- `collectionNames(List<String> collectionNames)` -

    コレクション名のリストです。

- `waitFlushedTimeoutMs(Long waitFlushedTimeoutMs)` -

    フラッシュの完了を待機するタイムアウト時間（ミリ秒）です。

**例外：**

- **MilvusClientException**

    この操作中に何らかのエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.FlushReq;
import java.util.Collections;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Flush a collection
client.flush(FlushReq.builder()
    .collectionNames(Collections.singletonList("my_collection"))
    .build());
```
