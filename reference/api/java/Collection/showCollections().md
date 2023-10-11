---
displayed_sidebar: referenceSidebar
sidebar_position: 3
slug: /java/show_collections
---

# showCollections()

调用接口查询当前已创建的所有 Collection 或获取 Collection 的加载情况。

```Java
R<ShowCollectionsResponse> showCollections(ShowCollectionsParam requestParam);
```

## 请求示例

```Java
import io.milvus.param.*;
import io.milvus.response.GetCollStatResponseWrapper;
import io.milvus.grpc.GetCollectionStatisticsResponse;

GetCollectionStatisticsParam param = GetCollectionStatisticsParam.newBuilder()
        .withCollectionName(collectionName)
        .build();
R<GetCollectionStatisticsResponse> response = client.getCollectionStatistics(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

GetCollStatResponseWrapper wrapper = new GetCollStatResponseWrapper(response.getData());
System.out.println("Row count: " + wrapper.getRowCount());
```

## ShowCollectionsParam

使用 `ShowCollectionsParam.Builder` 构建 `ShowCollectionsParam` 对象。

```Java
import io.milvus.param.ShowCollectionsParam;
ShowCollectionsParam.Builder builder = ShowCollectionsParam.newBuilder();
```

`ShowCollectionsParam.Builder` 方法：

| 方法                                              | 描述                                                  | 参数                                                 |
| --------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| `withCollectionNames(List<String> collectionNames)` | 设置 Collection 名称。如果该参数为空，则会返回集群中已创建的所有 Collection。 | `collectionNames`：目标 Collection 名称。 |
| `addCollectionName(String collectionName)`          | 添加 Collection 名称。Collection 名称不能为空。 | `collectionName`：目标 Collection 名称。      |
| `build()`                                           | 构建 `ShowCollectionsParam` 对象。                   | N/A                                                        |

`ShowCollectionsParam.Builder.build()` 可能会抛出以下异常：

- `ParamException`：如果指定参数为无效参数则抛出此异常。

## 返回结果

此方法捕获所有异常并返回 `R<ShowCollectionsResponse>` 对象。

- 如果 API 调用在服务器端失败，会从服务器返回错误代码和消息。

- 如果 API 调用因 RPC 异常而失败，则会返回 `R.Status.Unknow` 和异常的错误消息。

- 如果 API 调用成功，返回 `ShowCollectionsResponse`。 您可以通过 `ShowCollResponseWrapper` 获取信息。

## ShowCollResponseWrapper

封装 `ShowCollectionsResponse` 的工具类。

```Java
import io.milvus.response.ShowCollResponseWrapper;
ShowCollResponseWrapper wrapper = new ShowCollResponseWrapper(showCollectionsResponse);
```

`ShowCollResponseWrapper` 方法：

| 方法                                       | 描述                                              | 参数                    | 类型          |
| ------------------------------------------------ | ------------------------------------------------------------ | --------------------------------- | -------------------- |
| `getCollectionsInfo()`                           | 返回 `CollectionInfo` 对象列表。每个 `CollectionInfo` 代表一个 Collection。 | N/A                               | `List<CollectionInfo>` |
| `getCollectionInfoByName(String collectionName)` | 按 Collection 名称获取 `CollectionInfo` 对象。           | `collectionName`：Collection 名称。 | CollectionInfo       |

## CollectionInfo

存储 Collection 信息的工具类。

`ShowCollResponseWrapper.CollectionInfo` 方法：

|   方法                  |   描述                                                |   类型   |
| ------------------------- | ------------------------------------------------------------ | ----------- |
| `getName()`               | 获取 Collection 的名称。                             | String      |
| `getId()`                 | 获取 Collection 的 ID。                               | long        |
| `getUtcTimestamp()`       | 获取 Collection 创建时间的 UTC 时间戳。 | long        |
| `getInMemoryPercentage()` | 查询节点的负载百分比。                               | long        |