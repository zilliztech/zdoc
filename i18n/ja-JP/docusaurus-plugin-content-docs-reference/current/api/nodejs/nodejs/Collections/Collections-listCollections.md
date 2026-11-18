---
title: "listCollections() | Node.js"
slug: /node/node/Collections-listCollections
sidebar_label: "listCollections()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists all existing コレクション. | Node.js"
type: docx
token: Djg7dlb5NoINz9xOAs1cyY67nsh
sidebar_position: 15
keywords: 
  - Milvus はどのように動作するか
  - Zilliz ベクトル データベース
  - Zilliz データベース
  - 非構造化データ
  - zilliz
  - zilliz cloud
  - cloud
  - listCollections()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listCollections()

This operation lists all existing コレクション.

```javascript
milvusClient.listCollections();
```

## Request Syntax\{#request-syntax}

```javascript
listCollections({
    collection_names?: string[],
    type: ShowCollectionsType,
    db_name?: string,
    timeout?: number
})
```

**PARAMETERS:**

- **collection_names** (*string[]*) -

    フィルタリング対象とするコレクション名のリストです。指定しない場合は、すべてのコレクションが返されます。

- **type** (*ShowCollectionsType*) 

    この操作のスコープです。指定可能な値は **All** または **Loaded** です。

- **db_name** (*string*) -

    コレクションを一覧表示する対象のデータベースの名前です。

- **timeout** (*number*) -

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、いずれかのレスポンスが返されるかエラーが発生した時点でこの操作はタイムアウトします。

**戻り値:**

*Promise&lt;ShowCollectionsResponse&gt;*

このメソッドは、**ShowCollectionsResponse** オブジェクトに解決される promise を返します。

```javascript
{
    data: CollectionData[],
    created_timestamps: string[],
    created_utc_timestamps: string[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **data** (*CollectionData[]*) -
コレクションデータオブジェクトのリストです。各エントリには、コレクション名、ID、タイムスタンプ、読み込み済みの割合が含まれます。

- **created_timestamps** (*string[]*) -
各コレクションが作成された時点を示すハイブリッドタイムスタンプのリストです。

- **created_utc_timestamps** (*string[]*) -
各コレクションが作成された時点を示す UTC タイムスタンプのリストです。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。


**例外:**

- **Error**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## Example\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await milvusClient.listCollections();
```
