---
title: "MilvusClientV2Pool | Java | v2"
slug: /java/java/v2-Client-MilvusClientV2Pool
sidebar_label: "MilvusClientV2Pool"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "MilvusClientV2Pool 实例是 MilvusClientV2 对象的连接池。MilvusClientV2 对象的数量会自动增加或减少，以避免频繁打开和关闭连接，从而提升应用程序性能。 | Java | v2"
type: docx
token: UrjHd9KZKo1Rlfxfj8AcmXNinlg
sidebar_position: 2
keywords: 
  - 什么是向量数据库
  - 什么是向量 Database
  - 向量 Database 对比
  - Faiss
  - zilliz
  - zilliz cloud
  - 云
  - MilvusClientV2Pool
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# MilvusClientV2Pool

**MilvusClientV2Pool** 实例是 MilvusClientV2 对象的连接池。MilvusClientV2 对象的数量会自动增加或减少，以避免频繁打开和关闭连接，从而提升应用程序性能。

```java
io.milvus.pool.MilvusClientV2Pool
```

## 构造函数\{#constructor}

为常见用例构建一个客户端连接池。

```java
MilvusClientV2Pool(PoolConfig poolConfig, ConnectConfig connectConfig);
```

**方法：**

- `getClient(String key)`

    从连接池中获取一个空闲的客户端对象。

    调用方持有该客户端后，它会被标记为活跃状态，其他调用方无法获取。

    - 如果客户端数量达到 **MaxTotalPerKey** 值，此方法将阻塞 **MaxBlockWaitDuration**。

    - 如果在 **MaxBlockWaitDuration** 之后仍没有可用的空闲客户端，此方法将向调用方返回一个 null 对象。

- `returnClient(String key, MilvusClient grpcClient)`

    归还一个客户端对象。客户端归还后，会变为空闲状态并等待下一位调用方使用。

    调用方应确保归还客户端。否则，该客户端将持续处于活跃状态，无法被下一位调用方使用。

    如果 key 不存在，或者该客户端不属于此 key 组，则抛出异常。

- `getIdleClientNumber(String key)`

    返回某个 key 组中的空闲客户端数量。

- `getActiveClientNumber(String key)`

    返回某个 key 组中的活跃客户端数量。

- `getTotalIdleClientNumber()`

    返回所有 key 组中的空闲客户端数量。

- `getTotalActiveClientNumber()`

    返回所有 key 组中的活跃客户端数量

- `clear(String key)`

    释放/disconnect某个 key 组中的空闲客户端。

- `clear()`

    释放/disconnect所有 key 组中的空闲客户端。

- `close()`

    释放/disconnect所有 key 组中的全部客户端，并关闭连接池。

## PoolConfig\{#poolconfig}

**PoolConfig** 允许您为连接池执行特定配置。

```java
PoolConfig poolConfig = PoolConfig.builder()
        .maxIdlePerKey(10) // max idle clients per key
        .maxTotalPerKey(20) // max total(idle + active) clients per key
        .maxTotal(100) // max total clients for all keys
        .maxBlockWaitDuration(Duration.ofSeconds(5L)) // getClient() will wait 5 seconds if no idle client available
        .minEvictableIdleDuration(Duration.ofSeconds(10L)) // if number of idle clients is larger than maxIdlePerKey, redundant idle clients will be evicted after 10 seconds
        .build();
```

**构建器方法：**

- `maxIdlePerKey(int maxIdlePerKey)`

    每个 key 的最大空闲客户端数量。如果空闲客户端数量超过此值，部分客户端将被自动关闭。默认值为 5。

- `minIdlePerKey(int minIdlePerKey)`

    每个 key 的最小空闲客户端数量。默认值为 0。

- `maxTotalPerKey(int maxTotalPerKey)`

    每个 key 的最大客户端数量，包括空闲客户端和活跃客户端。默认值为 10。

- `maxTotal(int maxTotal)`

    客户端总数上限，包括空闲客户端和活跃客户端。默认值为 50。

- `blockWhenExhausted(boolean blockWhenExhausted)`

    当客户端数量达到上限且所有客户端都处于活跃状态时，将 getClient() 方法阻塞一段时间。如果此标志为 false，则当客户端数量达到上限且所有客户端都处于活跃状态时，getClient() 会立即抛出异常。默认值为 true。

- `maxBlockWaitDuration(Duration maxBlockWaitDuration)`

    当客户端数量达到上限且所有客户端都处于活跃状态时的最大阻塞时长。默认值为 3 秒。

- `evictionPollingInterval(Duration evictionPollingInterval)`

    每隔一段时间触发一次驱逐操作，以驱逐已过期的空闲客户端。默认值为 60 秒。

- `minEvictableIdleDuration(Duration minEvictableIdleDuration)`

    空闲客户端在超过此时长后过期，并可被驱逐。

- `testOnBorrow(boolean testOnBorrow)`

    如果此标志设置为 true，则每次调用 getClient() 时，连接池都会检查客户端的 grpc 连接是否已终止或关闭。

- `testOnReturn(boolean testOnReturn)`

    如果此标志设置为 true，则每次调用 returnClient() 时，连接池都会检查客户端的 grpc 连接是否已终止或关闭。

## [ConnectConfig](./v2-Client-ConnectConfig)\{#connectconfigv2-client-connectconfig}

请阅读 **[MilvusClientV2](./v2-Client-MilvusClientV2#connectconfigv2-client-connectconfig)** 页面上的说明。

## 示例\{#examples}

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

