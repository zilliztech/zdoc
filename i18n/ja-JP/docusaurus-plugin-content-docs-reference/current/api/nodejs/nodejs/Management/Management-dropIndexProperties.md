---
title: "dropIndexProperties() | Node.js"
slug: /node/node/Management-dropIndexProperties
sidebar_label: "dropIndexProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、index プロパティをデフォルト値にリセットします。 | Node.js"
type: docx
token: Acvxd7t9poXj6nxb0vMco0wsngh
sidebar_position: 6
keywords: 
  - ハイブリッドベクトル検索
  - 動画重複排除
  - 動画類似検索
  - ベクトル検索
  - zilliz
  - zilliz cloud
  - cloud
  - dropIndexProperties()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropIndexProperties()

この操作は、index プロパティをデフォルト値にリセットします。

```javascript
await milvusClient.dropIndexProperties(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.dropIndexProperties({
     db_name?: string,
     collection_name: string,
     index_name: string,
     properties: string[],
     timeout?: number
});
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象の collection を保持するデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前。

- **index_name** (*string*) -

    **[REQUIRED]**

    対象の index の名前。

- **properties** (*string[]*) -

    **[REQUIRED]**

    リセットする index プロパティの名前。指定可能なプロパティは次のとおりです。

    - **mmap.enabled** -

        指定した index に対して mmap を有効にするかどうか。これを `True` に設定すると、指定した index はディスクにオフロードされます。詳細については、[Use mmap](/docs/use-mmap) を参照してください。

- **timeout** (number) -

    この操作のタイムアウト時間。これを **None** に設定すると、レスポンスが返るかエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise\<ResStatus>*

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

    報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
const milvusClient = new MilvusClient(MILUVS_ADDRESS);
const dropIndexPropertiesReq = {
    collection_name: 'my_collection',
    index_name: 'my_index',
    properties: ['mmap.enabled'],
};
const res = await milvusClient.dropIndexProperties(dropIndexPropertiesReq);
console.log(res);
```

