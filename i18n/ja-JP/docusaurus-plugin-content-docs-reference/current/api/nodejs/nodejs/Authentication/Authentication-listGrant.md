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
  - vector databases とは
  - vector databases の比較
  - Faiss
  - Video search
  - zilliz
  - zilliz cloud
  - cloud
  - listGrant()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listGrant()

この操作は、指定したロールに付与された権限を一覧表示します。

```javascript
await milvusClient.listGrant(data)
```

## リクエスト構文\{#request-syntax}

```javascript
 milvusClient.listGrants({
   roleName: 'roleName',
   object: 'Collection',
   objectName: '*'
 });
```

**パラメータ:**

- **roleName** (*string*)  

    対象のロール名です。

    存在しないロールの名前を設定すると、エラーになる場合があります。

- **object** (*string*)

    有効な権限オブジェクトグループの名前です。指定可能な値は **Global**、**Collection**、**User** です。

- **objectName** (*string*)

    指定したオブジェクトグループ内の特定のオブジェクトの名前です。ワイルドカード (*) を使用すると、指定したグループ内のすべての権限が対象であることを示します。

- **timeout** (*number*) 

    この操作のタイムアウト時間です。

*Returns Promise\<SelectGrantResponse>*

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

- **entities** (*GrantEntity[]*) -

    付与エンティティのリストです。各エンティティの形式は次のとおりです。

    - **db_name** (*string*) -

        権限が付与されたデータベースの名前です。

    - **grantor** (*Grantor*) -

        **Grantor** オブジェクトです。形式は次のとおりです。

        - **privilege** (*PrivilegeEntity*) -

            **PrivilegeEntity** オブジェクトです。形式は次のとおりです。

            - **name** (*string*) - 

                付与された権限の名前です。

        - **user** (*User*) - 

            **User** オブジェクトです。形式は次のとおりです。

            - **name** (*string*) - 

                上記の権限をロールに付与するユーザーの名前です。 

    - **object** (*ObjectEntity*) -

        **ObjectEntity** オブジェクトです。形式は次のとおりです。

        - **name** (*string*) - 

            オブジェクトエンティティの名前です。

    - **object_name** (*string*) -

        上記のオブジェクトエンティティ内の特定のオブジェクトの名前です。

    - **role** (*RoleEntity*) -   

        **RoleEntity** オブジェクトです。形式は次のとおりです。

        - **name** (*string*) - 

            権限が付与されたロールの名前です。

- **status** (*ResStatus*) -

    **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。 

    - **reason** (*string*) - 

        報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```javascript
 milvusClient.listGrant({
   roleName: 'roleName',
   object: 'Collection',
   objectName: '*'
 });
```

