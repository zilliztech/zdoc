---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /python/milvus-client
---


# MilvusClient()

调用接口创建 MilvusClient 实例。

```python
MilvusClient(
    uri="PUBLIC_ENDPOINT", # 从 Zilliz Cloud 控制台获取的集群公网地址
    token="USER:PASSWORD", # 创建集群时指定的用户名和密码
    timeout
)
```

## 请求示例

使用用户名和密码为集群创建 MilvusClient 实例：

```python
    from pymilvs import MilvusClient

    client = MilvusClient(
    uri='https://<CLUSTER-ID>.<CLOUD-REGION>.vectordb.zillizcloud.com:<ACCESS-PORT>',
    token='<USER:PASSWORD>',
    )
```

## 请求参数

| 参数      | 描述                                                                                         | 类型   | 是否必选 |
|-----------|--------------------------------------------------------------------------------------------|--------|---------|
| `uri`     | 用于连接到集群的公网地址。                                                                    | String | 是       |
| `token`   | 用于鉴权的集群凭证，由用户名和密码组成。                                                       | String | 是       |
| `timeout` | 客户端等待的超时时间，单位为秒。如果设置为 None，客户端会一直等待，直到服务器响应或发生错误。 | Float  | 否       |

## 抛出

None

## 返回结果

MilvusClient 实例。