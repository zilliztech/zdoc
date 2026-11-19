---
title: "getImportJobProgress() | Node.js"
slug: /node/node/DataImport-getImportJobProgress
sidebar_label: "getImportJobProgress()"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "此操作获取 HTTP 导入任务的进度。您可以使用它轮询任务状态、已导入行数、文件详细信息和失败原因。 | Node.js"
type: origin
token: shared-DataImport-getImportJobProgress
displayed_sidebar: nodeSidebar

---

# getImportJobProgress()

此操作获取 HTTP 导入任务的进度。您可以使用它轮询任务状态、已导入行数、文件详细信息和失败原因。

```javascript
await milvusClient.getImportJobProgress(params: HttpImportProgressReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.getImportJobProgress({
    jobId: string,
    dbName?: string,
    projectId?: string,
    regionId?: string,
})
```

**参数：**

- **jobId** （*string*） -

    **[必需]**

    指定由 `createImportJobs()` 返回的导入任务 ID。

- **dbName** （*string*） -

    指定 Database 名称。

- **projectId** （*string*） -

    Zilliz Cloud 项目的 ID。可选。

- **regionId** （*string*） -

    Zilliz Cloud 区域的 ID。可选。

**返回：**

*Promise&lt;HttpImportProgressResponse&gt;*

此方法返回一个 Promise，解析为 **HttpImportProgressResponse** 对象。

**参数：**

- **code** （*number*） -

    指定 HTTP API 响应代码。

- **data.jobId** （*string*） -

    指定导入任务 ID。

- **data.progress** （*number*） -

    指定任务进度。

- **data.state** （*string*） -

    指定当前任务状态。

- **data.totalRows** （*number*） -

    在可用时，指定总行数。

- **data.importedRows** （*number*） -

    在可用时，指定已导入行数。

- **data.fileSize** （*number*） -

    在可用时，指定文件总大小，单位为字节。

- **data.completeTime** （*string*） -

    在任务完成时，指定完成时间。

- **data.collectionName** （*string*） -

    指定目标 Collection 名称。

- **data.details** （*ImportJobDetailType[]*） -

    在可用时，列出每个文件的导入进度详细信息。

- **data.reason** （*string*） -

    指定任务失败时的失败原因。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
const progress = await milvusClient.getImportJobProgress({
    jobId: 'job-1234567890',
});
```
