---
title: "listFileResources() | Node.js"
slug: /node/node/FileResources-listFileResources
sidebar_label: "listFileResources()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出在 Milvus 元数据中注册的文件资源。 | Node.js"
type: docx
token: GK8hdiDs8olcOtxu0BKc89Vxn0b
sidebar_position: 2
keywords: 
  - 文件资源
  - Analyzer
  - 词典
  - zilliz
  - zilliz cloud
  - 云
  - listFileResources()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listFileResources()

此操作会列出在 Milvus 元数据中注册的文件资源。

```javascript
await milvusClient.listFileResources(data?)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.listFileResources({
    timeout?: number
})
```

**参数：**

- **timeout** （*number*） -

    此操作的超时时长，单位为毫秒。

**返回：**

*Promise&lt;ListFileResourcesResponse&gt;*

此方法返回一个 promise，解析为 **ListFileResourcesResponse** 对象。

```javascript
{
    resources: FileResourceInfo[],
    status:  ResStatus
}
```

**参数：**

- **resources** （*FileResourceInfo[]*） -

    在 Milvus 元数据中注册的文件资源列表。

    - **id** （*string*） -

        文件资源的内部 ID。

    - **name** （*string*） -

        文件资源的名称。

    - **path** （*string*） -

        文件资源的路径。

- **status** （*ResStatus*） -

    一个 **ResStatus** 对象。

    - **code** （*number*） -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** （*string* | *number*） -

        表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

    - **reason** （*string*） -

        用于说明所报告错误的原因。如果此操作成功，则其值保持为空字符串。

**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.listFileResources();
```
