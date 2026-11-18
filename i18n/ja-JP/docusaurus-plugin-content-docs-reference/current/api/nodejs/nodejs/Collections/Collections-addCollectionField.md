---
title: "addCollectionField() | Node.js"
slug: /node/node/Collections-addCollectionField
sidebar_label: "addCollectionField()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションを再作成することなく新しいスカラーフィールドを追加します。このフィールドは、内部でのスキーマ同期により最小限の遅延でほぼ即座に利用可能になります。 | Node.js"
type: docx
token: BKqIdIm0cop2s0xYjtQcSZL5nth
sidebar_position: 19
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - addCollectionField()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';

# addCollectionField()

この操作は、既存のコレクションを再作成することなく新しいスカラーフィールドを追加します。このフィールドは、内部でのスキーマ同期により最小限の遅延でほぼ即座に利用可能になります。

```javascript
await milvusClient.addCollectionField(data: AddCollectionFieldReq)
```

<Admonition type="info" icon="📘" title="Notes">

コレクションで動的フィールドが有効になっており、既存の動的フィールドキーと同じ名前の静的フィールドを追加すると、その静的フィールドが動的フィールドキーをマスクします。元の動的値には `$meta['field_name']` 構文で引き続きアクセスできます。

</Admonition>

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.addCollectionField({
    collection_name: string,
    db_name?: string,
    field: FieldType,
    timeout?: number
})
```

**PARAMETERS:**

- **collection_name** (*string*) -

    対象コレクションの名前。

- **db_name** (*string*) -

    対象データベースの名前。

- **field** (*FieldType*) -

    追加するフィールドの設定です。この設定は、以下のフィールドを持つ **FieldType** オブジェクトです。

- **timeout** (*number*) -  

    この操作のタイムアウト期間。これを **None** に設定すると、何らかのレスポンスが到着したとき、または何らかのエラーが発生したときに、この操作がタイムアウトすることを示します。

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

**PARAMETERS:**

- **code** (*number*) -

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す理由。この操作が成功した場合は空の文字列のままです。


**例外:**

- **Error**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

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
