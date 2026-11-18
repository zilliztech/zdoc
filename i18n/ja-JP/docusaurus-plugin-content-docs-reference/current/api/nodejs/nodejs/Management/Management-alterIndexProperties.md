---
title: "alterIndexProperties() | Node.js"
slug: /node/node/Management-alterIndexProperties
sidebar_label: "alterIndexProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のインデックスプロパティの設定を変更します。 | Node.js"
type: docx
token: PcQcdDwthoSEZaxI6GncpUpGnBh
sidebar_position: 1
keywords: 
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
  - zilliz
  - zilliz cloud
  - クラウド
  - alterIndexProperties()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# alterIndexProperties()

この操作は、特定のインデックスプロパティの設定を変更します。

```javascript
await milvusClient.alterIndexProperties(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.alterIndexProperties({
     db_name?: string,
     collection_name: string,
     index_name: string,
     params: Record<string, string | number | boolean>,
     timeout?: number
});
```

**パラメータ:**

- **db_name** (*string*) -

    対象のコレクションを保持するデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存のコレクションの名前。

- **index_name** (*string*) -

    **[REQUIRED]**

    対象インデックスの名前。

- **params** (*Record*\<*string*, *string* | *number* | *boolean*>) -

    **[REQUIRED]**

    変更するインデックスプロパティとその期待値です。利用可能なプロパティは次のとおりです。

    - **mmap.enabled** (*boolean*) -

        指定したインデックスに対して mmap を有効にするかどうかです。これを `True` に設定すると、指定したインデックスがディスクにオフロードされます。詳細は、[Mmap-enabled Data Storage](https://milvus.io/docs/mmap.md) を参照してください。

- **timeout** (number) -

    この操作のタイムアウト時間。これを **None** に設定すると、何らかのレスポンスが返るかエラーが発生した時点でこの操作はタイムアウトします。

**戻り値:**

*Promise\<ResStatus\>*

このメソッドは **ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**パラメータ:**

- **code** (*number*) -

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す内容。この操作が成功した場合は空文字列のままです。


**例外:**

- **Error**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```javascript
const milvusClient = new MilvusClient(MILUVS_ADDRESS);
const alterIndexReq = {
    collection_name: 'my_collection',
    index_name: 'my_index',
    params: { nlist: 20 },
};
const res = await milvusClient.alterIndexProperties(alterIndexReq);
console.log(res);
```
