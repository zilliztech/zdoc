---
title: "dropDatabase() | Node.js"
slug: /node/node/Database-dropDatabase
sidebar_label: "dropDatabase()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "この操作はデータベースを削除します。 | Node.js"
type: docx
token: Ja99dnnaOoncwbx2zIPc4PjunXx
sidebar_position: 3
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - dropDatabase()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropDatabase()

この操作はデータベースを削除します。

```javascript
await milvusClient.dropDatabase(data?)
```

<Admonition type="info" icon="📘" title="注意">

このメソッドは dedicated cluster にのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.dropDatabase({
    db_name: string,
    timeout?: number
})
```

**パラメータ:**

- **db_name** (*string*) -

    削除するデータベースの名前です。

    指定した名前のデータベースが存在している必要があります。そうでない場合は例外が発生します。

- **timeout** (*number*) -

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、レスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise |&lt;ResStatus&gt;*

このメソッドは **ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**パラメータ:**

- **code** (*number*) -

    操作結果を示すコードです。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.dropDatabase({ db_name: 'db_to_drop' });
```

