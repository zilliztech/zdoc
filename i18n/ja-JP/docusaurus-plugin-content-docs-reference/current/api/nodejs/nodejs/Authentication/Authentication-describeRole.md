---
title: "describeRole() | Node.js"
slug: /node/node/Authentication-describeRole
sidebar_label: "describeRole()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は特定のロールを記述します。 | Node.js"
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
  - クラウド
  - describeRole()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# describeRole()

この操作は特定のロールを記述します。

```javascript
await milvusClient.describeRole(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.describeRole({
    includeUserInfo?: boolean,
    roleName: string,
    timeout?: number
})
```

**パラメーター:**

- **roleName** (*string*) -

    **[REQUIRED]**

    記述するロールの名前。

- **includeUserInfo** (*boolean*) -

    ユーザー情報を含めるかどうかを示すブール値。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが到着するか、エラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise&lt;SelectRoleResponse&gt;*

このメソッドは、**SelectRoleResponse** オブジェクトに解決される promise を返します。

```typescript
{
    results: RoleResult[],
    status:  ResStatus
}
```

**パラメーター:**

- **results** (*RoleResult[]*) -<br/>
  **RoleResult** オブジェクトのリスト。`describeRole()` では、このリストにはリクエストされたロールを記述する単一のエントリが含まれます。

    - **role** (*RoleEntity*) -

        ロールを記述する **RoleEntity** オブジェクト。

        - **name** (*string*) -

        ロール名。

        - **name** (*string*) -

            ロール名。

    - **users** (*User[]*) -

        このロールを保持するユーザーのリスト。

        - **name** (*string*) -

        ユーザー名。

        - **name** (*string*) -

            ユーザー名。

    - **entities** (*GrantEntity[]*) -

        このロールに付与された権限のリスト。各エントリには、付与された権限、対象オブジェクト、およびそれを付与したユーザーが含まれます。

        - **role** (*RoleEntity*) -

        権限が付与されるロール。

        - **object** (*ObjectEntity*) -

        権限が適用されるオブジェクトタイプ（例: **Collection**、**Global**、**User**）。

        - **object_name** (*string*) -

        権限が適用される特定のオブジェクト名。すべてのオブジェクトを対象にするには `*` を使用します。

        - **grantor** (*Grantor*) -

        この権限を付与した主体。

          - **user** (*User*) -

          権限を付与したユーザー。

          - **privilege** (*PrivilegeEntity*) -

          付与された権限。

        - **db_name** (*string*) -

        付与が適用されるデータベース。すべてのデータベースを対象にするには `*` を使用します。

        - **role** (*RoleEntity*) -

            権限が付与されるロール。

        - **object** (*ObjectEntity*) -

            権限が適用されるオブジェクトタイプ（例: **Collection**、**Global**、**User**）。

        - **object_name** (*string*) -

            権限が適用される特定のオブジェクト名。すべてのオブジェクトを対象にするには `*` を使用します。

        - **grantor** (*Grantor*) -

            この権限を付与した主体。

            - **user** (*User*) -

            権限を付与したユーザー。

            - **privilege** (*PrivilegeEntity*) -

            付与された権限。

            - **user** (*User*) -

                権限を付与したユーザー。

            - **privilege** (*PrivilegeEntity*) -

                付与された権限。

        - **db_name** (*string*) -

            付与が適用されるデータベース。すべてのデータベースを対象にするには `*` を使用します。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
milvusClient.describeRole({roleName: 'myrole'});
```

