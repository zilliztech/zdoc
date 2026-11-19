---
title: "count() | Node.js"
slug: /node/node/Vector-count
sidebar_label: "count()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたフィルタリング式に一致するエンティティの数をカウントします。 | Node.js"
type: docx
token: NaOadUNSpo1EsIxPMSfc0R4Hnfb
sidebar_position: 1
keywords: 
  - 動画検索
  - AI ハルシネーション
  - AI エージェント
  - セマンティック検索
  - zilliz
  - zilliz cloud
  - クラウド
  - count()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# count()

この操作は、指定されたフィルタリング式に一致するエンティティの数をカウントします。

```javascript
await milvusClient.count(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.count({
    db_name?: string,
    collection_name: string,
    expr?: string,
    filter?: string,
    exprValues?: keyValueObj,
    partition_names?: string[],
    consistency_level?: ConsistencyLevelEnum,
    timeout?: number
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the データベース that holds the target コレクション.

- **collection_name** (*string*) -

    **[REQUIRED]**

    カウント対象のコレクションの名前。

- **expr** (*string*) -

    A スカラー filtering condition to filter matching entities. 

    You can set this parameter to an empty string to skip スカラー filtering. To build a スカラー filtering condition, refer to [Boolean Expression Rules](https://milvus.io/docs/boolean.md). 

- **filter** (*string*) -

    フィルタリング条件の **expr** のエイリアス。

- **exprValues** (*keyValueObj*) -

    `filter` で [Filtering Templating](https://milvus.io/docs/filtering-templating.md) に記載されているとおりにプレースホルダーを使用する場合は、このパラメーターの値として、これらのプレースホルダーの実際の値をキーと値のペアで指定できます。

- **partition_names** (*string[]*) -

    カウント対象のパーティション名のリスト。

- **consistency_level** (*ConsistencyLevelEnum*) -

    対象コレクションの整合性レベルです。値はデフォルトで **Bounded**（**2**）であり、オプションは **Strong**（**0**）、**Session**（**1**）、**Bounded**（**2**）、**Eventually**（**3**）です。[ConsistencyLevelEnum](./Collections-ConsistencyLevelEnum) を参照してください。

- **timeout** (*number*)  

    この操作のタイムアウト時間。これを **None** に設定すると、レスポンスが返るかエラーが発生した時点でこの操作はタイムアウトします。

**戻り値:**

*Promise&lt;CountResult&gt;*

このメソッドは、**CountResult** オブジェクトに解決される promise を返します。

```javascript
{
    data: number,
    status:  ResStatus
}
```

**PARAMETERS:**

- **data** (*number*) -
コレクション内で、指定されたフィルタリング式に一致する行数です。式を指定しない場合は、総行数です。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。


**例外:**

- **Error**

    この操作中に何らかのエラーが発生すると、この例外がスローされます。

## 例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const num_entities = await milvusClient.count({
   collection_name: 'my_collection',
   expr: "age in [1,2,3,4,5,6,7,8]",
});

// 1000
```
