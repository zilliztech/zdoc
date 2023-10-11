---
displayed_sidebar: referenceSidebar
sidebar_position: 4
slug: /java/drop_collection
---

# dropCollection()

调用接口删除 Collection。

> 📘 说明
>
> 此调用会删除 Collection 中的所有数据。

```Java
R<RpcStatus> dropCollection(DropCollectionParam requestParam);
```

## 请求示例

```Java
import io.milvus.param.*;

DropCollectionParam dropParam = DropCollectionParam.newBuilder()
        .withCollectionName(collectionName)
        .build();

R<RpcStatus> response = client.dropCollection(dropParam);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```

## DropCollectionParam

使用 `DropCollectionParam.Builder` 构建 `DropCollectionParam` 对象。

```Java
import io.milvus.param.DropCollectionParam;
DropCollectionParam.Builder builder = DropCollectionParam.newBuilder();
```

`DropCollectionParam.Builder` 方法：

| 方法                                      | 描述                                                  | 参数                                            |
| ------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| `withCollectionName(String collectionName)` | 设置 Collection 名称。 Collection 名称不能为空。 | `collectionName`：目标 Collection 名称。 |
| `build()`                                   | 构建 `DropCollectionParam` 对象。                   | N/A                                                   |

`DropCollectionParam.Builder.build()` 可能会抛出以下异常：

- `ParamException`：如果指定参数为无效参数则抛出此异常。

## 返回结果

此方法捕获所有异常并返回 `R<RpcStatus>` 对象。

- 如果 API 调用在服务器端失败，会从服务器返回错误代码和消息。

- 如果 API 调用因 RPC 异常而失败，则会返回 `R.Status.Unknow` 和异常的错误消息。

- 如果 API 调用成功，返回 `R.Status.Success`。