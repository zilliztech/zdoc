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

---

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

**戻り値:**

*Promise&lt;SelectRoleResponse&gt;*

このメソッドは、**SelectRoleResponse** オブジェクトに解決される promise を返します。

```javascript
{
    results: RoleResult[],
    status:  ResStatus
}
```

**パラメーター:**

- **results** (*RoleResult[]*) -
**RoleResult** オブジェクトのリスト。`describeRole()` の場合、このリストには、要求されたロールを記述する 1 つのエントリのみが含まれます。

    - **role** (*RoleEntity*) -

        ロールを記述する **RoleEntity** オブジェクト。

    - **users** (*User[]*) -

        このロールを保持するユーザーのリスト。

    - **entities** (*GrantEntity[]*) -

        このロールに付与された権限のリスト。各エントリには、付与された権限、対象オブジェクト、およびそれを付与したユーザーが含まれます。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。


**例外:**

- **Error**

    この操作中に何らかのエラーが発生すると、この例外がスローされます。

## 例\{#example}

```javascript
milvusClient.describeRole({roleName: 'myrole'});
```
