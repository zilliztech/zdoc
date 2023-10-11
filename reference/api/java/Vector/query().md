---
displayed_sidebar: referenceSidebar
sidebar_position: 2
slug: /java/query
---

# query()

调用接口查询 Collection 中满足指定布尔条件的 Entity。目前暂时无法保证 Entity 的返回顺序。

```Java
R<QueryResponse> query(QuerySimpleParam requestParam);
```

## 请求示例

```Java
import io.milvus.param.*;
import io.milvus.response.QueryResultsWrapper;
import io.milvus.response.FieldDataWrapper;
import io.milvus.grpc.QueryResults;

QuerySimpleParam querySimpleParam = QuerySimpleParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withOutFields(Lists.newArrayList("*"))
        .withFilter(filter)
        .withLimit(100L)
        .withOffset(0L)
        .build();
R<QueryResponse> response = client.query(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

for (QueryResultsWrapper.RowRecord rowRecord : response.getData().getRowRecords()) {
    System.out.println(rowRecord);
}
```

## QuerySimpleParam

使用 `QuerySimpleParam.Builder` 构建 `QuerySimpleParam` 对象。

```Java
import io.milvus.param.highlevel.dml.QuerySimpleParam;
QuerySimpleParam.Builder builder = QuerySimpleParam.newBuilder();
```

`QuerySimpleParam.Builder` 方法：

| 方法 | 描述 | 参数 |
| --- | --- | --- |
| `withCollectionName(String collectionName)` | 设置 Collection 名称。<br/>Collection 名称不能为空 | `collectionName`：待查询的 Collection 名称。 |
| `withOutputFields(List<String> outputFields)` | 设置指定输出的字段。如果指定了该参数，查询结果将返回指定输出字段。 | `outputFields`：指定输出的字段。 |
| `withFilter(String filter)` | 设置表达式以过滤 Entity。 | `filter`：用于过滤 Entity 的布尔表达式。 |
| `withOffset(Long offset)` | 设置位置偏离，之前返回的 Entity 将被忽略。 | `offset`：位置偏离，之前返回的 Entity 将被忽略。 |
| `withLimit(Long limit)` | 限制返回的 Entity 数量。 <br/>该值必须为 0 or 其他正整数。<br/>默认值为 `0`，表示无限制返回所有的 Entity。 | `limit`：限制返回的 Entity 数量。 |
| `build()` | 构建 `QuerySimpleParam` 对象。 | N/A |

`QuerySimpleParam.Builder.build()` 可能会抛出以下异常：

- `ParamException`：如果指定参数为无效参数则抛出此异常。

## 返回结果

此方法捕获所有异常并返回 `R<QueryResponse>` 对象。

- 如果 API 调用在服务器端失败，会从服务器返回错误代码和消息。

- 如果 API 调用因 RPC 异常而失败，则会返回 `R.Status.Unknow` 和异常的错误消息。

- 如果 API 调用成功，返回 `QueryResponse`。