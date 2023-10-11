---
displayed_sidebar: referenceSidebar
sidebar_position: 1
slug: /java/describe_collection
---

# describeCollection()

调用接口获取指定 Collection 的详细信息，包括 Collection 名称和 Schema 等。

```Java
R<DescribeCollectionResponse> describeCollection(DescribeCollectionParam requestParam);
```

## 请求示例

```Java
import io.milvus.param.*;
import io.milvus.response.DescCollResponseWrapper;
import io.milvus.grpc.DescribeCollectionResponse;

DescribeCollectionParam param = DescribeCollectionParam.newBuilder()
        .withCollectionName(collectionName)
        .build();
R<DescribeCollectionResponse> response = client.describeCollection(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

DescCollResponseWrapper wrapper = new DescCollResponseWrapper(response.getData());
System.out.println("Collection ID: " + wrapper.getCollectionID());
```

## DescribeCollectionParam

使用 `DescribeCollectionParam.Builder` 构建 `DescribeCollectionParam` 对象。

```Java
import io.milvus.param.DescribeCollectionParam;
DescribeCollectionParam.Builder builder = DescribeCollectionParam.newBuilder();
```

`DescribeCollectionParam.Builder` 方法：

| 方法                                      | 描述                                                  | 参数                                                   |
| ------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `withCollectionName(String collectionName)` | 设置 Collection 名称。Collection 名称不能为空。 | `collectionName`：目标 Collection 名称。 |
| `build()`                                   | 构建 `DescribeCollectionParam` 对象。                | N/A                                                          |

`DescribeCollectionParam.Builder.build()` 可能会抛出以下异常：

- `ParamException`：如果指定参数为无效参数则抛出此异常。

## 返回结果

此方法捕获所有异常并返回 `R<DescribeCollectionResponse>` 对象。

- 如果 API 调用在服务器端失败，会从服务器返回错误代码和消息。

- 如果 API 调用因 RPC 异常而失败，则会返回 `R.Status.Unknow` 和异常的错误消息。

- 如果 API 调用成功，返回 `DescribeCollectionResponse`。您可以通过 `DescCollResponseWrapper` 获取信息。

## DescCollResponseWrapper

封装 `DescribeCollectionResponse` 的工具类。

```Java
import io.milvus.response.DescCollResponseWrapper;
DescCollResponseWrapper wrapper = new DescCollResponseWrapper(descCollectionResponse);
```

`DescCollResponseWrapper` 方法：

| 方法                         | 描述                                              | 参数          | 返回类型     |
| ---------------------------------- | ------------------------------------------------------------ | ----------------------- | --------------- |
| `getCollectionName()`              | 获取 Collection 的名称。                             | N/A                     | String          |
| `getCollectionDescription()`       | 获取 Collection 的描述信息。                      | N/A                     | String          |
| `getCollectionID()`                | 获取 Collection 的 ID。                               | N/A                     | long            |
| `getShardNumber()`                 | 获取 Collection 的分片数量。                 | N/A                     | Int             |
| `getCreatedUtcTimestamp()`         | 获取 Collection 创建时间的 UTC 时间戳。 | N/A                     | long            |
| `getAliases()`                     | 获取 Collection 的别名。                            | N/A                     | `List<String>`    |
| `getFields()`                      | 获取 Collection 中的所有字段。                    | N/A                     | `List<FieldType>` |
| `getFieldByName(String fieldName)` | 通过字段名称获取字段。                       | fieldName：字段名称 | FieldType       |
| `isDynamicFieldEnabled()` | Collection 动态字段是否启用。                       | N/A | Boolean       |
| `getPartitionKeyField()` | 获取分片键字段，如果不存在则返回null。                       | N/A | FieldType       |
