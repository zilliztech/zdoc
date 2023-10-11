---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /java/create_collection
---

# createCollection()

调用接口创建 Collection。本方法将使用更少量的参数来创建 Collection。

```Java
R<RpcStatus> createCollection(CreateSimpleCollectionParam requestParam);
```

## 请求示例

```Java
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

## CreateCollectionParam

使用 `CreateSimpleCollectionParam.Builder` 构建 `CreateSimpleCollectionParam` 对象。

```Java
import io.milvus.param.highlevel.collection.CreateCollectionParam;
CreateSimpleCollectionParam.Builder builder = CreateSimpleCollectionParam.newBuilder();
```

`CreateSimpleCollectionParam.Builder` 方法：

| 方法 | 描述 | 参数 |
| --- | --- | --- |
| `withCollectionName(String collectionName)` |  设置 Collection 名称。<br/>Collection 名称不能为空。 | `collectionName`： 待创建的 Collection 的名称。 |
| `withDimension(int dimension)` |  设置 Collection 中将要存储的向量数据维度。<br/>该值必须大于 0 且小于 32768。 | `dimension`：Collection 中将要存储的向量数据维度。 |
| `withMetricType(MetricType metricType)` | 设置 Collection 使用的相似度类型。<br/>相似度类型定义了如何测量向量之间的距离。 | `metricType`：测量向量之间距离的算法。 |
| `withDescription(String description)` | 设置 Collection 的描述信息。<br/>描述可以为空。默认值为 `""`。 | `description`：Collection 的描述信息。 |
| `withPrimaryField(String primaryField)` | 设置主键名称。<br/>该值不能为空。 | `primaryField`： 自定义的主键名称。 |
| `withVectorField(String vectorField)` | 设置向量字段的名称。<br/>该值不能为空。 | `vectorField`： 自定义的向量字段的名称。 |
| `withAutoID(boolean autoId)` | 设置是否启用自动 ID 功能。<br/>默认值为 `false`。 | `autoId`：是否启用自动 ID 功能。 |
| `withSyncLoad(boolean syncLoad)` | 设置是否在创建时加载 Collection。<br/>默认值为 `true`，表示在创建时会加载 Collection。 | `syncLoad`：是否在创建时加载 Collection。 |
| `build()` |  构建 `CreateSimpleCollectionParam` 对象。 | N/A |

`CreateSimpleCollectionParam.Builder.build()` 可能抛出以下异常：

- `ParamException`：如果指定参数为无效参数则抛出此异常。

## 返回结果

此方法捕获所有异常并返回 `R<RpcStatus>` 对象。

- 如果 API 调用在服务器端失败，会从服务器返回错误代码和消息。

- 如果 API 调用因 RPC 异常而失败，则会返回 `R.Status.Unknow` 和异常的错误消息。

- 如果 API 调用成功，返回 `R.Status.Success`。