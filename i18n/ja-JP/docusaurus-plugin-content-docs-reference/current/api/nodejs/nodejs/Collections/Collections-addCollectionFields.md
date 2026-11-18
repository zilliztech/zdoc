---
title: "addCollectionFields() | Node.js"
slug: /node/node/Collections-addCollectionFields
sidebar_label: "addCollectionFields()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションを再作成することなく、新しいスカラーフィールドのリストを追加します。これらのフィールドは、内部でのスキーマ同期により、最小限の遅延でほぼ即座に利用可能になります。 | Node.js"
type: docx
token: FmG6dw3O1ouzgbxnl4jc5T7cnXf
sidebar_position: 20
keywords: 
  - 動画類似検索
  - ベクトル検索
  - 音声類似検索
  - Elastic ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - addCollectionFields()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';

# addCollectionFields()

この操作は、既存のコレクションを再作成することなく、新しいスカラーフィールドのリストを追加します。これらのフィールドは、内部でのスキーマ同期により、最小限の遅延でほぼ即座に利用可能になります。

```javascript
await milvusClient.addCollectionFields(data: AddCollectionFieldsReq)
```

<Admonition type="info" icon="📘" title="Notes">

コレクションで動的フィールドが有効になっており、既存の動的フィールドキーと同じ名前の静的フィールドを追加すると、静的フィールドが動的フィールドキーをマスクします。元の動的値には、`$meta['field_name']` 構文を介して引き続きアクセスできます。

</Admonition>

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.addCollectionFields({
    collection_name: string,
    db_name?: string,
    fields: FieldType[],
    timeout?: number
})
```

**パラメーター:**

- **collection_name** (*string*) -

    対象コレクションの名前。

- **db_name** (*string*) -

    対象データベースの名前。

- **fields** (*FieldType[]*) -

    追加するフィールドの設定です。各設定は、以下のフィールドを持つ **FieldType** オブジェクトです。

- **timeout** (*number*) -  

    この操作のタイムアウト時間。これを **None** に設定すると、いずれかのレスポンスが到着するか、いずれかのエラーが発生した時点でこの操作はタイムアウトします。

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

    報告されたエラーの理由を示す理由。この操作が成功した場合は空の文字列のままです。


**例外:**

- **Error**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```javascript
const milvusClient = new MilvusClient(MILVUS_ADDRESS);
const resStatus = await milvusClient.addCollectionFields({
  collection_name: 'my_collection',
  fields: [
    {
      name: 'new_field_1',
      data_type: 'Int64',
      is_primary_key: false,
      description: 'First new field'
    },
    {
      name: 'new_field_2',
      data_type: 'FloatVector',
      dim: 128,
      description: 'Second new field'
    }
  ]
});
```
