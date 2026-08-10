---
title: "alterIndexProperties() | Node.js"
slug: /node/node/Management-alterIndexProperties
sidebar_label: "alterIndexProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会修改特定索引属性的设置。 | Node.js"
type: docx
token: PcQcdDwthoSEZaxI6GncpUpGnBh
sidebar_position: 1
keywords: 
  - AI 聊天机器人
  - 余弦距离
  - 什么是向量 Database
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - alterIndexProperties()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterIndexProperties()

此操作会修改特定索引属性的设置。

```javascript
await milvusClient.alterIndexProperties(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.alterIndexProperties({
     db_name?: string,
     collection_name: string,
     index_name: string,
     params: Record<string, string | number | boolean>,
     timeout?: number
});
```

**参数：**

- **db_name** (*string*) -

    持有目标 Collection 的 Database 名称。

- **collection_name** (*string*) -

    **[必需]**

    现有 Collection 的名称。

- **index_name** (*string*) -

    **[必需]**

    目标索引的名称。

- **params** (*Record*\<*string*, *string* | *number* | *boolean*>) -

    **[必需]**

    要修改的索引属性及其预期值。可用属性如下：

    - **mmap.enabled** (*bool*) -

        是否为指定索引启用 mmap。将其设置为 `True` 会将指定索引卸载到磁盘。详情请参见 [使用 mmap](/docs/use-mmap)

- **timeout** (number) -

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作才会超时。

**返回** *Promise\<ResStatus>*

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

    表示操作结果的代码。如果此操作成功，则其值为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误代码。如果此操作成功，则其值为 **Success**。

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值为空字符串。

## 示例\{#example}

```java
const milvusClient = new MilvusClient(MILUVS_ADDRESS);
const alterIndexReq = {
    collection_name: 'my_collection',
    params: { nlist: 20 },
};
const res = await milvusClient.alterIndex(alterIndexReq);
console.log(res);
```

