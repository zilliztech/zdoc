---
title: "selectGrant() | Node.js"
slug: /node/node/Authentication-selectGrant
sidebar_label: "selectGrant()"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "この操作は、指定したオブジェクトに対して、指定したロールに付与された権限を選択します。 | Node.js"
type: origin
token: shared-Authentication-selectGrant
displayed_sidebar: nodeSidebar

---

# selectGrant()

この操作は、指定したオブジェクトに対して、指定したロールに付与された権限を選択します。

```javascript
await milvusClient.selectGrant(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.selectGrant({
    roleName: string,
    object: string,
    objectName: string,
    db_name?: string,
    timeout?: number
})
```

**パラメーター:**

- **roleName** (*string*) -

    **[必須]**

    ロールの名前です。

- **object** (*string*) -

    権限を付与する対象となるオブジェクトの種類です。指定可能な値は **Global**、**コレクション**、**User** です。

- **objectName** (*string*) -

    ロールに指定した権限を付与する対象となるオブジェクトの名前です。

- **db_name** (*string*) -

    オプションのデータベース名です。

- **timeout** (*number*) -

    RPC の実行に許容される時間をミリ秒単位で指定するオプションです。

**戻り値:**

*Promise&lt;SelectGrantResponse&gt;*

このメソッドは、**SelectGrantResponse** オブジェクトに解決される Promise を返します。

```javascript
{
    entities: GrantEntity[],
    status: ResStatus
}
```

**パラメーター:**

- **entities** (**[GrantEntity](./Authentication-GrantEntity)[]**) -

    ロールに付与された権限を表す権限付与エンティティのリストです。

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

    この操作中に何らかのエラーが発生した場合にスローされる例外です。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.selectGrant({
    roleName: 'my_role',
    object: 'Collection',
    objectName: 'my_collection',
});
```
