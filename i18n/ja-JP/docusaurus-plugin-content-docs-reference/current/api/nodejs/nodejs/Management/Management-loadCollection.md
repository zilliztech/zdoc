---
title: "loadCollection() | Node.js"
slug: /node/node/Management-loadCollection
sidebar_label: "loadCollection()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation loads the data of a specific コレクション into memory. | Node.js"
type: docx
token: LoNvdRK80oWllFxV0H6co0HrnBe
sidebar_position: 17
keywords: 
  - nn search
  - llm eval
  - Sparse vs Dense
  - Dense ベクトル
  - zilliz
  - zilliz cloud
  - cloud
  - loadCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# loadCollection()

This operation loads the data of a specific コレクション into memory.

```javascript
await milvusClient.loadCollection(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.loadCollection({ 
    db_name: string,
    collection_name: string,
    refresh?: boolean,
    replica_number?: number,
    resource_groups?: string[],
    load_fields?: string[],
    skip_load_dynamic_field?: boolean,
    timeout?: number
})
```

**パラメータ:**

- **db_name** (*string*) -

    The name of the データベース that holds the target コレクション.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of a コレクション.

- **refresh** (*boolean*) -

    Whether to refresh the load status of an already loaded コレクション.

- **replica_number** (*number*) -

    The number of replicas of the コレクション to load.

- **resource_groups** (*string[]*) -

    ロードされたコレクションを保持するリソースグループの名前。

- **load_fields** (*string[]*) -

    ロードするフィールド名の一覧。指定しない場合は、すべてのフィールドがロードされます。

- **skip_load_dynamic_field** (*boolean*) -

    動的フィールドのロードをスキップするかどうか。

- **timeout** (*number*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、いずれかのレスポンスが返るか、エラーが発生した時点でこの操作はタイムアウトします。

**戻り値:**

*Promise\<ResStatus\>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**パラメータ:**

- **code** (*number*) -

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す内容。この操作が成功した場合は空文字列のままです。


**例外:**

- **Error**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const resStatus = await milvusClient.loadCollection({ collection_name: 'my_collection' });
```
