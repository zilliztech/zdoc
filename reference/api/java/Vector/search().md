---
displayed_sidebar: referenceSidebar
sidebar_position: 1
slug: /java/search
---

# search()

调用接口基于指定向量执行近似最近邻（Approximate Nearest Neighbor，ANN）检索。您可以在请求中指定布尔表达式以缩小检索范围。


```Java
R<SearchResponse> search(SearchSimpleParam requestParam);
```

## 请求示例

```Java
import io.milvus.param.*;
import io.milvus.response.SearchResultsWrapper;
import io.milvus.grpc.SearchResults;

SearchSimpleParam param = SearchSimpleParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withVectors(generateFloatVector())
        .withOutputFields(Lists.newArrayList("*"))
        .withFilter(filter)
        .withLimit(100)
        .withOffset(0L)
        .build();
R<SearchResponse> response = client.search(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

for (QueryResultsWrapper.RowRecord rowRecord : response.getData().getRowRecords()) {
    System.out.println(rowRecord);
}
```

## SearchSimpleParam

使用 `SearchSimpleParam.Builder` 构建 `SearchSimpleParam` 对象。

```Java
import io.milvus.param.highlevel.dml.SearchSimpleParam;
SearchSimpleParam.Builder builder = SearchSimpleParam.newBuilder();
```

`SearchSimpleParam.Builder` 方法：

| 方法 | 描述 | 参数 |
| --- | --- | --- |
| `withCollectionName(String collectionName)` | 设置待检索的 Collection 名称。<br/>Collection 名称不能为空。 | `collectionName`：待检索的 Collection 名称。 |
| `withOutputFields(List<String> outputFields)` | 设置指定输出的字段。如果指定了该参数，检索结果将返回指定输出字段。 | `outputFields`：指定输出的字段。 |
| `withFilter(String filter)` | 设置表达式以过滤 Entity。 | `filter`：用于过滤 Entity 的布尔表达式。 |
| `withVectors(List<?> vectors)` | 设置查询向量。<br/>指定的查询向量数应小于 16384。 | `vectors`: <ul><li>如果向量字段包含浮点向量，`vectors` 应为 `List<List<Float>>`。</li><li></li>如果向量字段包含二进制向量，`vectors` 应为 `List<ByteBuffer>`。</ul> |
| `withOffset(Long offset)` | 设置位置偏离，之前返回的 Entity 将被忽略。 | `offset`：位置偏离，之前返回的 Entity 将被忽略。 |
| `withLimit(Long limit)` | 限制返回的 Entity 数量。<br/>该值必须为 0 or 其他正整数。<br/>默认值为 `0`，表示无限制返回所有的 Entity。 | `limit`：限制返回的 Entity 数量。 |
| `build()` | 构建 `SearchSimpleParam` 对象。 | N/A |

`SearchSimpleParam.Builder.build()` 可能会抛出以下异常：

- `ParamException`：如果指定参数为无效参数则抛出此异常。

## 返回结果

此方法捕获所有异常并返回 `R<SearchResponse>` 对象。

- 如果 API 调用在服务器端失败，会从服务器返回错误代码和消息。

- 如果 API 调用因 RPC 异常而失败，则会返回 `R.Status.Unknow` 和异常的错误消息。

- 如果 API 调用成功，返回 `SearchResponse`。