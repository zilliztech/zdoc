---
title: "get() | Java | v1"
slug: /java/v1-HighlevelAPI-get
sidebar_label: "get()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法根据主字段 ID 获取实体。请注意，返回实体的顺序无法保证。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#LfsTd6Zw5oxgDNxuIKacXhBrnTc
sidebar_position: 5
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# get()

MilvusClient 接口。此方法根据主字段 ID 获取实体。请注意，返回实体的顺序无法保证。

```java
R<GetResponse> get(GetIdsParam requestParam);
```

#### GetIdsParam\{#getidsparam}

使用 `GetIdsParam.Builder` 构造 `GetIdsParam` 对象。

```java
import io.milvus.param.highlevel.dml.GetIdsParam;
GetIdsParam.Builder builder = GetIdsParam.newBuilder();
```

`GetIdsParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(String collectionName)</p></td>
        <td><p>设置目标集合名称。集合名称不能为空或 null。</p></td>
        <td><p>collectionName: 要插入数据的集合名称。</p></td>
    </tr>
    <tr>
        <td><p>withPrimaryIds(List\<T> primaryIds)</p></td>
        <td><p>指定 ID 字段。ID 不能为空或 null。<br/>注意：仅支持主键的值。</p></td>
        <td><p>primaryIds: 主字段键对象列表。</p></td>
    </tr>
    <tr>
        <td><p>addPrimaryId(T primaryId)</p></td>
        <td><p>指定 primaryField ID。PrimaryId 不能为空或 null。<br/>注意：仅支持主键的值。</p></td>
        <td><p>primaryId: 主字段键的 ID。</p></td>
    </tr>
    <tr>
        <td><p>withOutputFields(List\<String> outputFields)</p></td>
        <td><p>指定输出字段（可选）。</p></td>
        <td><p>outputFields: 你需要的输出字段列表。</p></td>
    </tr>
    <tr>
        <td><p>withConsistencyLevel(ConsistencyLevelEnum consistencyLevel)</p></td>
        <td><p>get 操作中使用的一致性级别。如果未指定级别，将使用默认一致性。请参考 Misc 中的 ConsistencyLevelEnum。</p></td>
        <td><p>consistencyLevel: get 操作中使用的一致性级别。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 GetIdsParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`GetIdsParam.Builder.build()` 可能抛出以下异常：

- ParamException: 参数无效时抛出错误。

#### Returns\{#returns}

此方法会捕获所有异常，并返回一个 `R<GetResponse>` 对象。

- 如果 API 在服务端执行失败，将返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常失败，将返回 `R.Status.Unknown` 以及异常的错误消息。

- 如果 API 执行成功，将返回由 `R` 模板持有的有效 `GetResponse`。

#### Example\{#example}

```java
import io.milvus.param.*;
import io.milvus.response.QueryResultsWrapper;
import io.milvus.response.FieldDataWrapper;
import io.milvus.grpc.QueryResults;

List<String> ids = Lists.newArrayList("441966745769900131", "441966745769900133");
GetIdsParam getParam = GetIdsParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withId(ids)
        .withOutputFields(Lists.newArrayList("*"))
        .build();

R<GetResponse> response = client.get(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

for (QueryResultsWrapper.RowRecord rowRecord : response.getData().getRowRecords()) {
    System.out.println(rowRecord);
}
```

