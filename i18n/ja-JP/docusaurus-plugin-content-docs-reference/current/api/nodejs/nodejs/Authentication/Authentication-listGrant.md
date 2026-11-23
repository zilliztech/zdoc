---
title: "listGrant() | Node.js"
slug: /node/node/Authentication-listGrant
sidebar_label: "listGrant()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定したロールに付与された権限を一覧表示します。 | Node.js"
type: docx
token: HSIDdxQGEoPdyaxkMDjcAWGQnpd
sidebar_position: 17
keywords: 
  - ベクトル データベース とは
  - ベクトル データベース の比較
  - Faiss
  - Video search
  - zilliz
  - zilliz cloud
  - cloud
  - listGrant()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listGrant()

この操作は、指定したロールに付与された権限を一覧表示します。

```javascript
await milvusClient.listGrant(data)
```

## リクエスト構文\{#request-syntax}

```javascript
 milvusClient.listGrant({
   roleName: 'roleName',
   object: 'Collection',
   objectName: '*',
   db_name?: string
 });
```

**パラメータ:**

- **roleName** (*string*)  

    対象のロール名です。

    存在しないロールの名前を設定すると、エラーになる場合があります。

- **object** (*string*)

    有効な権限オブジェクトグループの名前です。指定可能な値は **Global**、**コレクション**、**User** です。

- **objectName** (*string*)

    指定したオブジェクトグループ内の特定のオブジェクトの名前です。ワイルドカード（*）を使用すると、指定したグループ内のすべての権限が付与されることを示します。

- **db_name** (*string*)

    対象のオブジェクトが属するデータベースの名前です。

- **timeout** (*number*) 

    この操作のタイムアウト時間です。

**戻り値:**

*Promise&lt;SelectGrantResponse&gt;*

このメソッドは、**SelectGrantResponse** オブジェクトに解決される Promise を返します。

```javascript
{
    "entities": [
        {
            db_name: string,
            grantor: { privilege: { name: string }, user: { name: string } },
            object: { name: string },
            object_name: string,
            role: { name: string }
        }
    ],
    "status": ResStatus
```

**パラメータ:**

- **entities** (*[GrantEntity](./Authentication-GrantEntity)[]*) -

    権限付与エンティティのリストです。各エンティティの構造は次のとおりです。

- **status** (*ResStatus*) -

    **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。 

    - **reason** (*string*) - 

        報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。


**例外:**

- **Error**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```javascript
 milvusClient.listGrant({
   roleName: 'roleName',
   object: 'Collection',
   objectName: '*'
 });
```

