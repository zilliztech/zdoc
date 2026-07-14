---
title: "alterCollectionFieldProperties() | Node.js"
slug: /node/node/Collections-alterCollectionFieldProperties
sidebar_label: "alterCollectionFieldProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された collection field のプロパティを変更します。 | Node.js"
type: docx
token: RQH5dhSenoDGjYxyBb2c3n1rnie
sidebar_position: 2
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionFieldProperties()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterCollectionFieldProperties()

この操作は、指定された collection field のプロパティを変更します。

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

    対象の collection を保持するデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    エイリアスを再割り当てする対象 collection の名前。

- **field_name** (*string*) -

    **[REQUIRED]**

    対象 field の名前。

- **properties** (*Properties*) -

    **[REQUIRED]**

    変更するプロパティとその期待値を、TypeScript の **Record** で指定します。指定可能な値は次のとおりです。

    - **max_length** (*number*) -

        挿入可能な文字列の最大バイト長。マルチバイト文字（例: Unicode 文字）は 1 文字あたり 1 バイトを超える場合があるため、挿入する文字列のバイト長が指定された制限を超えないようにしてください。値の範囲: [1, 65,535]。

        これは **DataType.VARCHAR** field では必須です。

    - **max_capacity** (*number*) -

        Array field 値内の要素数。

        これは **DataType.ARRAY** field では必須です。

    - **mmap_enabled** (*bool*) -

        Milvus が field データを完全に読み込む代わりにメモリにマップするかどうか。詳細は、MMap-enabled Data Storage を参照してください。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが到着するかエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise\<ResStatus>*

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

## 例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.alterCollectionField({
  collection_name: 'my-collection',
  field_name: 'my-field',
  properties: {"mmap.enabled": true}
});
```

