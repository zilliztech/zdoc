---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /python/insert
---
# insert()

调用接口将 Entity 插入到 Collection。Zilliz Cloud 支持以行或列插入数据。

```python
insert(
    collection_name,
    data,
    batch_size,
    progress_bar,
    timeout
)
```

## 请求示例

- 以行插入数据：

    ```python
    # 按行准备数据
    import json

    with open('/path/to/downloaded/dataset') as f:
        data = json.load(f)
        list_of_rows = data['rows'][0]

    # 创建 MilvusClient 实例
    from pymilvus import MilvusClient

    client = MilvusClient(uri, token)

    client.insert(list_of_rows)
    ```

- 以列插入数据：

    ```python
    # 按列准备数据
    import json

    with open('/path/to/downloaded/dataset') as f:
        data = json.load(f)
        keys = data['rows'][0].keys()
        entity = data['rows'][0]
        list_of_columns = [ [entity.get(x)] for x in keys]

    # 创建 MilvusClient 实例
    from pymilvus import MilvusClient

    client = MilvusClient(uri, token)

    client.insert(list_of_columns)
    ```

## 请求参数

| 参数              | 描述                                                                                                                                                                  | 类型             | 是否必选 |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|---------|
| `collection_name` | 待插入数据的 Collection 名称。                                                                                                                                         | String           | 是       |
| `data`            | 待插入数据，以字典的形式插入，每个字典代表一个 Entity。 Schema 中定义的所有字段必须以键的形式包含在字典中。 您也可以将 Schema 中未定义的字段以动态键插入到 Collection 中。 | list[Dictionary] | 是       |
| `batch_size`      | 批量插入数据大小。                                                                                                                                                     | Integer          | 否       |
| `progress_bar`    | 是否展示进度条。                                                                                                                                                       | Boolean          | 否       |
| `timeout`         | 客户端等待的超时时间，单位为秒。如果设置为 None，客户端会一直等待，直到服务器响应或发生错误。                                                                              | Float            | 否       |

## 抛出

`DataNotMatchException`：如果待插入数据缺少必须字段，则抛出此异常。

`MilvusException`: 如果发生一般错误，则抛出此异常。

## 返回结果

按列返回已插入 Entity 的主键值。