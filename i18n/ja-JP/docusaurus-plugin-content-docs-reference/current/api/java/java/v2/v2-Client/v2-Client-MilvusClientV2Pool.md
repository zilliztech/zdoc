---
title: "MilvusClientV2Pool | Java | v2"
slug: /java/java/v2-Client-MilvusClientV2Pool
sidebar_label: "MilvusClientV2Pool"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "MilvusClientV2Pool インスタンスは、MilvusClientV2 オブジェクト用の接続プールです。MilvusClientV2 オブジェクトの数は、接続の頻繁なオープンとクローズを避けるために自動的に増減し、アプリケーションのパフォーマンスを向上させます。 | Java | v2"
type: docx
token: UrjHd9KZKo1Rlfxfj8AcmXNinlg
sidebar_position: 2
keywords: 
  - vector db とは
  - vector databases とは
  - vector databases comparison
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - MilvusClientV2Pool
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# MilvusClientV2Pool

**MilvusClientV2Pool** インスタンスは、MilvusClientV2 オブジェクト用の接続プールです。MilvusClientV2 オブジェクトの数は、接続の頻繁なオープンとクローズを避けるために自動的に増減し、アプリケーションのパフォーマンスを向上させます。

```java
io.milvus.pool.MilvusClientV2Pool
```

## Constructor\{#constructor}

一般的なユースケース向けの client pool を構築します。

```java
MilvusClientV2Pool(PoolConfig poolConfig, ConnectConfig connectConfig);
```

**METHODS:**

- `getClient(String key)`

    プールからアイドル状態の client object を取得します。

    呼び出し元が client を保持すると、その client はアクティブ状態としてマークされ、他の呼び出し元は取得できなくなります。

    - client の数が **MaxTotalPerKey** の値に達した場合、このメソッドは **MaxBlockWaitDuration** の間ブロックされます。

    - **MaxBlockWaitDuration** の経過後もアイドル状態の client が利用できない場合、このメソッドは呼び出し元に null object を返します。

- `returnClient(String key, MilvusClient grpcClient)`

    client object を返却します。client が返却されるとアイドル状態になり、次の呼び出し元を待機します。

    呼び出し元は client が確実に返却されるようにする必要があります。そうしないと、その client はアクティブ状態のままとなり、次の呼び出し元が使用できません。

    key が存在しない場合、または client がこの key group に属していない場合は、例外をスローします。

- `getIdleClientNumber(String key)`

    key group のアイドル状態の client 数を返します。

- `getActiveClientNumber(String key)`

    key group のアクティブ状態の client 数を返します。

- `getTotalIdleClientNumber()`

    すべての key group のアイドル状態の client 数を返します。

- `getTotalActiveClientNumber()`

    すべての key group のアクティブ状態の client 数を返します

- `clear(String key)`

    key group のアイドル状態の client を解放/切断します。

- `clear()`

    すべての key group のアイドル状態の client を解放/切断します。

- `close()`

    すべての key group のすべての client を解放/切断し、プールを閉じます。

## PoolConfig\{#poolconfig}

**PoolConfig** を使用すると、プールに対して特定の設定を行えます。

```java
PoolConfig poolConfig = PoolConfig.builder()
        .maxIdlePerKey(10) // max idle clients per key
        .maxTotalPerKey(20) // max total(idle + active) clients per key
        .maxTotal(100) // max total clients for all keys
        .maxBlockWaitDuration(Duration.ofSeconds(5L)) // getClient() will wait 5 seconds if no idle client available
        .minEvictableIdleDuration(Duration.ofSeconds(10L)) // if number of idle clients is larger than maxIdlePerKey, redundant idle clients will be evicted after 10 seconds
        .build();
```

**BUILDER METHODS:**

- `maxIdlePerKey(int maxIdlePerKey)`

    各 key のアイドル状態の client の最大数です。アイドル状態の client 数がこの数を超えると、一部の client は自動的にクローズされます。デフォルト値は 5 です。

- `minIdlePerKey(int minIdlePerKey)`

    各 key のアイドル状態の client の最小数です。デフォルト値は 0 です。

- `maxTotalPerKey(int maxTotalPerKey)`

    各 key の client の最大数です。アイドル状態の client とアクティブ状態の client の両方を含みます。デフォルト値は 10 です。

- `maxTotal(int maxTotal)`

    client の総最大数です。アイドル状態の client とアクティブ状態の client の両方を含みます。デフォルト値は 50 です。

- `blockWhenExhausted(boolean blockWhenExhausted)`

    client の最大数に達し、かつすべての client がアクティブな場合に、getClient() メソッドを一定時間ブロックします。このフラグが false の場合、client の最大数に達し、かつすべての client がアクティブなとき、getClient() は即座に例外をスローします。デフォルト値は true です。

- `maxBlockWaitDuration(Duration maxBlockWaitDuration)`

    client の最大数に達し、かつすべての client がアクティブな場合の最大ブロック時間です。デフォルト値は 3 秒です。

- `evictionPollingInterval(Duration evictionPollingInterval)`

    各期間ごとに、有効期限切れのアイドル状態の client を削除する eviction action をトリガーします。デフォルト値は 60 秒です。

- `minEvictableIdleDuration(Duration minEvictableIdleDuration)`

    アイドル状態の client は、この期間が経過すると期限切れとなり、削除可能になります。

- `testOnBorrow(boolean testOnBorrow)`

    このフラグが true に設定されている場合、getClient() が呼び出されるたびに、プールは client の grpc connection が終了済みまたはクローズ済みかどうかを確認します。

- `testOnReturn(boolean testOnReturn)`

    このフラグが true に設定されている場合、returnClient() が呼び出されるたびに、プールは client の grpc connection が終了済みまたはクローズ済みかどうかを確認します。

## [ConnectConfig](./v2-Client-ConnectConfig)\{#connectconfigv2-client-connectconfig}

**[MilvusClientV2](./v2-Client-MilvusClientV2#connectconfigv2-client-connectconfig)** ページの説明を参照してください。

## Examples\{#examples}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.pool.PoolConfig;
import io.milvus.pool.MilvusClientV2Pool;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("https://in01-******.aws-us-west-2.vectordb.zillizcloud.com:19531")
        .token("user:password") // replace this with your token
        .build();
        
PoolConfig poolConfig = PoolConfig.builder()
        .maxIdlePerKey(10) // max idle clients per key
        .maxTotalPerKey(20) // max total(idle + active) clients per key
        .maxTotal(100) // max total clients for all keys
        .maxBlockWaitDuration(Duration.ofSeconds(5L)) // getClient() will wait 5 seconds if no idle client available
        .minEvictableIdleDuration(Duration.ofSeconds(10L)) // if number of idle clients is larger than maxIdlePerKey, redundant idle clients will be evicted after 10 seconds
        .build();
MilvusClientV2Pool pool = new MilvusClientV2Pool(poolConfig, connectConfig);

MilvusClientV2 client = pool.getClient("client_name");
try {
    // use the client to do something
} catch (Exception e) {
} finally {
    pool.returnClient("client_name", client); // make sure the client is returned after use
}
```

