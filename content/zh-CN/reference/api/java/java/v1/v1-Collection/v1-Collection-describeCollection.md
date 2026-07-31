---
title: "describeCollection() | Java | v1"
slug: /java/v1-Collection-describeCollection
sidebar_label: "describeCollection()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法显示集合的详细信息，例如名称、schema。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#L4XLdP8yyoKRuNxBM7ScYodznke
sidebar_position: 5
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# describeCollection()

MilvusClient 接口。此方法显示集合的详细信息，例如名称、schema。

```java
R<DescribeCollectionResponse> describeCollection(DescribeCollectionParam requestParam);
```

#### DescribeCollectionParam\{#describecollectionparam}

使用 `DescribeCollectionParam.Builder` 构造 `DescribeCollectionParam` 对象。

```java
import io.milvus.param.DescribeCollectionParam;
DescribeCollectionParam.Builder builder = DescribeCollectionParam.newBuilder();
```

`DescribeCollectionParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(String collectionName)</p></td>
        <td><p>设置集合名称。集合名称不能为空或 null。</p></td>
        <td><p>collectionName: 要释放的集合名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，数据库名称可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 ReleaseCollectionParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`DescribeCollectionParam.Builder.build()` 可能抛出以下异常：

- ParamException: 当参数无效时返回错误。

#### Returns\{#returns}

此方法会捕获所有异常并返回一个 `R<DescribeCollectionResponse>` 对象。

- 如果 API 在服务端执行失败，则返回来自服务端的错误码和错误消息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 执行成功，则返回由 `R` 模板持有的有效 `DescribeCollectionResponse`。您可以使用 `DescCollResponseWrapper` 获取相关信息。

#### DescCollResponseWrapper\{#desccollresponsewrapper}

用于封装 DescribeCollectionResponse 的工具类。

```java
import io.milvus.response.DescCollResponseWrapper;
DescCollResponseWrapper wrapper = new DescCollResponseWrapper(response);
```

`DescCollResponseWrapper` 的方法：

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>参数</strong></p></th>
     <th><p><strong>返回值</strong></p></th>
   </tr>
   <tr>
     <td><p>getCollectionName()</p></td>
     <td><p>获取集合名称。</p></td>
     <td><p>N/A</p></td>
     <td><p>String</p></td>
   </tr>
   <tr>
     <td><p>getCollectionDescription()</p></td>
     <td><p>获取集合描述。</p></td>
     <td><p>N/A</p></td>
     <td><p>String</p></td>
   </tr>
   <tr>
     <td><p>getCollectionID()</p></td>
     <td><p>获取集合的内部 ID。</p></td>
     <td><p>N/A</p></td>
     <td><p>long</p></td>
   </tr>
   <tr>
     <td><p>getShardNumber()</p></td>
     <td><p>获取集合的分片数量。</p></td>
     <td><p>N/A</p></td>
     <td><p>int</p></td>
   </tr>
   <tr>
     <td><p>getCreatedUtcTimestamp()</p></td>
     <td><p>获取集合创建时的 UTC 时间戳。</p></td>
     <td><p>N/A</p></td>
     <td><p>long</p></td>
   </tr>
   <tr>
     <td><p>getAliases()</p></td>
     <td><p>获取集合的别名。</p></td>
     <td><p>N/A</p></td>
     <td><p>List\<String></p></td>
   </tr>
   <tr>
     <td><p>getFields()</p></td>
     <td><p>获取集合字段的 schema。</p></td>
     <td><p>N/A</p></td>
     <td><p>List\<FieldType></p></td>
   </tr>
   <tr>
     <td><p>getFieldByName(String fieldName)</p></td>
     <td><p>根据名称获取字段的 schema。</p><p>如果该字段不存在，则返回 null。</p></td>
     <td><p>fieldName: 字段名称</p></td>
     <td><p>FieldType</p></td>
   </tr>
   <tr>
     <td><p>isDynamicFieldEnabled()</p></td>
     <td><p>获取集合动态字段是否已启用</p></td>
     <td><p>N/A</p></td>
     <td><p>boolean</p></td>
   </tr>
   <tr>
     <td><p>getPartitionKeyField()</p></td>
     <td><p>获取分区键字段。</p><p>如果分区键字段不存在，则返回 null。</p></td>
     <td><p>N/A</p></td>
     <td><p>FieldType</p></td>
   </tr>
</table>

#### 示例\{#example}

```java
import io.milvus.param.*;
import io.milvus.response.DescCollResponseWrapper;

DescribeCollectionParam param = DescribeCollectionParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .build();
R<DescribeCollectionResponse> response = client.describeCollection(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
DescCollResponseWrapper wrapper = new DescCollResponseWrapper(response.getData());
System.out.println("Shard number: " + wrapper.getShardNumber());
```
