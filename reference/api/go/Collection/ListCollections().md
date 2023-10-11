---
displayed_sidebar: referenceSidebar
sidebar_position: 2
slug: /go/list_collection
---

# ListCollections()

调用接口查询当前已创建的所有 Collection。注意，Schema 信息不包含在返回结果中。

```go
client.ListCollections(ctx)
```

## 请求示例

```go
ctx := context.Background()

listColl, err := client.ListCollections(ctx)

if err != nil {
  log.Fatal("failed to list all collections:", err.Error())
}

log.Println(listColl)
```

## 请求参数

| 参数          | 描述                          | 类型     |
|--------------------|--------------------------------------|----------|
| `ctx` | 控制 API 调用进程的上下文。 | context.Context |

## 抛出

`ErrClientNotReady`: 客户端连接失败则抛出此异常。

## 返回结果

Collection 对象，包含集群中所有已创建的 Collection。