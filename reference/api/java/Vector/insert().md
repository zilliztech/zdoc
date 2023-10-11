---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /java/insert
---

# insert()

调用接口将 Entity 插入到 Collection。

```Java
R<InsertResponse> insert(InsertRowsParam requestParam);
```

## 请求示例

```Java
import io.milvus.param.*;
import io.milvus.response.MutationResultWrapper;
import io.milvus.grpc.MutationResult;

List<JSONObject> rowsData = new ArrayList<>();
Random ran = new Random();
for (long i = 0L; i < rowCount; ++i) {
    JSONObject row = new JSONObject();
    row.put(AGE_FIELD, ran.nextInt(99));
    row.put(VECTOR_FIELD, generateFloatVector());

    // $meta if collection EnableDynamicField, you can input this field not exist in schema, else deny
    row.put(INT32_FIELD_NAME, ran.nextInt());
    row.put(INT64_FIELD_NAME, ran.nextLong());
    row.put(VARCHAR_FIELD_NAME, "测试varchar");
    row.put(FLOAT_FIELD_NAME, ran.nextFloat());
    row.put(DOUBLE_FIELD_NAME, ran.nextDouble());
    row.put(BOOL_FIELD_NAME, ran.nextBoolean());

    // $json
    JSONObject jsonObject = new JSONObject();
    jsonObject.put(INT32_FIELD_NAME, ran.nextInt());
    jsonObject.put(INT64_FIELD_NAME, ran.nextLong());
    jsonObject.put(VARCHAR_FIELD_NAME, "测试varchar");
    jsonObject.put(FLOAT_FIELD_NAME, ran.nextFloat());
    jsonObject.put(DOUBLE_FIELD_NAME, ran.nextDouble());
    jsonObject.put(BOOL_FIELD_NAME, ran.nextBoolean());
    row.put(USER_JSON_FIELD, jsonObject);

    rowsData.add(row);
}

InsertRowsParam param = InsertRowsParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withRows(rowsData)
        .build();
R<InsertResponse> response = client.insert(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

System.out.println("insertCount: " + response.getData().getInsertCount());
System.out.println("insertIds: " + response.getData().getInsertIds());
```

## InsertRowsParam

使用 `InsertRowsParam.Builder` 构建 `InsertRowsParam` 对象。

```Java
import io.milvus.param.highlevel.dml.InsertRowsParam;
InsertRowsParam.Builder builder = InsertRowsParam.newBuilder();
```

`InsertRowsParam.Builder` 方法：

| 方法 | 描述 | 参数 |
| --- | --- | --- |
| `withCollectionName(String collectionName)` | 设置待插入数据的 Collection 名称。<br/>Collection 名称不能为空。 | `collectionName`：待插入数据的 Collection 名称。数据将以行来插入。 |
| `withRows(List<JSONObject> rows)` | 以行来准备待插入数据。<br/>该值不能为空。<br/>如果已启用自动 ID，则无需包含主键。| `rows`：`JSONObject` 对象，每个对象代表数据集中的一行数据。 |
| `build()` | 构建 `InsertRowsParam` 对象。 | N/A |

`InsertRowsParam.Builder.build()` 可能会抛出以下异常：

- `ParamException`：如果指定参数为无效参数则抛出此异常。

## 返回结果

此方法捕获所有异常并返回 `R<InsertResponse>` 对象。

- 如果 API 调用在服务器端失败，会从服务器返回错误代码和消息。

- 如果 API 调用因 RPC 异常而失败，则会返回 `R.Status.Unknow` 和异常的错误消息。

- 如果 API 调用成功，返回 `InsertResponse`。