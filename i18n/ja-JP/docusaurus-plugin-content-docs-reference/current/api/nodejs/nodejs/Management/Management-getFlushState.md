---
title: "getFlushState() | Node.js"
slug: /node/node/Management-getFlushState
sidebar_label: "getFlushState()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定の segment の flush 状態を返します。 | Node.js"
type: docx
token: X8qWdMHg5oQQK6xZdBYcGNOnn3c
sidebar_position: 10
keywords: 
  - ニューラルネットワーク
  - ディープラーニング
  - ナレッジベース
  - 自然言語処理
  - zilliz
  - zilliz cloud
  - クラウド
  - getFlushState()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';

# getFlushState()

この操作は、特定の segment の flush 状態を返します。

```javascript
await milvusClient.getFlushState(data)
```

<Admonition type="info" icon="📘" title="Notes">

Milvus は一定間隔でデータを永続ストレージに自動的にフラッシュします。この自動データ永続化メカニズムに依存することを推奨します。

</Admonition>

## Request Syntax\{#request-syntax}

<NextChannel action="exclude">

```javascript
await milvusClient.getFlushState({
    segmentIDs?: number[],
    flush_ts?: number,
    db_name?: string,
    collection_name?: string,
    timeout?: number
})
```

</NextChannel>

<NextChannel action="include">

```javascript
await milvusClient.getFlushState({
    segmentIDs?: number[],
    flush_ts?: number | string,
    db_name?: string,
    collection_name?: string,
    timeout?: number
})
```

</NextChannel>

**パラメータ:**

<NextChannel action="exclude">

- **segmentIDs** (*number[]*) -

    対象の segment ID のリスト。

- **flush_ts** (*number*) -

    照合する flush タイムスタンプ。

- **db_name** (*string*) -

    対象のコレクションを含むデータベースの名前。

- **collection_name** (*string*) -

    flush 状態を確認するコレクションの名前。**segmentIDs**、**flush_ts**、または **collection_name** のうち少なくとも 1つを指定してください。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、任意の応答が到着したとき、または任意のエラーが発生したときにこの操作はタイムアウトします。

</NextChannel>

<NextChannel action="include">

- **segmentIDs** (*number[]*) -

    対象の segment ID のリスト。

- **flush_ts** (*number* | *string*) -

    照合する flush タイムスタンプ。int64 値は、完全な精度を保つため、10 進数文字列として渡してください。

- **db_name** (*string*) -

    対象のコレクションを含むデータベースの名前。

- **collection_name** (*string*) -

    flush 状態を確認するコレクションの名前。**segmentIDs**、**flush_ts**、または **collection_name** のうち少なくとも 1つを指定してください。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、任意の応答が到着したとき、または任意のエラーが発生したときにこの操作はタイムアウトします。

</NextChannel>

**戻り値:**

*Promise&lt;GetFlushStateResponse&gt;*

このメソッドは、**GetFlushStateResponse** オブジェクトに解決される promise を返します。

```javascript
{
    flushed: boolean,
    status:  ResStatus
}
```

**パラメータ:**

- **flushed** (*boolean*) -
対象のすべての segment が永続ストレージにフラッシュされたかどうか。要求されたすべての segment ID がシールされて永続化されている場合は **true**、それ以外の場合は **false** です。

- **ResStatus**
**ResStatus** オブジェクト。

    - **code** (*number*) -

        この操作の結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空の文字列のままです。

**例外:**

- **Error**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## Example\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const flushState = await milvusClient.getFlushState({
    segmentIDs: [1,2,3,4],
});
```
