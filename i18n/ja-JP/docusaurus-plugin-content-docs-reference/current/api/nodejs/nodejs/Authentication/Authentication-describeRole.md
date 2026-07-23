---
title: "describeRole() | Node.js"
slug: /node/node/Authentication-describeRole
sidebar_label: "describeRole()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は特定のロールの詳細を取得します。 | Node.js"
type: docx
token: ItZPd1o4uoodqtx1sxIcq38hn7e
sidebar_position: 9
keywords: 
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
  - マルチモーダルベクトルデータベース検索
  - zilliz
  - zilliz cloud
  - cloud
  - describeRole()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# describeRole()

この操作は特定のロールの詳細を取得します。

```javascript
await milvusClient.describeRole(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.describeRole({
    includeUserInfo?: boolean,
    roleName: string,
    timeout?: number
})
```

**PARAMETERS:**

- **roleName** (*string*) -

    **[REQUIRED]**

    詳細を取得するロールの名前です。

- **includeUserInfo** (*boolean*) -

    ユーザー情報を含めるかどうかを示すブール値です。

- **timeout** (*number*)  

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise&lt;SelectRoleResponse&gt;*

このメソッドは、**SelectRoleResponse** オブジェクトに解決される promise を返します。

```typescript
{
    results: RoleResult[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **results** (*RoleResult[]*) -<br/>
  **RoleResult** オブジェクトのリストです。`describeRole()` の場合、このリストには要求されたロールの情報を含む単一のエントリが含まれます。

    - **role** (*RoleEntity*) -

        ロールを記述する **RoleEntity** オブジェクトです。

        - **name** (*string*) -

        ロール名です。

        - **name** (*string*) -

            ロール名です。

    - **users** (*User[]*) -

        このロールを持つユーザーのリストです。

        - **name** (*string*) -

        ユーザー名です。

        - **name** (*string*) -

            ユーザー名です。

    - **entities** (*GrantEntity[]*) -

        このロールに付与されている grant のリストです。各エントリには、付与された権限、対象オブジェクト、およびそれを付与したユーザーが含まれます。

        - **role** (*RoleEntity*) -

        権限が付与されるロールです。

        - **object** (*ObjectEntity*) -

        権限が適用されるオブジェクトタイプです（例: **Collection**、**Global**、**User**）。

        - **object_name** (*string*) -

        権限が適用される特定のオブジェクト名です。すべてのオブジェクトには `*` を使用します。

        - **grantor** (*Grantor*) -

        この権限を付与した主体です。

          - **user** (*User*) -

          権限を付与したユーザーです。

          - **privilege** (*PrivilegeEntity*) -

          付与された権限です。

        - **db_name** (*string*) -

        grant が適用されるデータベースです。すべてのデータベースには `*` を使用します。

        - **role** (*RoleEntity*) -

            権限が付与されるロールです。

        - **object** (*ObjectEntity*) -

            権限が適用されるオブジェクトタイプです（例: **Collection**、**Global**、**User**）。

        - **object_name** (*string*) -

            権限が適用される特定のオブジェクト名です。すべてのオブジェクトには `*` を使用します。

        - **grantor** (*Grantor*) -

            この権限を付与した主体です。

            - **user** (*User*) -

            権限を付与したユーザーです。

            - **privilege** (*PrivilegeEntity*) -

            付与された権限です。

            - **user** (*User*) -

                権限を付与したユーザーです。

            - **privilege** (*PrivilegeEntity*) -

                付与された権限です。

        - **db_name** (*string*) -

            grant が適用されるデータベースです。すべてのデータベースには `*` を使用します。

- **ResStatus**<br/>
  **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
milvusClient.describeRole({roleName: 'myrole'});
```

