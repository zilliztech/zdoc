---
title: "alterRole() | Node.js"
slug: /node/node/Authentication-alterRole
sidebar_label: "alterRole()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のロールの説明を変更します。 | Node.js"
type: docx
token: Fvw0dyRalo2ceVxdY4Fcf9uTnBg
sidebar_position: 30
keywords: 
  - ロールの変更
  - ロール
  - rbac
  - zilliz
  - zilliz cloud
  - クラウド
  - alterRole()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# alterRole()

この操作は、既存のロールの説明を更新します。

```javascript
await milvusClient.alterRole(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.alterRole({
    roleName: string,
    description: string,
    timeout?: number
})
```

**パラメーター：**

- **roleName**（*string*） -

    **[必須]**

    変更するロールの名前です。

- **description**（*string*） -

    **[必須]**

    ロールの新しい説明です。

- **timeout**（*number*） -

    この操作のタイムアウト時間（ミリ秒）です。

**戻り値：**

*Promise&lt;ResStatus&gt;*

このメソッドは、**ResStatus** オブジェクトに解決される Promise を返します。

**例外：**

- **Error**

    この操作中にエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const resStatus = await milvusClient.alterRole({
    roleName: 'my_role',
    description: 'Role updated description',
});
```
