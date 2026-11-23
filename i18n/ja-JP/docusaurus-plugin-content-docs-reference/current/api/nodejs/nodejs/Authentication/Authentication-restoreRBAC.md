---
title: "restoreRBAC() | Node.js"
slug: /node/node/Authentication-restoreRBAC
sidebar_label: "restoreRBAC()"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、RBAC 構成をバックアップから復元します。 | Node.js"
type: origin
token: shared-Authentication-restoreRBAC
keywords: 
  - 復元
  - RBAC 復元
  - RBAC
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - restoreRBAC()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# restoreRBAC()

この操作は、RBAC 構成をバックアップから復元します。

```javascript
await milvusClient.restoreRBAC(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.restoreRBAC({
    RBAC_meta: RBACMeta,
    timeout?: number
})
```

**パラメータ：**

- **RBAC_meta** (*[RBACMeta](./Authentication-RBACMeta)*) -

    **[必須]**

    復元する RBAC メタデータ全体です。ユーザー、ロール、権限付与、および権限グループが含まれます。

- **timeout** (*number*) -  

    この操作のタイムアウト時間です。

    これを **None** に設定すると、何らかの応答が到着した時点、または何らかのエラーが発生した時点で、この操作はタイムアウトします。

**戻り値：**

*Promise\<ResStatus\>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**パラメータ：**

- **code** (*number*) -

    操作結果を示すコードです。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

- **reason** (*string*) - 

    報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。


**例外：**

- **Error**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```javascript
const rbacMeta = {
    users: [],
    roles: [],
    grants: [],
    privilege_groups: []
}

await milvusClient.restoreRBAC({
  RBAC_meta: rbacMeta,
});
```
