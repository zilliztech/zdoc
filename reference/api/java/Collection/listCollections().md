---
displayed_sidebar: referenceSidebar
sidebar_position: 2
slug: /java/list_collection
---

# listCollections()

调用接口查询当前已创建的所有 Collection。

```Java
R<ListCollectionsResponse> listCollections(ListCollectionsParam requestParam);
```

## 请求示例

```Java
import io.milvus.param.highlevel.collection.*;

ListCollectionsParam param = ListCollectionsParam.newBuilder()
        .build();

R<ListCollectionsResponse> response = client.listCollections(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
for (String collectionName : response.getData().collectionNames) {
    System.out.println(collectionName);
}
```

## ListCollectionsParam

使用 `ListCollectionsParam.Builder` 构建 `ListCollectionsParam` 对象。

```Java
import io.milvus.param.highlevel.collection.ListCollectionsParam;
ListCollectionsParam.Builder builder = ListCollectionsParam.newBuilder();
```

`ListCollectionsParam.Builder` 方法：

| 方法 | 描述 | 参数 |
| --- | --- | --- |
| `build()` | 构建 `ListCollectionsParam` 对象。 | N/A |

`ListCollectionsParam.Builder.build()` 可能会抛出以下异常：

- `ParamException`：如果指定参数为无效参数则抛出此异常。

## 返回结果

此方法捕获所有异常并返回 `R<ListCollectionsResponse>` 对象。

- 如果 API 调用在服务器端失败，会从服务器返回错误代码和消息。

- 如果 API 调用因 RPC 异常而失败，则会返回 `R.Status.Unknow` 和异常的错误消息。

- 如果 API 调用成功，返回 `ListCollectionsResponse`。