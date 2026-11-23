---
title: "addFileResource() | Node.js"
slug: /node/node/FileResources-addFileResource
sidebar_label: "addFileResource()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会向 Milvus 元数据添加命名文件资源。 | Node.js"
type: docx
token: RnyUdtGbFoIC7AxyhmNcbudYnhb
sidebar_position: 1
keywords: 
  - 文件资源
  - Analyzer
  - 字典
  - zilliz
  - zilliz cloud
  - 云
  - addFileResource()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# addFileResource()

此操作会向 Milvus 注册文件资源。当服务器端功能需要命名文件资源时，请使用此操作。

```javascript
await milvusClient.addFileResource(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.addFileResource({
    name: string,
    path: string,
    timeout?: number
})
```

**参数：**

- **name** (*string*) -

    **[必需]**

    文件资源的唯一名称。

- **path** (*string*) -

    **[必需]**

    该资源在服务器端可见的文件路径。

- **timeout** (*number*) -

    此操作的超时时间，单位为毫秒。

**返回值：**

*Promise&lt;ResStatus&gt;*

此方法返回一个 Promise，其解析结果为 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    指示操作结果的代码。如果此操作成功，该值保持为 **0**。

- **error_code** (*string* | *number*) -

    指示所发生错误的错误代码。如果此操作成功，该值保持为 **Success**。

- **reason** (*string*) -

    指示所报告错误原因的原因说明。如果此操作成功，该值为空字符串。

**异常：**

- **Error**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const resStatus = await milvusClient.addFileResource({
    name: 'embedding_model',
    path: '/models/embedding.bin',
});
```
