---
title: "backupRBAC() | Node.js"
slug: /node/node/Authentication-backupRBAC
sidebar_label: "backupRBAC()"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、現在の RBAC 構成をバックアップします。 | Node.js"
type: origin
token: shared-Authentication-backupRBAC
keywords: 
  - バックアップ
  - RBAC バックアップ
  - RBAC
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - backupRBAC()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# backupRBAC()

この操作は、現在の RBAC 構成をバックアップします。

```javascript
await milvusClient.backupRBAC(data?)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.backupRBAC({
   timeout?: number
 })
```

**パラメータ:**

- **timeout** (*number*) -  

    この操作のタイムアウト時間。

    これを **None** に設定すると、何らかのレスポンスが到着した時点、または何らかのエラーが発生した時点で、この操作はタイムアウトします。

**戻り値:**

*Promise&lt;BackupRBACResponse&gt;*

このメソッドは、**BackupRBACResponse** オブジェクトに解決される promise を返します。

```javascript
{
    RBAC_meta: RBACMeta,
    status:  ResStatus
}
```

**パラメータ:**

- **RBAC_meta** (*[RBACMeta](./Authentication-RBACMeta)*) -

現在の Milvus インスタンス内のすべての RBAC メタデータのスナップショットです。この値を `restoreRBAC()` に渡すと、同じユーザー、ロール、権限付与、および権限グループを別のインスタンスで再作成できます。フィールドのリファレンスについては、[RBACMeta](./Authentication-RBACMeta) を参照してください。

- **ResStatus**

**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空の文字列のままです。


**例外:**

- **Error**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```javascript
milvusClient.backupRBAC();
```
