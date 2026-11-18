---
title: "get() | Node.js"
slug: /node/node/Vector-get
sidebar_label: "get()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ID によって特定の entity を取得します。 | Node.js"
type: docx
token: IbxXdvdZlonJk9xnlk2cZlIinCh
sidebar_position: 3
keywords: 
  - ベクトル データベース comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - get()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# get()

この操作は、ID によって特定の entity を取得します。

```javascript
await milvusClient.get(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.get({
   db_name: string,
   collection_name: string,
   consistency_level?: ConsistencyLevelEnum,
   ids: string[] | number[],
   limit?: number,
   offset?: number,
   output_fields?: string[],
   partition_names?: string[],
   transformers?: OutputTransformers,
   exprValues?: keyValueObj,
   timeout?: number
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the データベース that holds the target コレクション.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing コレクション.

- **ids** (*string[]* | *number[]*) -

    **[REQUIRED]**

    特定の entity ID、または entity ID のリストです。

- **consistency_level** (*ConsistencyLevelEnum*) -

    対象のコレクションの整合性レベルです。ConsistencyLevelEnum を参照してください。

- **limit** (*number*) -

    返される entity の総数です。

    ページネーションを有効にするために、このパラメータを **param** 内の **offset** と組み合わせて使用できます。

    この値と **param** 内の **offset** の合計は、16,384 以下である必要があります。 

- **offset** (*number*) -

    検索結果内でスキップするレコード数です。 

    ページネーションを有効にするために、このパラメータを `limit` と組み合わせて使用できます。

    この値と `limit` の合計は、16,384 以下である必要があります。 

- **partition_names** (*string[]*) -

    A list of the names of the partitions in the target コレクション.

- **output_fields** (*string[]*) -

    返される各 entity に含める field 名のリストです。

    デフォルト値は **None** です。指定しない場合、すべての field が出力 field として選択されます。

- **transformers** (*OutputTransformers*) -

    特定のデータ型のデータを変換するカスタム関数です。

- **exprValues** (*keyValueObj*) -

    フィルター式でプレースホルダーを使用する場合は、これらのプレースホルダーの実際の値をキーと値のペアとして指定できます。

- **timeout** (*number*) -

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値:**

*Promise&lt;QueryResults&gt;*

このメソッドは、**QueryResults** オブジェクトに解決される promise を返します。

```javascript
{
    data: Record<string, any>[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **data** (*Record&lt;string, any&gt;[]*) -
プライマリキーが指定された **ids** と一致する行です。各エントリはフィールド名をキーとし、要求された各 **output_fields** エントリの値とプライマリキーを保持します。

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

    この操作中にエラーが発生すると、この例外がスローされます。

## Example\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const getResults = await milvusClient.get({
   collection_name: 'my_collection',
   ids: ['1','2','3','4','5','6','7','8'],
   output_fields: ["age"],
 });
```
