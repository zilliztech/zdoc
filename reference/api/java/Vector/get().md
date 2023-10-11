---
displayed_sidebar: referenceSidebar
sidebar_position: 3
slug: /java/get
---

# get()

调用接口按主键获取 Entity。目前暂时无法保证 Entity 的返回顺序。

```Java
R<GetResponse> get(GetIdsParam requestParam);
```

## 请求示例

```Java
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

## GetIdsParam

使用 `GetIdsParam.Builder` 构建 `GetIdsParam` 对象。

```Java
import io.milvus.param.highlevel.dml.GetIdsParam;
GetIdsParam.Builder builder = GetIdsParam.newBuilder();
```

`GetIdsParam.Builder` 方法：

| 方法 | 描述 | 参数 |
| --- | --- | --- |
| `withCollectionName(String collectionName)` | 设置 Collection 名称。<br/>Collection 名称不能为空。 | `collectionName`：待查询的 Collection 的名称。 |
| `withPrimaryIds(List<T> primaryIds)` | 设置待查询的 Entity 的 ID。<br/>该值不能为空。 | `primaryIds`：待查询的 Entity 的 ID。 |
| `addPrimaryId(T primaryId)` | 设置待查询的 Entity 的 ID。<br/>该值不能为空。<br/>目前只支持指定主键值。 | `primaryId`：待查询的 Entity 的 ID。 |
| `withOutputFields(List<String> outputFields)` | （可选）设置指定输出字段。 | `outputFields`：指定输出字段。 |
| `build()` | 构建 `GetIdsParam` 对象。 | N/A |

`GetIdsParam.Builder.build()` 可能会抛出以下异常：

- `ParamException`：如果指定参数为无效参数则抛出此异常。

## 返回结果

此方法捕获所有异常并返回 `R<GetResponse>` 对象。

- 如果 API 调用在服务器端失败，会从服务器返回错误代码和消息。

- 如果 API 调用因 RPC 异常而失败，则会返回 `R.Status.Unknow` 和异常的错误消息。

- 如果 API 调用成功，返回 `GetResponse`。