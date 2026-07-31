---
title: "delete() | Java | v1"
slug: /java/v1-HighlevelAPI-delete
sidebar_label: "delete()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法根据主键 id 删除实体。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#G46mdTMB4oIR4fxWz5kcZ9GhnKc
sidebar_position: 4
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# delete()

MilvusClient 接口。此方法根据主键 id 删除实体。

```java
R<DeleteResponse> delete(DeleteIdsParam requestParam);
```

#### DeleteIdsParam\{#deleteidsparam}

使用 `DeleteIdsParam.Builder` 构造 `DeleteIdsParam` 对象。

```java
import io.milvus.param.highlevel.dml.DeleteIdsParam;
DeleteIdsParam.Builder builder = DeleteIdsParam.newBuilder();
```

`DeleteIdsParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>描述</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(String collectionName)</p></td>
        <td><p>设置目标 collection 名称。Collection 名称不能为空或 null。</p></td>
        <td><p>collectionName: 要插入数据的 collection 名称。</p></td>
    </tr>
    <tr>
        <td><p>withPartitionName(tring partitionName)</p></td>
        <td><p>设置 partition 名称（可选）。</p></td>
        <td><p>partitionName: 目标 partition 名称。</p></td>
    </tr>
    <tr>
        <td><p>withPrimaryIds(List\<T> primaryIds)</p></td>
        <td><p>指定 primaryField id。PrimaryIds 不能为空或 null。<br/>注意：仅支持主键的值。</p></td>
        <td><p>primaryIds: 主字段 id 列表。</p></td>
    </tr>
    <tr>
        <td><p>addPrimaryId(T primaryId)</p></td>
        <td><p>指定 primaryField id。PrimaryId 不能为空或 null。<br/>注意：仅支持主键的值。</p></td>
        <td><p>primaryId: 主字段键的 id。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 DeleteIdsParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`DeleteIdsParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### 返回值\{#returns}

此方法会捕获所有异常，并返回一个 `R<DeleteResponse>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 以及该异常的错误消息。

- 如果 API 执行成功，则返回由 `R` 模板持有的有效 `DeleteResponse`。

#### 示例\{#example}

```java
import io.milvus.param.highlevel.*;
import io.milvus.response.MutationResultWrapper;
import io.milvus.grpc.MutationResult;

List<String> ids = Lists.newArrayList("441966745769900131", "441966745769900133");
DeleteIdsParam param = DeleteIdsParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withPrimaryIds(ids)
        .build();
        
R<DeleteResponse> response = client.delete(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

for (Object deleteId : response.getData().getDeleteIds()) {
    System.out.println(deleteId);
}
```

