---
title: "listFileResources() | Node.js"
slug: /node/node/FileResources-listFileResources
sidebar_label: "listFileResources()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、Milvus メタデータに登録されているファイルリソースを一覧表示します。 | Node.js"
type: docx
token: GK8hdiDs8olcOtxu0BKc89Vxn0b
sidebar_position: 2
keywords: 
  - ファイルリソース
  - アナライザー
  - 辞書
  - zilliz
  - zilliz cloud
  - cloud
  - listFileResources()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listFileResources()

この操作は、Milvus メタデータに登録されているファイルリソースを一覧表示します。

```javascript
await milvusClient.listFileResources(data?)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.listFileResources({
    timeout?: number
})
```

**パラメーター:**

- **timeout** (*number*) -

    この操作のタイムアウト時間（ミリ秒）です。

**戻り値:**

*Promise&lt;ListFileResourcesResponse&gt;*

このメソッドは、**ListFileResourcesResponse** オブジェクトに解決される Promise を返します。

```javascript
{
    resources: FileResourceInfo[],
    status:  ResStatus
}
```

**パラメーター:**

- **resources** (*FileResourceInfo[]*) -

    Milvus メタデータに登録されているファイルリソースのリストです。

    - **id** (*string*) -

        ファイルリソースの内部 ID です。

    - **name** (*string*) -

        ファイルリソースの名前です。

    - **path** (*string*) -

        ファイルリソースのパスです。

- **status** (*ResStatus*) -

    **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

**例外:**

- **Error**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.listFileResources();
```
