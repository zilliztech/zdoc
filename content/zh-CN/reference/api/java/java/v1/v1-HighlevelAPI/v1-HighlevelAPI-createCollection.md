---
title: "createCollection() | Java | v1"
slug: /java/v1-HighlevelAPI-createCollection
sidebar_label: "createCollection()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法使用简单参数创建集合。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#EHPJdeETBoydmoxWhcocj48Znh0
sidebar_position: 1
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createCollection()

MilvusClient 接口。此方法使用简单参数创建集合。

```java
R<RpcStatus> createCollection(CreateSimpleCollectionParam requestParam);
```

#### CreateSimpleCollectionParam\{#createsimplecollectionparam}

使用 `CreateSimpleCollectionParam.Builder` 构造 `CreateSimpleCollectionParam` 对象。

```java
import io.milvus.param.highlevel.collection.CreateCollectionParam;
CreateSimpleCollectionParam.Builder builder = CreateSimpleCollectionParam.newBuilder();
```

`CreateSimpleCollectionParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(String collectionName)</p></td>
        <td><p>设置集合名称。集合名称不能为空或 null。</p></td>
        <td><p>collectionName：要创建的集合名称。</p></td>
    </tr>
    <tr>
        <td><p>withDimension(int dimension)</p></td>
        <td><p>设置集合向量维度。维度值必须大于 0 且小于 32768。</p></td>
        <td><p>dimension：集合中向量字段的维度数。</p></td>
    </tr>
    <tr>
        <td><p>withMetricType(MetricType metricType)</p></td>
        <td><p>设置 vectorField 的 metricType。即集合使用的距离度量。</p></td>
        <td><p>metricType：集合使用的距离度量。</p></td>
    </tr>
    <tr>
        <td><p>withDescription(String description)</p></td>
        <td><p>设置集合描述。描述可以为空。默认描述为 ""。</p></td>
        <td><p>description：要创建的集合描述。</p></td>
    </tr>
    <tr>
        <td><p>withPrimaryField(String primaryField)</p></td>
        <td><p>设置主字段名称。primaryField 不能为空或 null。默认值为 "id"。</p></td>
        <td><p>primaryField：集合的主字段名称。</p></td>
    </tr>
    <tr>
        <td><p>withVectorField(String vectorField)</p></td>
        <td><p>设置向量字段名称。vectorField 不能为空或 null。默认值为 "vector"。</p></td>
        <td><p>vectorField：向量字段名称。</p></td>
    </tr>
    <tr>
        <td><p>withAutoId(boolean autoId)</p></td>
        <td><p>设置 autoId。默认值为 Boolean.False。</p></td>
        <td><p>autoId：是否为此集合开启 autoId。</p></td>
    </tr>
    <tr>
        <td><p>withSyncLoad(boolean syncLoad)</p></td>
        <td><p>设置 loadCollection 时的 SyncLoad。默认值为 Boolean.True。</p></td>
        <td><p>syncLoad：是否在 loadCollection 时同步加载。</p></td>
    </tr>
    <tr>
        <td><p>withConsistencyLevel(ConsistencyLevelEnum consistencyLevel)</p></td>
        <td><p>设置一致性级别。默认值为 ConsistencyLevelEnum.BOUNDED</p></td>
        <td><p>consistencyLevel：此集合的一致性级别。</p></td>
    </tr>
    <tr>
        <td><p>withPrimaryFieldType(DataType primaryFieldType)</p></td>
        <td><p>设置主字段类型。primaryField 类型不能为空或 null。默认值为 "DataType.Int64"。</p></td>
        <td><p>primaryFieldType：此集合主字段的类型。</p></td>
    </tr>
    <tr>
        <td><p>withMaxLength(Integer maxLength)</p></td>
        <td><p>设置主字段的 maxLength。<br/>如果将主字段指定为 varchar，则必须指定此参数 maxLength</p></td>
        <td><p>maxLength：当主字段指定为 varchar 时，主字段的最大长度。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造 CreateSimpleCollectionParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`CreateSimpleCollectionParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### 返回值\{#returns}

此方法会捕获所有异常，并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 和异常的错误消息。

- 如果 API 调用成功，则返回 `R.Status.Success`。

#### 示例\{#example}

```java
import io.milvus.param.highlevel.collection.*;

CreateSimpleCollectionParam param = CreateSimpleCollectionParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withDimension(VECTOR_DIM)
        .withPrimaryField(ID_FIELD)
        .withVectorField(VECTOR_FIELD)
        .withAutoId(true)
        .build();

R<RpcStatus> response = client.createCollection(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
