---
title: "MilvusClientV1Pool | Java | v1"
slug: /java/v1-Connections-MilvusClientV1Pool
sidebar_label: "MilvusClientV1Pool"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClientV1Pool 实例是 MilvusClient 对象的连接池。MilvusClient 对象的数量会自动增加或减少，以避免频繁打开和关闭连接，从而提升应用程序性能。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#QPdGdvQkuoSQ7pxYAJ8cz3Konmc
sidebar_position: 2
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# MilvusClientV1Pool

MilvusClientV1Pool 实例是 MilvusClient 对象的连接池。MilvusClient 对象的数量会自动增加或减少，以避免频繁打开和关闭连接，从而提升应用程序性能。

用于连接的 MilvusClient 方法：

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>参数</strong></p></th>
     <th><p><strong>返回值</strong></p></th>
   </tr>
   <tr>
     <td><p>getClient(String key)</p></td>
     <td><p>从连接池中获取一个空闲的客户端对象。</p><p>一旦调用方持有该客户端，它将被标记为活跃状态，其他调用方将无法获取。</p><p>如果客户端数量达到 MaxTotalPerKey 值，此方法将阻塞 MaxBlockWaitDuration。</p><p>如果在 MaxBlockWaitDuration 之后仍无可用的空闲客户端，此方法将向调用方返回一个 null 对象。</p></td>
     <td><p>key: 客户端所属组的键</p></td>
     <td><p>MilvusClient</p></td>
   </tr>
   <tr>
     <td><p>returnClient(String key, MilvusClient grpcClient)</p></td>
     <td><p>归还一个客户端对象。客户端归还后会变为空闲状态，并等待下一个调用方使用。</p><p>调用方应确保客户端被归还。否则，该客户端将持续处于活跃状态，无法被下一个调用方使用。</p><p>如果 key 不存在，或者该客户端不属于此 key 组，则会抛出异常。</p></td>
     <td><p>key: 客户端所属组的键</p><p>grpcClient: 要归还的客户端对象</p></td>
     <td><p>void</p></td>
   </tr>
   <tr>
     <td><p>getIdleClientNumber(String key)</p></td>
     <td><p>返回某个 key 组的空闲客户端数量。</p></td>
     <td><p>key: 组的键</p></td>
     <td><p>int</p></td>
   </tr>
   <tr>
     <td><p>getActiveClientNumber(String key)</p></td>
     <td><p>返回某个 key 组的活跃客户端数量。</p></td>
     <td><p>key: 组的键</p></td>
     <td><p>int</p></td>
   </tr>
   <tr>
     <td><p>getTotalIdleClientNumber()</p></td>
     <td><p>返回所有 key 组的空闲客户端总数。</p></td>
     <td></td>
     <td><p>int</p></td>
   </tr>
   <tr>
     <td><p>getTotalActiveClientNumber()</p></td>
     <td><p>返回所有 key 组的活跃客户端总数</p></td>
     <td></td>
     <td><p>int</p></td>
   </tr>
   <tr>
     <td><p>clear(String key)</p></td>
     <td><p>释放/断开某个 key 组中的空闲客户端。</p></td>
     <td><p>key: 组的键</p></td>
     <td><p>void</p></td>
   </tr>
   <tr>
     <td><p>clear()</p></td>
     <td><p>释放/断开所有 key 组中的空闲客户端。</p></td>
     <td></td>
     <td><p>void</p></td>
   </tr>
   <tr>
     <td><p>close()</p></td>
     <td><p>释放/断开所有 key 组中的所有客户端，并关闭连接池。</p></td>
     <td></td>
     <td><p>void</p></td>
   </tr>
</table>

#### PoolConfig\{#poolconfig}

使用 PoolConfig.PoolConfigBuilder 构建 PoolConfig。

```java
import io.milvus.pool.PoolConfig;
PoolConfig.PoolConfigBuilder builder = PoolConfig.builder();
```

PoolConfig.PoolConfigBuilder 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>maxIdlePerKey(int maxIdlePerKey)</p></td>
        <td><p>每个 key 的最大空闲客户端数量。如果空闲客户端数量超过该值，部分客户端将被自动关闭。默认值为 5。</p></td>
        <td><p>maxIdlePerKey: 最大空闲客户端数量。</p></td>
    </tr>
    <tr>
        <td><p>minIdlePerKey(int minIdlePerKey)</p></td>
        <td><p>每个 key 的最小空闲客户端数量。默认值为 0。</p></td>
        <td><p>minIdlePerKey: 最小空闲客户端数量。</p></td>
    </tr>
    <tr>
        <td><p>maxTotalPerKey(int maxTotalPerKey)</p></td>
        <td><p>每个 key 的最大客户端数量，包括空闲客户端和活跃客户端。默认值为 10。</p></td>
        <td><p>maxTotalPerKey: 最大客户端数量</p></td>
    </tr>
    <tr>
        <td><p>maxTotal(int maxTotal)</p></td>
        <td><p>客户端总数的最大值，包括空闲客户端和活跃客户端。默认值为 50。</p></td>
        <td><p>maxTotal: 最大客户端数量。</p></td>
    </tr>
    <tr>
        <td><p>blockWhenExhausted(boolean blockWhenExhausted)</p></td>
        <td><p>当达到最大客户端数量且所有客户端都处于活跃状态时，使 getClient() 方法阻塞一段时间。如果该标志为 false，则当达到最大客户端数量且所有客户端都处于活跃状态时，getClient() 会立即抛出异常。默认值为 true。</p></td>
        <td><p>blockWhenExhausted: 设置为 true 时，当连接池已满会阻塞 getClient()。</p></td>
    </tr>
    <tr>
        <td><p>maxBlockWaitDuration(Duration maxBlockWaitDuration)</p></td>
        <td><p>当达到最大客户端数量且所有客户端都处于活跃状态时的最大阻塞时长。默认值为 3 秒。</p></td>
        <td><p>maxBlockWaitDuration: 阻塞 getClient() 的时长。</p></td>
    </tr>
    <tr>
        <td><p>evictionPollingInterval(Duration evictionPollingInterval)</p></td>
        <td><p>按设定时长触发一次清理操作，以清除已过期的空闲客户端。默认值为 60 秒。</p></td>
        <td><p>evictionPollingInterval: 触发清理操作的间隔。</p></td>
    </tr>
    <tr>
        <td><p>minEvictableIdleDuration(Duration minEvictableIdleDuration)</p></td>
        <td><p>空闲客户端在达到该时长后会过期，并可被清理。</p></td>
        <td><p>minEvictableIdleDuration: 清理空闲客户端的时长阈值。</p></td>
    </tr>
    <tr>
        <td><p>testOnBorrow(boolean testOnBorrow)</p></td>
        <td><p>如果此标志设置为 true，则每次调用 getClient() 时，连接池都会检查客户端的 grpc 连接是否已终止或关闭。</p></td>
        <td><p>testOnBorrow: 设置为 true 时，在调用 getClient() 时检查连接。</p></td>
    </tr>
    <tr>
        <td><p>testOnReturn(boolean testOnReturn)</p></td>
        <td><p>如果此标志设置为 true，则每次调用 returnClient() 时，连接池都会检查客户端的 grpc 连接是否已终止或关闭。</p></td>
        <td><p>testOnReturn: 设置为 true 时，在调用 returnClient() 时检查连接。</p></td>
    </tr>
</table>

#### 示例\{#example}

```java
import io.milvus.param.ConnectParam
import io.milvus.pool.PoolConfig
import io.milvus.pool.MilvusClientV1Pool
import io.milvus.client.MilvusClient

ConnectParam connectConfig = ConnectParam.newBuilder()
        .withHost("localhost")
        .withPort(19530)
        .build();
PoolConfig poolConfig = PoolConfig.builder()
        .maxIdlePerKey(10) // max idle clients per key
        .maxTotalPerKey(20) // max total(idle + active) clients per key
        .maxTotal(100) // max total clients for all keys
        .maxBlockWaitDuration(Duration.ofSeconds(5L)) // getClient() will wait 5 seconds if no idle client available
        .minEvictableIdleDuration(Duration.ofSeconds(10L)) // if number of idle clients is larger than maxIdlePerKey, redundant idle clients will be evicted after 10 seconds
        .build();
MilvusClientV1Pool pool;

MilvusClient client = pool.getClient("client_name");
try {
    // use the client to do something
} catch (Exception e) {
} finally {
    pool.returnClient("client_name", client); // make sure the client is returned after use
}
```

