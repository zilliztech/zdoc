---
title: "getIndexStatistics() | Node.js"
slug: /node/node/Management-getIndexStatistics
sidebar_label: "getIndexStatistics()"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "この操作は、指定したインデックスの統計情報を取得します。統計情報には、インデックス済みの行数と総行数が含まれます。 | Node.js"
type: origin
token: shared-Management-getIndexStatistics
displayed_sidebar: nodeSidebar

---

# getIndexStatistics()

この操作は、指定したインデックスの統計情報を取得します。統計情報には、インデックス済みの行数と総行数が含まれます。

```javascript
await milvusClient.getIndexStatistics(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.getIndexStatistics({
      db_name?: string,
      collection_name: string,
      field_name?: string,
      index_name?: string,
      timeout?: number
});
```

**パラメーター：**

- **db_name** (*string*) -

    対象のコレクションを保持するデータベースの名前です。

- **collection_name** (*string*) -

    **必須**

    既存のコレクションの名前です。

- **field_name** (*string*) -

    コレクション内の既存フィールドの名前です。

- **index_name** (*string*) -

    統計情報を取得するインデックスの名前です。

- **timeout** (*number*) -

    この操作のタイムアウト時間です。**None** に設定すると、応答が到着した場合、またはエラーが発生した場合にこの操作がタイムアウトすることを示します。

**戻り値：**

*Promise&lt;DescribeIndexResponse&gt;*

このメソッドは、**DescribeIndexResponse** オブジェクトに解決される Promise を返します。

```javascript
{
    index_descriptions: IndexDescription[],
    status:  ResStatus
}
```

**パラメーター：**

- **index_descriptions** (*IndexDescription[]*) -

要求されたインデックスのインデックス記述のリストです。各エントリには **indexed_rows** と **total_rows** が含まれます。

- **ResStatus**
A **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合、**0** のままになります。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合、**Success** のままになります。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合、空の文字列のままになります。


**例外：**

- **Error**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.getIndexStatistics({
    collection_name: 'my_collection',
    index_name: 'my_index',
});
```
