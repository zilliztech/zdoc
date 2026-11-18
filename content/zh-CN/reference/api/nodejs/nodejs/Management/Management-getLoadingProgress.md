---
title: "getLoadingProgress() | Node.js"
slug: /node/node/Management-getLoadingProgress
sidebar_label: "getLoadingProgress()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作用于获取特定 Collection 的加载进度。 | Node.js"
type: docx
token: DkImdRkJwoUmdqxzqn1cpQr9nhy
sidebar_position: 13
keywords: 
  - 自然语言搜索
  - 相似性搜索
  - 多模态 RAG
  - llm 幻觉
  - zilliz
  - zilliz cloud
  - 云
  - getLoadingProgress()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# getLoadingProgress()

此操作用于获取特定 Collection 的加载进度。

```javascript
await milvusClient.getLoadingProgress(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.getLoadingProgress({
      db_name?: string,
      collection_name: string,
      partition_names?: string[]
      timeout?: number
});
```

**参数：**

- **db_name** (*string*) -

    保存目标 Collection 的 Database 名称。

- **collection_name** (*string*) -

    **[必需]**

    目标 Collection 的名称。

- **partition_names** (*string[]*) -

    目标 Partition 的名称。

- **timeout** (number) -

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回：**

*Promise&lt;GetLoadingProgressResponse&gt;*

此方法返回一个 promise，解析为 **GetLoadingProgressResponse** 对象。

```javascript
{
    progress: string,
    status:  ResStatus
}
```

**参数：**

- **progress** (*string*) -
加载操作的完成百分比，以 **"0"** 到 **"100"** 之间的整数表示。当此值达到 **"100"** 时，Collection 即完全加载。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的原因。如果此操作成功，则其值保持为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.getLoadingProgress({
    collection_name: 'my_collection',
});
```
