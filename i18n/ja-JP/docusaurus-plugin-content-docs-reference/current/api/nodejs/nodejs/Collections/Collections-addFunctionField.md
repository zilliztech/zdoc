---
title: "addFunctionField() | Node.js"
slug: /node/node/Collections-addFunctionField
sidebar_label: "addFunctionField()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、関数ベースの出力フィールドと、それにバインドされたインデックスを既存のコレクションに追加します。 | Node.js"
type: docx
token: BjKLdh2SFouRSbxELaqc9b4tnts
sidebar_position: 29
keywords: 
  - ニューラルネットワーク
  - 深層学習
  - ナレッジベース
  - 自然言語処理
  - zilliz
  - zilliz cloud
  - クラウド
  - addFunctionField()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# addFunctionField()

この操作は、関数ベースの出力フィールドと、それにバインドされたインデックスを既存のコレクションに追加します。

## リクエスト構文\{#request-syntax}

```typescript
milvusClient.addFunctionField({ collection_name, field, function, extra_params, index_name?, db_name?, timeout? })
```

**パラメーター：**

- **collection_name** (*string*) -

    既存のコレクションの名前です。

- **field** (*FieldType*) -

    追加する関数出力フィールドのスキーマです。

- **function** (*FunctionObject*) -

    追加する関数のスキーマです。

- **extra_params** (*FunctionFieldIndexParams*) -

    バインドされたインデックスのインデックスパラメーターです。明示的な `index_type` を指定する必要があり、AUTOINDEX は使用できません。

- **index_name** (*string*) -

    新しいフィールドにバインドされたインデックスの名前です。

- **db_name** (*string*) -

    コレクションが格納されているデータベースの名前です。

- **timeout** (*number*) -

    RPC に許容される時間をミリ秒単位で指定するオプションです。デフォルトは undefined です。

**戻り値の型：**

*ResStatus*

**戻り値：**

スキーマ変更のステータスです。

**パラメーター：**

- **error_code** (*number*) -

    エラーコード番号です。0 は成功を意味します。

- **reason** (*string*) -

    エラーがある場合は、その原因です。

**例外：**

- **MilvusError**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合にスローされます。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#example}

```javascript
await milvusClient.addFunctionField({
  collection_name: 'my_collection',
  function: {
    name: 'bm25_fn',
    type: 'BM25',
    input_field_names: ['text'],
    output_field_names: ['sparse_vector'],
    params: {},
  },
  field: {
    name: 'sparse_vector',
    type: 'SparseFloatVector',
  },
  extra_params: {
    index_type: 'SPARSE_INVERTED_INDEX',
    metric_type: 'IP',
  },
});
```
