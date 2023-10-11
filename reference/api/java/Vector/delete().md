---
displayed_sidebar: referenceSidebar
sidebar_position: 4
slug: /java/delete
---

# delete()

调用接口按主键删除 Collection 中的 Entity。

```Java
R<DeleteResponse> delete(DeleteIdsParam requestParam);
```

## 请求示例

```Java
import io.milvus.param.highlevel.*;
import io.milvus.response.MutationResultWrapper;
import io.milvus.grpc.MutationResult;

List<String> ids = Lists.newArrayList("441966745769900131", "441966745769900133");
DeleteIdsParam param = DeleteIdsParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withPrimaryIds(ids)
        .build();
        
R<DeleteResponse> response = client.delete(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

for (Object deleteId : response.getData().getDeleteIds()) {
    System.out.println(deleteId);
}
```

## DeleteIdsParam

使用 `DeleteIdsParam.Builder` 构建 `DeleteIdsParam` 对象。

```Java
import io.milvus.param.highlevel.dml.DeleteIdsParam;
DeleteIdsParam.Builder builder = DeleteIdsParam.newBuilder();
```

`DeleteIdsParam.Builder` 方法：

| 方法 | 描述 | 参数 |
| --- | --- | --- |
| `withCollectionName(String collectionName)` | 设置 Collection 名称。<br/>Collection 名称不能为空。 | `collectionName`：目标 Collection 名称。 |
| `withPrimaryIds(List<T> primaryIds)` | 设置待删除 Entity 的 ID。<br/>该值不能为空。 | `primaryIds`：待删除 Entity 的 ID。 |
| `addPrimaryId(T primaryId)` | 设置待删除 Entity 的 ID。<br/>该值不能为空。<br/>目前只支持指定主键值。 | `primaryId`：待删除 Entity 的 ID。 |
| `build()` | 构建 `DeleteIdsParam` 对象。 | N/A |

`DeleteIdsParam.Builder.build()` 可能会抛出以下异常：

- `ParamException`：如果指定参数为无效参数则抛出此异常。

## 返回结果

此方法捕获所有异常并返回 `R<DeleteResponse>` 对象。

- 如果 API 调用在服务器端失败，会从服务器返回错误代码和消息。

- 如果 API 调用因 RPC 异常而失败，则会返回 `R.Status.Unknow` 和异常的错误消息。

- 如果 API 调用成功，返回 `DeleteResponse`。