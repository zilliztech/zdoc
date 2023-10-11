---
displayed_sidebar: referenceSidebar
sidebar_position: 3
slug: /go/drop_collection
---

# DropCollection()

调用接口删除 Collection。

> 📘 说明
>
> 此调用会删除 Collection 中的所有数据。

```go
client.DropCollection(ctx, collName)
```

## 请求示例

```go
ctx := context.Background()

collName := "book"

err = client.DropCollection(ctx, collName)

if err != nil {
    log.Fatal("failed to drop collection:", err.Error())
}
```

## 请求参数

| 参数          | 描述                          | 类型     |
|--------------------|--------------------------------------|----------|
| `ctx` | 控制 API 调用进程的上下文。 | context.Context |
| `collName` | 目标 Collection 的名称。 | String |

## 抛出

- `ErrClientNotReady`：客户端连接失败则抛出此异常。

- `ErrCollectionNotExists`: 指定 Collection 不存在则抛出此异常。

## 返回结果

None