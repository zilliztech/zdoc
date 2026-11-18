---
title: "grantRole() | Node.js"
slug: /node/node/Authentication-grantRole
sidebar_label: "grantRole()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はユーザーにロールを付与します。 | Node.js"
type: docx
token: LPJsdEnvwo6apcxjhZgc3rpDnuc
sidebar_position: 16
keywords: 
  - 埋め込みモデル
  - 画像類似検索
  - コンテキストウィンドウ
  - 自然言語検索
  - zilliz
  - zilliz cloud
  - cloud
  - grantRole()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# grantRole()

この操作はユーザーにロールを付与します。

```javascript
await milvusClient.grantRole(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.grantRole({
   username: string,
   roleName: string,
   timeout?: number
 })
```

**PARAMETERS:**

- **username** (*string*) -

    **[REQUIRED]**

    既存のユーザー名。

- **roleName** (*string*) -

    **[REQUIRED]**

    割り当てるロールの名前。

- **timeout** (number)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、いずれかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値:**

*Promise\<ResStatus\>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**PARAMETERS:**

- **code** (*number*) -

    操作結果を示すコードです。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。


**例外:**

- **Error**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## Example\{#example}

```javascript
await milvusClient.grantRole({
   username: 'my',
   roleName: 'myrole'
 })
```
