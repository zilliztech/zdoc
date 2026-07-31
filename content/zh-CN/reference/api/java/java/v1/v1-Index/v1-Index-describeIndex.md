---
title: "describeIndex() | Java | v1"
slug: /java/v1-Index-describeIndex
sidebar_label: "describeIndex()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法显示指定索引的信息。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#NEewdHY5MoS1o1xsSeFcCeicnld
sidebar_position: 3
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# describeIndex()

MilvusClient 接口。此方法显示指定索引的信息。

```java
R<DescribeIndexResponse> describeIndex(DescribeIndexParam requestParam);
```

#### DescribeIndexParam\{#describeindexparam}

使用 `DescribeIndexParam.Builder` 构建 `DescribeIndexParam` 对象。

```java
import io.milvus.param.DescribeIndexParam;
DescribeIndexParam.Builder builder = DescribeIndexParam.newBuilder();
```

`DescribeIndexParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(collectionName)</p></td>
        <td><p>设置集合名称。集合名称不能为空或 null。</p></td>
        <td><p>collectionName: 目标集合名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，数据库名称可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withIndexName(String indexName)</p></td>
        <td><p>设置目标索引名称。如果未指定索引名称，则默认索引名称为空字符串，这表示由服务器决定。</p></td>
        <td><p>indexName: 索引名称。</p></td>
    </tr>
    <tr>
        <td><p>withFieldName(String fieldName)</p></td>
        <td><p>设置目标字段名称。字段名称可以为空或 null。<br/>如果未指定字段名称，则返回此集合上的所有索引。</p></td>
        <td><p>fieldName: 字段名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构建一个 DescribeIndexParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`DropIndexParam.Builder.build()` 可能抛出以下异常：

- ParamException: 如果参数无效则报错。

#### Returns\{#returns}

此方法会捕获所有异常，并返回一个 `R<DescribeIndexResponse>` 对象。

- 如果 API 在服务器端执行失败，它将返回服务器返回的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，它将返回 `R.Status.Unknown` 以及该异常的错误消息。

- 如果 API 执行成功，它将返回一个由 `R` 模板持有的有效 `DescribeIndexResponse`。你可以使用 `DescIndexResponseWrapper` 更方便地获取索引描述。

#### DescIndexResponseWrapper\{#descindexresponsewrapper}

一个用于封装 `DescribeIndexResponse` 的工具类。

```java
import io.milvus.response.DescIndexResponseWrapper;
DescIndexResponseWrapper wrapper = new DescIndexResponseWrapper(descIndexResponse);
```

`DescIndexResponseWrapper` 的方法：

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>参数</strong></p></th>
     <th><p><strong>返回值</strong></p></th>
   </tr>
   <tr>
     <td><p>getIndexDescriptions()</p></td>
     <td><p>获取所有索引描述的列表。（当前仅返回一个索引信息）</p></td>
     <td><p>N/A</p></td>
     <td><p>List\<IndexDesc></p></td>
   </tr>
   <tr>
     <td><p>getIndexDescByFieldName(String fieldName)</p></td>
     <td><p>根据字段名称获取索引描述。如果字段不存在则返回 null。</p></td>
     <td><p>fieldName: 一个字段名称</p></td>
     <td><p>IndexDesc</p></td>
   </tr>
</table>

#### IndexDesc\{#indexdesc}

一个用于描述索引的工具类。

`DescIndexResponseWrapper.IndexDesc` 的方法

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>返回值</strong></p></th>
   </tr>
   <tr>
     <td><p>getIndexType()</p></td>
     <td><p>获取索引类型。</p></td>
     <td><p>IndexType</p></td>
   </tr>
   <tr>
     <td><p>getMetricType()</p></td>
     <td><p>获取度量类型。</p></td>
     <td><p>MetricType</p></td>
   </tr>
   <tr>
     <td><p>getExtraParam()</p></td>
     <td><p>以 JSON 格式获取索引参数。</p></td>
     <td><p>String</p></td>
   </tr>
</table>

#### Example\{#example}

```java
import io.milvus.param.*;
import io.milvus.response.DescIndexResponseWrapper;
import io.milvus.grpc.DescribeIndexResponse;

DescribeIndexParam param = DescribeIndexParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withIndexName("index1")
        .build();
R<DescribeIndexResponse> response = client.describeIndex(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

DescIndexResponseWrapper wrapper = new DescIndexResponseWrapper(response.getData());
for (DescIndexResponseWrapper.IndexDesc desc : wrapper.getIndexDescriptions()) {
    System.out.println(desc.toString());
}
```
