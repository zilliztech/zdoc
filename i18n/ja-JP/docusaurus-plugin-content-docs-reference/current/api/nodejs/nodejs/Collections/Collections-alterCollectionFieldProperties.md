---
title: "alterCollectionFieldProperties() | Node.js"
slug: /node/node/Collections-alterCollectionFieldProperties
sidebar_label: "alterCollectionFieldProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation modifies the properties of a specified コレクション field. | Node.js"
type: docx
token: RQH5dhSenoDGjYxyBb2c3n1rnie
sidebar_position: 2
keywords: 
  - DiskANN
  - Sparse ベクトル
  - ベクトル Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionFieldProperties()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# alterCollectionFieldProperties()

This operation modifies the properties of a specified コレクション field.

```javascript
await milvusClient.alterCollectionFieldProperties(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.alterCollectionFieldProperties({
   db_name?: string
   collection_name: string,
   field_name: string,
   properties: Properties,
   timeout?: number
 })
```

**パラメーター:**

- **db_name** (*string*) -

    The name of the データベース that holds the target コレクション.

- **collection_name** (*string*) -

    **[REQUIRED]**

    対象のコレクションの名前です。

- **field_name** (*string*) -

    **[REQUIRED]**

    対象 field の名前。

- **properties** (*Properties*) -

    **[REQUIRED]**

    変更するプロパティとその期待値を、TypeScript の **Record** で指定します。指定可能な値は次のとおりです。

    - **max_length** (*number*) -

        挿入可能な文字列の最大バイト長。マルチバイト文字（例: Unicode 文字）は 1 文字あたり 1 バイトを超える場合があるため、挿入する文字列のバイト長が指定された制限を超えないようにしてください。値の範囲: [1, 65,535]。

        これは **DataType.VARCHAR** フィールドでは必須です。[DataType](./Collections-DataType) を参照してください。

    - **max_capacity** (*number*) -

        Array field 値内の要素数。

        これは **DataType.ARRAY** フィールドでは必須です。[DataType](./Collections-DataType) を参照してください。

    - **mmap.enabled** (*boolean*) -

        Milvus が field データを完全に読み込む代わりにメモリにマップするかどうか。詳細は、MMap-enabled Data Storage を参照してください。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが到着するかエラーが発生した時点でこの操作はタイムアウトします。

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

**パラメーター:**

- **code** (*number*) -

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。


**例外:**

- **Error**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.alterCollectionFieldProperties({
  collection_name: 'my-collection',
  field_name: 'my-field',
  properties: {"mmap.enabled": true}
});
```
