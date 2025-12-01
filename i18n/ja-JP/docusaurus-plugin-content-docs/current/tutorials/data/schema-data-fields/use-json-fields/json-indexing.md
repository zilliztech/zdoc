---
title: "JSONインデックス | Cloud"
slug: /json-indexing
sidebar_label: "JSONインデックス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSONフィールドは、Zilliz Cloudに構造化メタデータを柔軟に保存する方法を提供します。インデックスがない場合、JSONフィールドのクエリにはコレクション全体をスキャンする必要があり、データセットが大きくなるにつれて遅くなります。JSONインデックスは、JSONデータ内の値にインデックスを作成することで高速ルックアップを可能にします。 | Cloud"
type: origin
token: MBVVww2Zii8k6Bk77GJcXbZJnpf
sidebar_position: 2
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - json field
  - index
  - path index
  - flat index
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark

---

import Admonition from '@theme/Admonition';


# JSONインデックス

JSONフィールドは、Zilliz Cloudに構造化メタデータを柔軟に保存する方法を提供します。インデックスがない場合、JSONフィールドのクエリにはコレクション全体をスキャンする必要があり、データセットが大きくなるにつれて遅くなります。JSONインデックスは、JSONデータ内の値にインデックスを作成することで高速ルックアップを可能にします。

JSONインデックスは以下に最適です：

- 一貫した既知のキーを持つ構造化スキーマ

- 特定のJSONパスの等価および範囲クエリ

- インデックス対象のキーを正確に制御する必要があるシナリオ

- ターゲットクエリを効率的に高速化するためのストレージ効率

<Admonition type="info" icon="📘" title="ノート">

<p>複雑なJSONドキュメントと多様なクエリパターンには、代替として<a href="./json-shredding">JSON Shredding</a>を検討してください。</p>

</Admonition>

## JSONインデックス構文\{#json-indexing-syntax}

JSONインデックスを作成する際には、以下の項目を指定します：

- **JSONパス**: インデックス対象のデータの正確な場所

- **データキャスト型**: 値の解釈方法と保存方法

- **オプションの型変換**: 必要に応じてインデックス作成時のデータ変換

JSONフィールドにインデックスを作成する構文は以下の通りです：

```python
# インデックスパラメータを準備
index_params = MilvusClient.prepare_index_params()

index_params.add_index(
    field_name="<json_field_name>",  # JSONフィールド名
    index_type="AUTOINDEX",  # AUTOINDEXに設定する必要があります
    index_name="<unique_index_name>",  # インデックス名
    params={
        "json_path": "<path_to_json_key>",  # JSONデータ内でのインデックス対象キーのパス
        "json_cast_type": "<data_type>",  # 値を解釈およびインデックス化するときに使用するデータ型
        # "json_cast_function": "<cast_function>"  # オプション：インデックス作成時にキー値をターゲット型に変換
    }
)
```

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明</p></th>
     <th><p>値/例</p></th>
   </tr>
   <tr>
     <td><p><code>field_name</code></p></td>
     <td><p>コレクションスキーマ内のJSONフィールド名です。</p></td>
     <td><p><code>"metadata"</code></p></td>
   </tr>
   <tr>
     <td><p><code>index_type</code></p></td>
     <td><p>JSONインデックスでは<code>"AUTOINDEX"</code>である必要があります。</p></td>
     <td><p><code>"AUTOINDEX"</code></p></td>
   </tr>
   <tr>
     <td><p><code>index_name</code></p></td>
     <td><p>このインデックスのユニーク識別子です。</p></td>
     <td><p><code>"category_index"</code></p></td>
   </tr>
   <tr>
     <td><p><code>json_path</code></p></td>
     <td><p>JSONオブジェクト内でインデックス対象のキーへのパスです。</p></td>
     <td><ul><li><p>トップレベルキー：<code>'metadata["category"]'</code></p></li><li><p>ネストされたキー：<code>'metadata["supplier"]["contact"]["email"]'</code></p></li><li><p>JSONオブジェクト全体：<code>"metadata"</code></p></li><li><p>サブオブジェクト：<code>'metadata["supplier"]'</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>json_cast_type</code></p></td>
     <td><p>値を解釈およびインデックス化するときに使用するデータ型。キーの実際のデータ型と一致する必要があります。</p><p>使用可能なキャスト型のリストについては、<a href="./json-indexing#supported-cast-types">サポートされているキャスト型</a>以下を参照してください。</p></td>
     <td><p><code>"VARCHAR"</code></p></td>
   </tr>
   <tr>
     <td><p><code>json_cast_function</code></p></td>
     <td><p><strong>（オプション）</strong> インデックス作成時に元のキー値をターゲット型に変換します。この構成は、キー値が誤った形式で保存されており、インデックス作成時にデータ型を変換したい場合にのみ必要です。</p><p>使用可能なキャスト関数のリストについては、<a href="./json-indexing#supported-cast-functions">サポートされているキャスト関数</a>以下を参照してください。</p></td>
     <td><p><code>"STRING_TO_DOUBLE"</code></p></td>
   </tr>
</table>

### サポートされているキャスト型\{#supported-cast-types}

Zilliz Cloudは、インデックス作成時のキャストに以下のデータ型をサポートしています。これらの型により、データが効率的なフィルタリング用に正しく解釈されることを保証します。

<table>
   <tr>
     <th><p>キャスト型</p></th>
     <th><p>説明</p></th>
     <th><p>JSON値の例</p></th>
   </tr>
   <tr>
     <td><p><code>BOOL</code> / <code>bool</code></p></td>
     <td><p>真偽値をインデックス化するために使用され、true/false条件のクエリを可能にします。</p></td>
     <td><p><code>true</code>, <code>false</code></p></td>
   </tr>
   <tr>
     <td><p><code>DOUBLE</code> / <code>double</code></p></td>
     <td><p>数値（整数と浮動小数点数の両方）用に使用されます。範囲や等価性に基づくフィルタリング（例：<code>&gt;</code>, <code>&lt;</code>, <code>==</code>）を可能にします。</p></td>
     <td><p><code>42</code>, <code>99.99</code></p></td>
   </tr>
   <tr>
     <td><p><code>VARCHAR</code> / <code>varchar</code></p></td>
     <td><p>文字列値をインデックス化するために使用され、名前やカテゴリ、IDなどのテキストベースのデータに一般的です。</p></td>
     <td><p><code>"electronics"</code>, <code>"BrandA"</code></p></td>
   </tr>
   <tr>
     <td><p><code>ARRAY_BOOL</code> / <code>array_bool</code></p></td>
     <td><p>真偽値の配列をインデックス化するために使用されます。</p></td>
     <td><p><code>[true, false, true]</code></p></td>
   </tr>
   <tr>
     <td><p><code>ARRAY_DOUBLE</code> / <code>array_double</code></p></td>
     <td><p>数値の配列をインデックス化するために使用されます。</p></td>
     <td><p><code>[1.2, 3.14, 42]</code></p></td>
   </tr>
   <tr>
     <td><p><code>ARRAY_VARCHAR</code> / <code>array_varchar</code></p></td>
     <td><p>文字列の配列をインデックス化するために使用されます。タグやキーワードのリストに理想的です。</p></td>
     <td><p><code>["tag1", "tag2", "tag3"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>JSON</code> / <code>json</code></p></td>
     <td><p>自動型推論とフラット化による完全なJSONオブジェクトまたはサブオブジェクト。</p><p>完全なJSONオブジェクトにインデックスを作成すると、インデックスサイズが大きくなります。多キーのシナリオでは、<a href="./json-shredding">JSON Shredding</a>を検討してください。</p></td>
     <td><p>任意のJSONオブジェクト</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="ノート">

<p>最適なインデックス作成のために配列には同じ型の要素を含める必要があります。詳細は<a href="./use-array-fields">Array Field</a>を参照してください。</p>

</Admonition>

### サポートされているキャスト関数\{#supported-cast-functions}

JSONフィールドキーに誤った形式の値が含まれている場合（例：文字列として保存された数値）、`json_cast_function`引数にキャスト関数を渡してインデックス作成時にこれらの値を変換できます。

キャスト関数は大文字小文字を区別しません。以下の関数がサポートされています：

<table>
   <tr>
     <th><p>キャスト関数</p></th>
     <th><p>変換元 → 変換先</p></th>
     <th><p>使用例</p></th>
   </tr>
   <tr>
     <td><p><code>STRING_TO_DOUBLE</code> / <code>string_to_double</code></p></td>
     <td><p>文字列 → 数値（double）</p></td>
     <td><p><code>"99.99"</code>を<code>99.99</code>に変換</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="ノート">

<p>変換に失敗した場合（例：数値でない文字列）、値はスキップされ、インデックスに含まれません。</p>

</Admonition>

## JSONインデックスを作成\{#create-json-indexes}

このセクションでは、実践的な例を使用して異なる種類のJSONデータにインデックスを作成する方法を示します。すべての例では、以下に示すサンプルJSON構造を使用し、適切に定義されたコレクションスキーマを持つ**MilvusClient**への接続がすでに確立されていると想定しています。

### サンプルJSON構造\{#sample-json-structure}

```json
{
  "metadata": {
    "category": "electronics",
    "brand": "BrandA",
    "in_stock": true,
    "price": 99.99,
    "string_price": "99.99",
    "tags": ["clearance", "summer_sale"],
    "supplier": {
      "name": "SupplierX",
      "country": "USA",
      "contact": {
        "email": "support@supplierx.com",
        "phone": "+1-800-555-0199"
      }
    }
  }
}
```

### 基本的なセットアップ\{#basic-setup}

JSONインデックスを作成する前に、インデックスパラメータを準備します：

```python
# インデックスパラメータを準備
index_params = MilvusClient.prepare_index_params()
```

### 例1: 単純なJSONキーにインデックスを作成\{#example-1-index-a-simple-json-key}

製品カテゴリによる高速フィルタリングを可能にするために`category`フィールドにインデックスを作成します：

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX", # JSONパスインデックス作成ではAUTOINDEXに設定する必要があります
    index_name="category_index",  # ユニークなインデックス名
    # highlight-start
    params={
        "json_path": 'metadata["category"]', # JSONキーへのパス
        "json_cast_type": "varchar" # データキャスト型
    }
    # highlight-end
)
```