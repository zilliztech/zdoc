---
title: "listImportTasks() | Node.js"
slug: /node/node/DataImport-listImportTasks
sidebar_label: "listImportTasks()"
beta: false
added_since: inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "コレクションのインポートタスクを一覧表示し、一括インポート操作のステータスと詳細を示します。 | Node.js"
type: docx
token: KX8pd5PnGoo8UAx8QhhcI5YpnHg
sidebar_position: 15
keywords: 
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - listImportTasks()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listImportTasks()

コレクションのインポートタスクを一覧表示し、一括インポート操作のステータスと詳細を示します。

```javascript
await milvusClient.listImportTasks(data: ListImportTasksReq)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.listImportTasks({
    collection_name: string,
    limit?: number,
    timeout?: number,
})
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    コレクションの名前。

- **limit** (*number*) -

    返されるタスクの最大数。すべてのタスクを取得するには `0` を設定します。省略可能です。

- **timeout** (*number*) -

    ミリ秒単位の RPC タイムアウト。省略可能です。

**RETURNS** *Promise&lt;ListImportTasksResponse&gt;*

このメソッドは、**ListImportTasksResponse** オブジェクトに解決される promise を返します。

```typescript
{
    tasks: GetImportStateResponse[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **tasks** (*GetImportStateResponse[]*) -<br/>
  インポートタスク記述子のリスト。各エントリには、タスクの状態、行数、セグメント ID、および作成タイムスタンプが含まれます。

    - **state** (*ImportState*) -

        タスクの状態。指定可能な値は **ImportPending**、**ImportFailed**、**ImportStarted**、**ImportPersisted**、**ImportCompleted**、**ImportFailedAndCleaned** です。

    - **row_count** (*number*) -

        タスクによってインポートされた行数。

    - **id_list** (*number[]*) -

        利用可能な場合、インポートされた行に割り当てられた自動生成主キー。

    - **infos** (*KeyValuePair[]*) -

        診断用のキーと値のペア（例: **failed_reason**）。

    - **id** (*number*) -

        タスク識別子。

    - **collection_id** (*number*) -

        インポートを受け取ったコレクション。

    - **segment_ids** (*number[]*) -

        タスクによって生成されたセグメント ID。

    - **create_ts** (*number*) -

        タスクの作成タイムスタンプ。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await client.listImportTasks({
    collection_name: 'my_collection',
});
console.log(res.tasks);
```
