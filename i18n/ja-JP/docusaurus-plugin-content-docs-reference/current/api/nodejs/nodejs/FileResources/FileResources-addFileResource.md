---
title: "addFileResource() | Node.js"
slug: /node/node/FileResources-addFileResource
sidebar_label: "addFileResource()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、名前付きファイルリソースを Milvus メタデータに追加します。 | Node.js"
type: docx
token: RnyUdtGbFoIC7AxyhmNcbudYnhb
sidebar_position: 1
keywords: 
  - ファイルリソース
  - アナライザー
  - 辞書
  - zilliz
  - zilliz cloud
  - cloud
  - addFileResource()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# addFileResource()

この操作は、ファイルリソースを Milvus に登録します。サーバー側の機能で名前付きファイルリソースが必要な場合に使用します。

```javascript
await milvusClient.addFileResource(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.addFileResource({
    name: string,
    path: string,
    timeout?: number
})
```

**パラメーター:**

- **name** (*string*) -

    **[必須]**

    ファイルリソースの一意の名前です。

- **path** (*string*) -

    **[必須]**

    サーバーから参照できるリソースのファイルパスです。

- **timeout** (*number*) -

    この操作のタイムアウト時間（ミリ秒）です。

**戻り値:**

*Promise&lt;ResStatus&gt;*

このメソッドは、**ResStatus** オブジェクトに解決される Promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**パラメーター:**

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

const resStatus = await milvusClient.addFileResource({
    name: 'embedding_model',
    path: '/models/embedding.bin',
});
```
