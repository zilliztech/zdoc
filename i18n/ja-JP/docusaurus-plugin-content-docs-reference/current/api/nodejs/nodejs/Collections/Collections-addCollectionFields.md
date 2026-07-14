---
title: "addCollectionFields() | Node.js"
slug: /node/node/Collections-addCollectionFields
sidebar_label: "addCollectionFields()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存の collection を再作成することなく、新しい scalar field のリストを追加します。これらの field は、内部スキーマ同期により最小限の遅延でほぼ即座に利用可能になります。 | Node.js"
type: docx
token: FmG6dw3O1ouzgbxnl4jc5T7cnXf
sidebar_position: 20
keywords: 
  - 動画類似検索
  - ベクトル検索
  - 音声類似検索
  - Elastic vector database
  - zilliz
  - zilliz cloud
  - cloud
  - addCollectionFields()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# addCollectionFields()

この操作は、既存の collection を再作成することなく、新しい scalar field のリストを追加します。これらの field は、内部スキーマ同期により最小限の遅延でほぼ即座に利用可能になります。

```javascript
await milvusClient.addCollectionFields(data: AddCollectionFieldReq)
```

<Admonition type="info" icon="📘" title="注意">

collection で dynamic field が有効になっていて、既存の dynamic field キーと同じ名前の static field を追加した場合、static field が dynamic field キーをマスクします。元の dynamic 値には、`$meta['field_name']` 構文を使用して引き続きアクセスできます。

</Admonition>

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.addCollectionFields({
    collection_name: string,
    db_name?: string,
    field: FieldType,
    timeout?: number
})
```

**パラメーター:**

- **collection_name** (*string*) -

    対象 collection の名前。

- **db_name** (*string*) -

    対象データベースの名前。

- **fields** (*FieldType[]*) -

    追加する field の設定。各 field は、以下のフィールドを持つ **FieldType** オブジェクトです。

    - **name** (*string)* -

        field の名前。

    - **data_type** (*string)* -

        field のデータ型。利用可能なすべてのデータ型の一覧については、[DataType](./Collections-DataType) を参照してください。

    - **description** (*string)* -

        field の説明。

    - **is_clustering_key** (*boolean*) -

        この field が clustering key として機能するかどうかを示すブール値。

    - **is_partition_key** (*boolean)* -

        この field が partition key field として機能するかどうかを示すブール値。

    - **is_primary_key** (*boolean)* -

        この field が主キーとして機能するかどうか。

        デフォルト値は **False** です。これを **True** に設定すると、その field は collection 全体で一意な主キー field になります。

    - **type_params** (*string* | *number)* -

        field のその他のパラメーター。

        - **auto_id** (*boolean)* -

            この collection へのデータ挿入時に、主 field が自動的に増分するかどうか。

            デフォルト値は **False** です。これを **True** に設定すると、主 field は自動的に増分します。カスタマイズされたスキーマで collection を設定する必要がある場合は、このパラメーターをスキップしてください。

        - **dim** (*string* | *number*) -

            vector 埋め込みを保持する collection field の次元数。 

            値は 1 より大きい整数である必要があり、通常は vector 埋め込みの生成に使用するモデルによって決まります。

        - **element_type** (string) -

            配列内の要素のデータ型。 

            このパラメーターは、現在の field が配列 field の場合に適用されます。

        - **max_capacity** (*string* | *number)* -

            配列内の要素数。

            このパラメーターは、現在の field が配列 field の場合に適用されます。

        - **max_length** (*string*) -

            この field 内の文字列の最大長。

            これは、この field の **data_type** が **VarChar** の場合に必須です。

        - **type_params** (*object*) -

            現在の field の追加パラメーター（キーと値のペア）。

    - **nullable** (*boolean*) -

        field が null 値を受け入れ可能かどうかを指定するブール値パラメーター。有効な値:

        - **true**: field は null 値を含むことができ、field が任意であり、エントリに対して欠損データが許可されることを示します。

        - **false** (default): field は各 entity に対して有効な値を含む必要があります。欠損データは許可されず、この field は必須になります。

        詳細については、[Nullable & Default](https://milvus.io/docs/nullable-and-default.md) を参照してください。

    - **default_value** (*object*)

        collection スキーマの作成時に、特定の field にデフォルト値を設定します。これは、データ挿入時に値が明示的に指定されない場合でも、特定の field に初期値を持たせたいときに特に便利です。

    - **enable_analyzer** (*boolean*) -

        指定された `VarChar` field に対してテキスト解析を有効にするかどうか。`true` に設定すると、Milvus にテキスト analyzer を使用するよう指示し、field のテキスト内容をトークン化してフィルタリングします。

    - **enable_match** (*boolean*)

        指定された `VarChar` field に対してキーワードマッチングを有効にするかどうか。`true` に設定すると、Milvus はその field に対して inverted index を作成し、高速かつ効率的なキーワード検索を可能にします。`enable_match` は `enable_analyzer` と連携して動作し、構造化された用語ベースのテキスト検索を提供します。`enable_analyzer` がトークン化を処理し、`enable_match` がそれらのトークンに対する検索処理を担います。

    - **analyzer_params** (*object*)

        テキスト処理用の analyzer を設定します。特に `VarChar` field に対して使用されます。このパラメーターは、[keyword matching](https://milvus.io/docs/keyword-match.md) や [full text search](https://milvus.io/docs/full-text-search.md) に使用されるテキスト field 向けに、tokenizer と filter の設定を構成します。analyzer の種類に応じて、以下のいずれかの方法で設定できます。

        - 組み込み analyzer

            ```javascript
            const analyzer_params: { type: 'english' };
            ```

            - `type` (*string*) -

                Milvus に組み込まれた事前設定済みの analyzer タイプで、名前を指定するだけですぐに使用できます。使用可能な値: `standard`, `english`, `chinese`。詳細については、[Standard Analyzer](https://milvus.io/docs/standard-analyzer.md)、[English Analyzer](https://milvus.io/docs/english-analyzer.md)、および [Chinese Analyzer](https://milvus.io/docs/chinese-analyzer.md) を参照してください。

        - カスタム analyzer

            ```javascript
            const analyzer_params: {
                "tokenizer": "standard",
                "filter": ["lowercase"],
            };
            ```

            - `tokenizer` (*string*) -

                tokenizer タイプを定義します。使用可能な値: `standard` (default), `whitespace`, `jieba`。詳細については、[Standard Tokenizer](https://milvus.io/docs/standard-tokenizer.md)、[Whitespace Tokenizer](https://milvus.io/docs/whitespace-tokenizer.md)、および [Jieba Tokenizer](https://milvus.io/docs/jieba-tokenizer.md) を参照してください。

            - `filter` (*list*) -

                tokenizer によって生成されたトークンを絞り込むための filter を一覧表示します。組み込み filter とカスタム filter のオプションがあります。詳細については、[Alphanumonly Filter](https://milvus.io/docs/alphanumonly-filer.md) などを参照してください。

- **timeout** (*number*) -  

    この操作のタイムアウト時間。これを **None** に設定すると、いずれかのレスポンスが到着するか、いずれかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise\<ResStatus>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**パラメーター:**

- **code** (*number*) -

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```javascript
const milvusClient = new MilvusClient(MILVUS_ADDRESS);
const resStatus = await milvusClient.addCollectionFields({
  collection_name: 'my_collection',
  fields: [
    {
      name: 'new_field_1',
      data_type: 'Int64',
      is_primary_key: false,
      description: 'First new field'
    },
    {
      name: 'new_field_2',
      data_type: 'FloatVector',
      dim: 128,
      description: 'Second new field'
    }
  ]
});
```
