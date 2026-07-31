---
title: "showCollections() | Java | v1"
slug: /java/v1-Collection-showCollections
sidebar_label: "showCollections()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "一个 MilvusClient 接口。此方法列出所有集合或获取集合加载状态。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#K1DldJyVaojBaHxesiLc2z9fnxf
sidebar_position: 9
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# showCollections()

一个 MilvusClient 接口。此方法列出所有集合或获取集合加载状态。*.*

```java
R<ShowCollectionsResponse> showCollections(ShowCollectionsParam requestParam);
```

#### ShowCollectionsParam\{#showcollectionsparam}

使用 `ShowCollectionsParam.Builder` 构造 `ShowCollectionsParam` 对象。

```java
import io.milvus.param.ShowCollectionsParam;
ShowCollectionsParam.Builder builder = ShowCollectionsParam.newBuilder();
```

`ShowCollectionsParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>描述</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionNames(List\<String> collectionNames)</p></td>
        <td><p>设置集合名称列表。如果列表为空，该方法将返回数据库中的所有集合。<br/>集合名称不能为空或为 null。</p></td>
        <td><p>collectionNames：要显示的集合名称列表。</p></td>
    </tr>
    <tr>
        <td><p>addCollectionName(String collectionName)</p></td>
        <td><p>添加一个集合名称。集合名称不能为空或为 null。</p></td>
        <td><p>collectionName：要显示的集合名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，数据库名称可以为 null。</p></td>
        <td><p>databaseName：数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 ShowCollectionsParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`ShowCollectionsParam.Builder.build()` 可能会抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### 返回值\{#returns}

此方法会捕获所有异常，并返回一个 `R<ShowCollectionsResponse>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误信息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 和该异常的错误信息。

- 如果 API 执行成功，则返回由 `R` 模板持有的有效 `ShowCollectionsResponse`。你可以使用 `ShowCollResponseWrapper` 获取相关信息。

#### ShowCollResponseWrapper\{#showcollresponsewrapper}

用于封装 ShowCollectionsResponse 的工具类。

```java
import io.milvus.response.ShowCollResponseWrapper;
ShowCollResponseWrapper wrapper = new ShowCollResponseWrapper(showCollectionsResponse);
```

`ShowCollResponseWrapper` 的方法：

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>描述</strong></p></th>
     <th><p><strong>参数</strong></p></th>
     <th><p><strong>返回值</strong></p></th>
   </tr>
   <tr>
     <td><p>getCollectionsInfo()</p></td>
     <td><p>返回 CollectionInfo 对象列表。每个 CollectionInfo 表示一个集合。</p></td>
     <td><p>N/A</p></td>
     <td><p>List\<CollectionInfo></p></td>
   </tr>
   <tr>
     <td><p>getCollectionInfoByName(String collectionName)</p></td>
     <td><p>根据集合名称获取 CollectionInfo 对象。</p></td>
     <td><p>collectionName：集合名称。</p></td>
     <td><p>CollectionInfo</p></td>
   </tr>
</table>

#### CollectionInfo\{#collectioninfo}

用于存储集合信息的工具类。

`ShowCollResponseWrapper.CollectionInfo` 的方法：

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>描述</strong></p></th>
     <th><p><strong>返回值</strong></p></th>
   </tr>
   <tr>
     <td><p>getName()</p></td>
     <td><p>获取集合名称。</p></td>
     <td><p>String</p></td>
   </tr>
   <tr>
     <td><p>getId()</p></td>
     <td><p>获取集合 ID。</p></td>
     <td><p>long</p></td>
   </tr>
   <tr>
     <td><p>getUtcTimestamp()</p></td>
     <td><p>获取表示该集合创建时间的 UTC 时间戳。此方法仅供内部使用。</p></td>
     <td><p>long</p></td>
   </tr>
   <tr>
     <td><p>getInMemoryPercentage()</p></td>
     <td><p>查询节点上的加载百分比。</p></td>
     <td><p>long</p></td>
   </tr>
</table>

#### 示例\{#example}

```java
import io.milvus.param.*;
import io.milvus.response.ShowCollResponseWrapper;
import io.milvus.grpc.ShowCollectionsResponse;

ShowCollectionsParam param = ShowCollectionsParam.newBuilder()
        .addCollectionName(COLLECTION_NAME)
        .build();
R<ShowCollectionsResponse> response = client.showCollections(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

ShowCollResponseWrapper wrapper = new ShowCollResponseWrapper(response.getData());
System.out.println("Row count: " + wrapper.getRowCount());

List<ShowCollResponseWrapper.CollectionInfo> infos = wrapper.getCollectionsInfo();
for (ShowCollResponseWrapper.CollectionInfo info : infos) {
    System.out.println(info.getName() + " load percentage: " + info.getInMemoryPercentage() + "%");
}
```
