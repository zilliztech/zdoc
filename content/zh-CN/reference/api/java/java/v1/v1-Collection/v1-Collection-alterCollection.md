---
title: "alterCollection() | Java | v1"
slug: /java/v1-Collection-alterCollection
sidebar_label: "alterCollection()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "修改集合属性。目前支持修改集合数据的生存时间（TTL）以及启用集合的 MMap。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#Ms4Udr3rPo9BEmxRpF9cdk9hnbg
sidebar_position: 7
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# alterCollection()

修改集合属性。目前支持修改集合数据的生存时间（TTL）以及启用集合的 MMap。

```java
R<RpcStatus> alterCollection(AlterCollectionParam requestParam);
```

#### AlterCollectionParam\{#altercollectionparam}

使用 `AlterCollectionParam.Builder` 构造 `AlterCollectionParam` 对象。

```java
import io.milvus.param.AlterCollectionParam;
AlterCollectionParam.Builder builder = AlterCollectionParam.newBuilder();
```

`AlterCollectionParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(String collectionName)</p></td>
        <td><p>设置集合名称。集合名称不能为空或 null。</p></td>
        <td><p>collectionName: 要修改属性的集合名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，数据库名称可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withTTL(Integer ttlSeconds)</p></td>
        <td><p>集合生存时间（TTL）是集合中数据的过期时间。集合中过期的数据将被清理，并且不会参与搜索或查询。TTL 的单位为秒。<br/>此方法在内部调用 withProperty() 来设置值。</p></td>
        <td><p>ttlSeconds: 生存时间值。该值应大于或等于 0。</p></td>
    </tr>
    <tr>
        <td><p>withMMapEnabled(boolean enabledMMap)</p></td>
        <td><p>是否为原始数据文件启用 MMap。<br/>此方法在内部调用 withProperty() 来设置值。</p></td>
        <td><p>enabledMMap: 设置为 true 以启用 MMap。</p></td>
    </tr>
    <tr>
        <td><p>withProperty(String key,  String value)</p></td>
        <td><p>用于设置键值属性的基础方法。</p></td>
        <td><p>key: 属性的键。<br/>value: 属性的值。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 AlterCollectionParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`AlterCollectionParam.Builder.build()` 可能抛出以下异常：

- ParamException: 当参数无效时抛出错误。

#### Returns\{#returns}

此方法会捕获所有异常并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 以及该异常的错误消息。

- 如果 API 执行成功，则返回 `R.Status.Success`。

#### Example\{#example}

```java
import io.milvus.param.*;

AlterCollectionParam param = AlterCollectionParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withTTL(1800)
        .build();
R<RpcStatus> response = client.alterCollection(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
