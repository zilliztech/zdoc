---
title: "bulkInsert() | Node.js"
slug: /node/node/DataImport-bulkInsert
sidebar_label: "bulkInsert()"
beta: false
added_since: inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたデータファイルから Milvus にデータをインポートします。 | Node.js"
type: docx
token: V65MdZWnsoMwpfxkt0sc5qQPnbb
sidebar_position: 9
keywords: 
  - 自然言語検索
  - 類似性検索
  - マルチモーダル RAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - bulkInsert()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# bulkInsert()

この操作は、指定されたデータファイルから Milvus にデータをインポートします。

```javascript
await milvusClient.bulkInsert(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.bulkInsert({
    db_name?: string,
    collection_name: string,
    partition_name?: string,
    files: string[],
    timeout?: number,
    options?: KeyValuePair<string, string | number>[]
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象の collection が属するデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    対象の collection の名前。

- **partition_name** (*string*) -

    対象の partition の名前。

- **files** (*string[]*) -

    インポート元となるデータファイルのパス一覧。

- **timeout** (*number*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、応答が返るかエラーが発生した時点でこの操作はタイムアウトします。

- **options** (*KeyValuePair&lt;string, string | number&gt;[]*) -   

    現在の操作に対する追加オプション。キーと値のペアで指定します。

**RETURN TYPE:**

*Promise*\<*ImportResponse*>

**RETURNS** *Promise&lt;ImportResponse&gt;*

このメソッドは、**ImportResponse** オブジェクトに解決される promise を返します。

```typescript
{
    tasks: number[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **tasks** (*number[]*) -<br/>
  data node にディスパッチされた非同期インポートタスクの識別子です。完了をポーリングするには、これらの値を `listImportTasks()` に渡します。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

## Examples\{#examples}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const importResponse = await milvusClient.bulkInsert({
  collection_name: 'my_collection',
  files: ['path-to-data-file.json'],
});
```
