---
title: "listImportJobs() | Node.js"
slug: /node/node/DataImport-listImportJobs
sidebar_label: "listImportJobs()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出通过 HTTP 导入任务 API 提交的导入任务。您可以使用它查看任务 ID、Collection 名称、进度和状态。 | Node.js"
type: docx
token: CdK7dr8pyo36PZxpGFKcrZsjnEf
sidebar_position: 8
keywords: 
  - k 近邻算法
  - ANNS
  - 向量搜索
  - knn 算法
  - zilliz
  - zilliz cloud
  - 云
  - listImportJobs()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listImportJobs()

此操作会列出通过 HTTP 导入任务 API 提交的导入任务。您可以使用它查看任务 ID、Collection 名称、进度和状态。

```javascript
await milvusClient.listImportJobs(params: HttpImportListReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.listImportJobs({
    collectionName: string,
    dbName?: string,
    projectId?: string,
    regionId?: string,
})
```

**参数：**

- **collectionName** (*string*) -

    **[必需]**

    指定目标 Collection 名称。

- **dbName** (*string*) -

    指定 Database 名称。

- **projectId** (*string*) -

    Zilliz Cloud 项目的 ID。可选。

- **regionId** (*string*) -

    Zilliz Cloud 区域的 ID。可选。

**返回：**

*Promise&lt;HttpImportListResponse&gt;*

此方法返回一个 promise，解析为 **HttpImportListResponse** 对象。

**参数：**

- **code** (*number*) -

    指定 HTTP API 响应代码。

- **data.records** (*ImportJobType[]*) -

    列出导入任务，包括 Collection 名称、任务 ID、进度和状态。

- **message** (*string*) -

    指定响应消息。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
const jobs = await milvusClient.listImportJobs({
    collectionName: 'my_collection',
    dbName: 'default',
});
```
