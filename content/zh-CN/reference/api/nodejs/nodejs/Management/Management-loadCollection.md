---
title: "loadCollection() | Node.js"
slug: /node/node/Management-loadCollection
sidebar_label: "loadCollection()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将特定 Collection 的数据加载到内存中。 | Node.js"
type: docx
token: LoNvdRK80oWllFxV0H6co0HrnBe
sidebar_position: 17
keywords: 
  - nn 搜索
  - llm 评估
  - 稀疏 vs 稠密
  - 稠密向量
  - zilliz
  - zilliz cloud
  - cloud
  - loadCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# loadCollection()

此操作将特定 Collection 的数据加载到内存中。

```javascript
await milvusClient.loadCollection(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.loadCollection({ 
    db_name: string,
    collection_name: string,
    refresh?: boolean,
    replica_number?: number,
    resource_groups?: string[],
    load_fields?: string[],
    skip_load_dynamic_field?: boolean,
    timeout?: number
})
```

**参数：**

- **db_name** (*string*) -

    持有目标 Collection 的 Database 名称。

- **collection_name** (*string*) -

    **[必需]**

    Collection 名称。

- **refresh** (*boolean*) -

    是否刷新已加载 Collection 的加载状态。

- **replica_number** (*number*) -

    要加载的 Collection 的副本数。

- **resource_groups** (*string[]*) -

    已加载 Collection 所在资源组的名称。

- **load_fields** (*string[]*) -

    要加载的字段名称列表。如果未指定，则加载所有字段。

- **skip_load_dynamic_field** (*boolean*) -

    是否跳过加载动态字段。

- **timeout** (*number*) -

    此操作的超时时长。 

    将此项设置为 **None** 表示当返回任意响应或发生错误时，此操作将超时。

**返回：**

*Promise\<ResStatus\>*

此方法返回一个 promise，该 promise 会解析为 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。 

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const resStatus = await milvusClient.loadCollection({ collection_name: 'my_collection' });
```
