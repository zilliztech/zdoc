---
title: "listGrants() | Node.js"
slug: /node/node/Authentication-listGrants
sidebar_label: "listGrants()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたロールに付与された権限を一覧表示します。 | Node.js"
type: docx
token: CJ9DdmU1ooquOnxcK5AciA3sn3g
sidebar_position: 18
keywords: 
  - マネージドベクトルデータベース
  - Pinecone ベクトル データベース
  - 音声検索
  - セマンティック検索とは
  - zilliz
  - zilliz cloud
  - クラウド
  - listGrants()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listGrants()

この操作は、指定されたロールに付与された権限を一覧表示します。

```javascript
await milvusClient.listGrants(data)
```

## Request Syntax\{#request-syntax}

```javascript
 milvusClient.listGrants({
   roleName: 'roleName',
   db_name?: string,
   timeout?: number,
 });
```

**PARAMETERS:**

- **roleName** (*string*)  

    対象のロール名

    これを存在しないロール名に設定すると、エラーが発生する場合があります。

- **db_name** (*string*)  

    対象のロールが属するデータベースの名前です。

- **timeout** (*number*) -

    この操作のタイムアウト時間です。**None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトすることを示します。

**戻り値:**

*Promise&lt;SelectGrantResponse&gt;*

このメソッドは、**SelectGrantResponse** オブジェクトに解決される promise を返します。

```javascript
{
    entities: GrantEntity[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **entities** (*GrantEntity[]*) -

要求されたロールに付与された権限のリストです。各エントリは、権限を対象オブジェクトおよびその権限を付与したプリンシパルと対応付けます。**GrantEntity** フィールドの完全なリファレンスについては、`describeRole()` のドキュメントを参照してください。

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

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## Example\{#example}

```javascript
 milvusClient.listGrants({
   roleName: 'roleName',
 });
```
