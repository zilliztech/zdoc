---
title: "listImportJobs() | Node.js"
slug: /node/node/DataImport-listImportJobs
sidebar_label: "listImportJobs()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists import jobs submitted through the HTTP import job API. Use it to review job IDs, コレクション names, progress, and state. | Node.js"
type: docx
token: CdK7dr8pyo36PZxpGFKcrZsjnEf
sidebar_position: 8
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - ベクトル search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - listImportJobs()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listImportJobs()

This operation lists import jobs submitted through the HTTP import job API. Use it to review job IDs, コレクション names, progress, and state.

```javascript
await milvusClient.listImportJobs(params: HttpImportListReq)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.listImportJobs({
    collectionName: string,
    dbName?: string,
    projectId?: string,
    regionId?: string,
})
```

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    対象のコレクション名を指定します。

- **dbName** (*string*) -

    データベース名を指定します。

- **projectId** (*string*) -

    Zilliz Cloud プロジェクトの ID です。任意です。

- **regionId** (*string*) -

    Zilliz Cloud リージョンの ID です。任意です。

**戻り値:**

*Promise&lt;HttpImportListResponse&gt;*

このメソッドは、**HttpImportListResponse** オブジェクトに解決される promise を返します。

**パラメーター:**

- **code** (*number*) -

    HTTP API のレスポンスコードを指定します。

- **data.records** (*ImportJobType[]*) -

    コレクション名、ジョブ ID、進行状況、および状態を含むインポートジョブを一覧表示します。

- **message** (*string*) -

    レスポンスメッセージを指定します。


**例外:**

- **Error**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```javascript
const jobs = await milvusClient.listImportJobs({
    collectionName: 'my_collection',
    dbName: 'default',
});
```
