---
title: "getImportState() | Node.js"
slug: /node/node/DataImport-getImportState
sidebar_label: "getImportState()"
beta: false
added_since: v2.6.12
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定のインポートタスクの現在の状態とメタデータを取得します。`bulkInsert()` の呼び出し後、完了をポーリングするために使用します。 | Node.js"
type: docx
token: DJ4NdIIQ4oeA7gx4bDQcxT3gn0c
sidebar_position: 17
keywords: 
  - ベクトル類似検索
  - 近似最近傍探索
  - DiskANN
  - Sparse vector
  - zilliz
  - zilliz cloud
  - cloud
  - getImportState()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getImportState()

この操作は、特定のインポートタスクの現在の状態とメタデータを取得します。`bulkInsert()` の呼び出し後、完了をポーリングするために使用します。

```typescript
await milvusClient.getImportState(data)
```

## Request Syntax\{#request-syntax}

```typescript
await milvusClient.getImportState({
    task: number,
    timeout?: number
})
```

**パラメータ:**

- **task** (*number*) -

    **[必須]** `bulkInsert()` によって返されるインポートタスクの ID。

- **timeout** (*number*) -

    RPC に許可するオプションの時間（ミリ秒）。

**戻り値** *Promise&lt;GetImportStateResponse&gt;*

このメソッドは、**GetImportStateResponse** オブジェクトに解決される promise を返します。

```typescript
{
    state: ImportState,
    row_count: number,
    id_list: number[],
    infos: KeyValuePair[],
    id: number,
    collection_id: number,
    segment_ids: number[],
    create_ts: number,
    status: ResStatus
}
```

**パラメータ:**

- **state** (*ImportState*) -

    インポートタスクの現在の状態。取り得る値には **ImportPending**、**ImportStarted**、**ImportPersisted**、**ImportCompleted**、**ImportFailed**、**ImportFailedAndCleaned** があります。

- **row_count** (*number*) -

    インポートまたは解析された行数。

- **id_list** (*number[]*) -

    主キーが autoID を使用している場合の自動生成 ID のリスト。

- **infos** (*KeyValuePair[]*) -

    進行状況、ファイルパス、失敗理由など、インポートタスクに関する追加情報。

- **id** (*number*) -

    インポートタスクの ID。

- **collection_id** (*number*) -

    インポートタスクに関連付けられた collection ID。

- **segment_ids** (*number[]*) -

    インポートタスクによって作成された segment ID。

- **create_ts** (*number*) -

    インポートタスクが作成された時刻のタイムスタンプ。

- **ResStatus**

    **ResStatus** オブジェクト。

    - **code** (*number*) -

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

    報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.getImportState({ task: 123456 });
```
