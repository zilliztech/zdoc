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
  - クラウド
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

    詳細を取得するロールの名前。

- **includeUserInfo** (*boolean*) -

    ユーザー情報を含めるかどうかを示すブール値。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、いずれかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise&lt;SelectRoleResponse&gt;*

このメソッドは、**SelectRoleResponse** オブジェクトに解決される promise を返します。

```typescript
{
    results: RoleResult[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **results** (*RoleResult[]*) -
**RoleResult** オブジェクトのリスト。`describeRole()` では、このリストには要求されたロールを説明する単一のエントリが含まれます。

    - **role** (*RoleEntity*) -

        ロールを説明する **RoleEntity** オブジェクト。

        - **name** (*string*) -

        ロール名。

        - **name** (*string*) -

            ロール名。

    - **users** (*User[]*) -

        このロールを保持しているユーザーのリスト。

        - **name** (*string*) -

        ユーザー名。

        - **name** (*string*) -

            ユーザー名。

    - **entities** (*GrantEntity[]*) -

        このロールに関連付けられた権限付与のリスト。各エントリには、付与された権限、対象オブジェクト、およびそれを付与したユーザーが含まれます。

        - **role** (*RoleEntity*) -

        権限が付与されるロール。

        - **object** (*ObjectEntity*) -

        権限が適用されるオブジェクトタイプ（たとえば、**Collection**、**Global**、**User**）。

        - **object_name** (*string*) -

        権限が適用される特定のオブジェクト名。すべてのオブジェクトには `*` を使用します。

        - **grantor** (*Grantor*) -

        この権限を付与した主体。

          - **user** (*User*) -

          権限を付与したユーザー。

          - **privilege** (*PrivilegeEntity*) -

          付与された権限。

        - **db_name** (*string*) -

        権限付与が適用されるデータベース。すべてのデータベースには `*` を使用します。

        - **role** (*RoleEntity*) -

            権限が付与されるロール。

        - **object** (*ObjectEntity*) -

            権限が適用されるオブジェクトタイプ（たとえば、**Collection**、**Global**、**User**）。

        - **object_name** (*string*) -

            権限が適用される特定のオブジェクト名。すべてのオブジェクトには `*` を使用します。

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

            権限付与が適用されるデータベース。すべてのデータベースには `*` を使用します。

- **ResStatus**
**ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
milvusClient.describeRole({roleName: 'myrole'});
```

