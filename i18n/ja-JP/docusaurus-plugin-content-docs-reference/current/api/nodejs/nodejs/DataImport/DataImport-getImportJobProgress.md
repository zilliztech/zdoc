---
title: "getImportJobProgress() | Node.js"
slug: /node/node/DataImport-getImportJobProgress
sidebar_label: "getImportJobProgress()"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "この操作は、HTTP インポートジョブの進行状況を取得します。ジョブ状態、インポート済み行数、ファイルの詳細、失敗理由をポーリングするために使用します。 | Node.js"
type: origin
token: shared-DataImport-getImportJobProgress
displayed_sidebar: nodeSidebar

---

# getImportJobProgress()

この操作は、HTTP インポートジョブの進行状況を取得します。ジョブ状態、インポート済み行数、ファイルの詳細、失敗理由をポーリングするために使用します。

```javascript
await milvusClient.getImportJobProgress(params: HttpImportProgressReq)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.getImportJobProgress({
    jobId: string,
    dbName?: string,
    projectId?: string,
    regionId?: string,
})
```

**パラメーター:**

- **jobId** (*string*) -

    **[必須]**

    `createImportJobs()` によって返されるインポートジョブ ID を指定します。

- **dbName** (*string*) -

    データベース名を指定します。

- **projectId** (*string*) -

    Zilliz Cloud プロジェクトの ID。任意です。

- **regionId** (*string*) -

    Zilliz Cloud リージョンの ID。任意です。

**戻り値:**

*Promise&lt;HttpImportProgressResponse&gt;*

このメソッドは、**HttpImportProgressResponse** オブジェクトに解決される promise を返します。

**パラメーター:**

- **code** (*number*) -

    HTTP API レスポンスコードを指定します。

- **data.jobId** (*string*) -

    インポートジョブ ID を指定します。

- **data.progress** (*number*) -

    ジョブの進行状況を指定します。

- **data.state** (*string*) -

    現在のジョブ状態を指定します。

- **data.totalRows** (*number*) -

    利用可能な場合、合計行数を指定します。

- **data.importedRows** (*number*) -

    利用可能な場合、インポート済みの行数を指定します。

- **data.fileSize** (*number*) -

    利用可能な場合、ファイルの合計サイズをバイト単位で指定します。

- **data.completeTime** (*string*) -

    ジョブが完了したときの完了時刻を指定します。

- **data.collectionName** (*string*) -

    対象のコレクション名を指定します。

- **data.details** (*ImportJobDetailType[]*) -

    利用可能な場合、ファイルごとのインポート進行状況の詳細を一覧表示します。

- **data.reason** (*string*) -

    ジョブが失敗したときの失敗理由を指定します。


**例外:**

- **Error**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```javascript
const progress = await milvusClient.getImportJobProgress({
    jobId: 'job-1234567890',
});
```
