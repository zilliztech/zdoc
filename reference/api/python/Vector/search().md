---
displayed_sidebar: referenceSidebar
sidebar_position: 1
slug: /python/search
---

# search()

调用接口基于一个或多个向量执行近似最近邻（Approximate Nearest Neighbor，ANN）检索。

```python
search(
    collection_name,
    data,
    filter,
    limit,
    output_fields,
    search_params,
    timeout
)
```

## 请求示例

- 基于单个向量执行 ANN 检索：

    ```python
    from pymilvus import MilvusClient

    client = MilvusClient(uri, token)

    client.search(
        collection_name='medium_articles',
        data = [[-0.008266705,-0.009836753,0.04397694,-0.00025456678, ..., -0.016839132]],
        limit=5,
	    output_fields=["title", "link"]
    )
    ```

- 基于多个向量执行 ANN 检索：

    ```python
    from pymilvus import MilvusClient

    client = MilvusClient(uri, token)

    client.search(
        collection_name='medium_articles',
        data=[
                [-0.008266705,-0.009836753,0.04397694,-0.00025456678, ..., -0.016839132],
                [0.041732933, 0.013779674, -0.027564144, -0.013061441, ..., 0.030096486]
            ],
        limit=5,
        output_fields=["title", "link"]
    )
    ```

- 从使用定制 Schema 的 Collection 中检索，并指定过滤表达式：

    ```python
    from pymilvus import MilvusClient

    client = MilvusClient(uri, token)

    client.search(
        collection_name='medium_articles',
        data = [[0.041732933, 0.013779674, -0.027564144, -0.013061441, ..., 0.030096486]],
        limit=5,
        filter="10 < reading_time < 15", # 筛选 reading_time 大于 10 但小于 15 的文章
        output_fields=["title", "link"]
    )
    ```

- 从使用动态 Schema 的 Collection 中检索，并指定过滤表达式：

    ```python
    from pymilvus import MilvusClient

    client = MilvusClient(uri, token)

    client.search(
        collection_name='medium_articles',
        data = [[0.041732933, 0.013779674, -0.027564144, -0.013061441, ..., 0.030096486]],
        limit=5,
        filter='$meta["claps"] > 30 and responses < 10',
        output_fields=['title', 'claps', 'responses']
    )
    ```

    上述代码展示了如何获取 Schema 中未定义的 `claps` 和 `responses` 字段。

## 请求参数

| 参数      | 描述                                                                                         | 类型   | 是否必选 |
|-----------|--------------------------------------------------------------------------------------------|--------|---------|
| `collection_name` | 待检索的 Collection 名称。 | String | 是     |
| `data` | 指定的向量值。 | list[] | 是     |
| `limit` | 每次检索最多返回的数据条数。默认值：**10**。| Integer | 否    | |
| `filter` | 过滤表达式。 | String | 否    |
| `output_fields` | 指定返回字段。| list[String] | 否    |
| `search_params` | 搜索参数。| Dictionary | 否    |
| `timeout` | 客户端等待的超时时间，单位为秒。如果设置为 None，客户端会一直等待，直到服务器响应或发生错误。 | Float | 否     |

## 抛出

`ValueError`: 指定 Collection 不存在则抛出此异常。

## 返回结果

以字典返回除向量字段外的其他所有字段。