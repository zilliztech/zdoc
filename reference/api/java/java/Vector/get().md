---
slug: /java/vector.get()
beta: FALSE
notebook: FALSE
sidebar_position: 3
displayed_sidebar: javaSidebar
---

# get()

Grabs entities by primary keys. If `output_fields` is specified, this operation returns the specified field value only.

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

Use `GetIdsParam.Builder` to construction a `GetIdsParam` object.

```Java
import io.milvus.param.highlevel.dml.GetIdsParam;
GetIdsParam.Builder builder = GetIdsParam.newBuilder();
```

Methods of `GetIdsParam.Builder`：

| Method | Description | Argument |
| --- | --- | --- |
| `withCollectionName(String collectionName)` | Sets a collection name.<br/>The value is mandatory. | `collectionName`：Name of the collection to get entities from. |
| `withPrimaryIds(List<T> primaryIds)` | Sets the IDs of the entities to get.<br/>The value is mandatory | `primaryIds`：IDs of the entities to get |
| `addPrimaryId(T primaryId)` | Sets the ID of an entity to be added to the list.<br/>The value is mandatory.<br/>Add a primary key only. | `primaryId`：ID of the entity to get. |
| `withOutputFields(List<String> outputFields)` | (Optional) Sets the fields to include in the result. | `outputFields`：Fields to include in the result. |
| `build()` | Builds `GetIdsParam` object. | N/A |

`GetIdsParam.Builder.build()` can throw the following exceptions::

- `ParamException`：error if the parameter is invalid.

## Returns

This method catches all the exceptions and returns an `R<GetResponse>` object.

- If the API fails on the server side, it returns the error code and message from the server.

- If the API fails by RPC exception, it returns `R.Status.Unknow` and the error message of the exception.

- If the API succeeds, it returns a valid `GetResponse`.