---
title: "addCollectionField() | Node.js"
slug: /node/node/Collections-addCollectionField
sidebar_label: "addCollectionField()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作では、既存のコレクションを再作成せずに、新しいスカラーフィールドを追加します。内部のスキーマ同期により、フィールドは最小限の遅延でほぼすぐに使用可能になります。 | Node.js"
type: docx
token: BKqIdIm0cop2s0xYjtQcSZL5nth
sidebar_position: 19
keywords: 
  - AI エージェント
  - セマンティック検索
  - 異常検知
  - sentence transformers
  - zilliz
  - zilliz cloud
  - クラウド
  - addCollectionField()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';

# addCollectionField()

この操作では、既存のコレクションを再作成せずに、新しいスカラーフィールドを追加します。フィールドは、内部のスキーマ同期により、最小限の遅延でほぼすぐに使用可能になります。

```javascript
await milvusClient.addCollectionField(data: AddCollectionFieldReq)
```

<Admonition type="info" icon="📘" title="Notes">

コレクションで動的フィールドが有効になっているときに、既存の動的フィールドキーと同じ名前の静的フィールドを追加すると、静的フィールドが動的フィールドキーをマスクします。元の動的値には、`$meta['field_name']` 構文を使用して引き続きアクセスできます。

</Admonition>

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.addCollectionField({
    collection_name: string,
    db_name?: string,
    field: FieldType,
    timeout?: number
})
```

**パラメーター：**

- **collection_name**（*string*） -

    対象コレクションの名前です。

- **db_name**（*string*） -

    対象データベースの名前です。

- **field**（*[FieldType](./Collections-FieldType)*） -

    追加するフィールドの設定です。これは、以下のフィールドを持つ **FieldType** オブジェクトです。

- **timeout**（*number*） -  

    この操作のタイムアウト期間です。**None** に設定すると、何らかの応答が到着したとき、またはエラーが発生したときに、この操作がタイムアウトすることを示します。

**戻り値：**

*Promise\<ResStatus\>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**パラメーター：**

- **code**（*number*） -

    操作結果を示すコードです。この操作が成功した場合は **0** のままです。

- **error_code**（*string* | *number*） -

    発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。 

- **reason**（*string*） - 

    報告されたエラーの理由を示す理由です。この操作が成功した場合は空の文字列のままです。


**例外：**

- **Error**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```javascript
const milvusClient = new MilvusClient(MILVUS_ADDRESS);
const resStatus = await milvusClient.addCollectionField({
  collection_name: 'my_collection',
  field: {
    name: 'new_field',
    data_type: 'Int64',
    is_primary_key: false,
    description: 'A new field'
  }
});
```
