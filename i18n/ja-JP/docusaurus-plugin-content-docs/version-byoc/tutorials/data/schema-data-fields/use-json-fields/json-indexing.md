---
title: "JSONインデクシング | BYOC"
slug: /json-indexing
sidebar_label: "JSONインデクシング"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSONフィールドは、Zilliz Cloudで構造化メタデータを柔軟に保存する方法を提供します。インデクシングがないと、JSONフィールドのクエリにはコレクション全体をスキャンする必要があり、データセットが大きくなると遅くなります。JSONインデクシングは、JSONデータ内にインデックスを作成することで高速ルックアップを可能にします。 | BYOC"
type: origin
token: MBVVww2Zii8k6Bk77GJcXbZJnpf
sidebar_position: 2
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - スキーマ
  - jsonフィールド
  - インデックス
  - パスインデックス
  - フラットインデックス
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似性検索
  - マルチモーダルRAG

---

import Admonition from '@theme/Admonition';


# JSONインデクシング

JSONフィールドは、Zilliz Cloudで構造化メタデータを柔軟に保存する方法を提供します。インデクシングがないと、JSONフィールドのクエリにはコレクション全体をスキャンする必要があり、データセットが大きくなると遅くなります。JSONインデクシングは、JSONデータ内にインデックスを作成することで高速ルックアップを可能にします。

JSONインデクシングは以下に最適です：

- 一貫した既知のキーを持つ構造化スキーマ

- 特定のJSONパスでの等価性および範囲クエリ

- どのキーにインデックスを付けるかを正確に制御する必要があるシナリオ

- ターゲットクエリのストレージ効率の良い高速化

<Admonition type="info" icon="📘" title="注意">

<p>多様なクエリパターンを持つ複雑なJSONドキュメントの場合、代替として<a href="./json-shredding">JSONシャレディング</a>を検討してください。</p>

</Admonition>

## JSONインデクシング構文\{#json-indexing-syntax}

JSONインデックスを作成する際には、以下を指定します。

- **JSONパス**：インデックスを作成するデータの正確な位置

- **データキャスト型**：インデックスされた値を解釈および保存する方法

- **オプションの型変換**：必要に応じてインデックス作成時にデータを変換

JSONフィールドにインデックスを作成する構文は以下の通りです。

```python
# インデックスパラメータを準備
index_params = MilvusClient.prepare_index_params()

index_params.add_index(
    field_name="<json_field_name>",  # JSONフィールドの名前
    index_type="AUTOINDEX",  # AUTOINDEXでなければならない
    index_name="<unique_index_name>",  # インデックス名
    params={
        "json_path": "<path_to_json_key>",  # JSONデータ内でインデックスされる特定のキー
        "json_cast_type": "<data_type>",  # 値を解釈およびインデックスする際に使用するデータ型
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
     <td><p>コレクションスキーマ内のJSONフィールドの名前。</p></td>
     <td><p><code>"metadata"</code></p></td>
   </tr>
   <tr>
     <td><p><code>index_type</code></p></td>
     <td><p>JSONインデクシングでは<code>"AUTOINDEX"</code>でなければならない。</p></td>
     <td><p><code>"AUTOINDEX"</code></p></td>
   </tr>
   <tr>
     <td><p><code>index_name</code></p></td>
     <td><p>このインデックスのユニーク識別子。</p></td>
     <td><p><code>"category_index"</code></p></td>
   </tr>
   <tr>
     <td><p><code>json_path</code></p></td>
     <td><p>JSONオブジェクト内でインデックスするキーへのパス。</p></td>
     <td><ul><li><p>トップレベルのキー：<code>'metadata["category"]'</code></p></li><li><p>ネストされたキー：<code>'metadata["supplier"]["contact"]["email"]'</code></p></li><li><p>完全なJSONオブジェクト：<code>"metadata"</code></p></li><li><p>サブオブジェクト：<code>'metadata["supplier"]'</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>json_cast_type</code></p></td>
     <td><p>値を解釈およびインデックスする際に使用するデータ型。キーの実際のデータ型と一致しなければならない。</p><p>利用可能なキャスト型のリストについては、<a href="./json-indexing#supported-cast-types">以下でサポートされるキャスト型</a>を参照。</p></td>
     <td><p><code>"VARCHAR"</code></p></td>
   </tr>
   <tr>
     <td><p><code>json_cast_function</code></p></td>
     <td><p><strong>（オプション）</strong>インデックス作成時に元のキー値をターゲット型に変換。この構成は、キー値が誤った形式で保存されており、インデックス作成中にデータ型を変換したい場合にのみ必要。</p><p>利用可能なキャスト関数のリストについては、<a href="./json-indexing#supported-cast-functions">以下のサポートされるキャスト関数</a>を参照。</p></td>
     <td><p><code>"STRING_TO_DOUBLE"</code></p></td>
   </tr>
</table>

### サポートされるキャスト型\{#supported-cast-types}

Zilliz Cloudは、インデックス作成時にキャストするための以下のデータ型をサポートしています。これらの型により、データが効率的なフィルタリングのために正しく解釈されます。

<table>
   <tr>
     <th><p>キャスト型</p></th>
     <th><p>説明</p></th>
     <th><p>JSON値の例</p></th>
   </tr>
   <tr>
     <td><p><code>BOOL</code> / <code>bool</code></p></td>
     <td><p>ブール値をインデックス化するために使用され、true/false条件でのフィルタリングクエリを可能にします。</p></td>
     <td><p><code>true</code>, <code>false</code></p></td>
   </tr>
   <tr>
     <td><p><code>DOUBLE</code> / <code>double</code></p></td>
     <td><p>整数および浮動小数点数を含む数値に使用されます。範囲や等価性（例：<code>&gt;</code>、<code>&lt;</code>、<code>==</code>）に基づくフィルタリングを可能にします。</p></td>
     <td><p><code>42</code>, <code>99.99</code></p></td>
   </tr>
   <tr>
     <td><p><code>VARCHAR</code> / <code>varchar</code></p></td>
     <td><p>文字列値をインデックス化するために使用され、名前、カテゴリ、IDなどのテキストベースのデータに一般的です。</p></td>
     <td><p><code>"electronics"</code>, <code>"BrandA"</code></p></td>
   </tr>
   <tr>
     <td><p><code>ARRAY_BOOL</code> / <code>array_bool</code></p></td>
     <td><p>ブール値の配列をインデックス化するために使用されます。</p></td>
     <td><p><code>[true, false, true]</code></p></td>
   </tr>
   <tr>
     <td><p><code>ARRAY_DOUBLE</code> / <code>array_double</code></p></td>
     <td><p>数値の配列をインデックス化するために使用されます。</p></td>
     <td><p><code>[1.2, 3.14, 42]</code></p></td>
   </tr>
   <tr>
     <td><p><code>ARRAY_VARCHAR</code> / <code>array_varchar</code></p></td>
     <td><p>文字列の配列をインデックス化するために使用され、タグやキーワードのリストに理想的です。</p></td>
     <td><p><code>["tag1", "tag2", "tag3"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>JSON</code> / <code>json</code></p></td>
     <td><p>自動型推論とフラット化による完全なJSONオブジェクトまたはサブオブジェクト。</p><p>完全なJSONオブジェクトにインデックスを付けるとインデックスサイズが増加します。多くのキーがあるシナリオでは<a href="./json-shredding">JSONシャレディング</a>を検討してください。</p></td>
     <td><p>任意のJSONオブジェクト</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="注意">

<p>最適なインデクシングのために配列には同じ型の要素を含めるべきです。詳細は<a href="./use-array-fields">配列フィールド</a>を参照してください。</p>

</Admonition>

### サポートされるキャスト関数\{#supported-cast-functions}

JSONフィールドキーに誤った形式の値（例：文字列として保存された数値）が含まれている場合、`json_cast_function`引数にキャスト関数を渡してインデックス作成時にこれらの値を変換できます。

キャスト関数は大文字小文字を区別しません。以下の関数がサポートされています。

<table>
   <tr>
     <th><p>キャスト関数</p></th>
     <th><p>変換元 → 変換先</p></th>
     <th><p>使用例</p></th>
   </tr>
   <tr>
     <td><p><code>STRING_TO_DOUBLE</code> / <code>string_to_double</code></p></td>
     <td><p>文字列 → 数値（倍精度）</p></td>
     <td><p><code>"99.99"</code> を <code>99.99</code> に変換</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="注意">

<p>変換に失敗した場合（例：数値でない文字列）、値はスキップされインデックスに含まれません。</p>

</Admonition>

## JSONインデックスの作成\{#create-json-indexes}

このセクションでは、実際の例を使用して異なる型のJSONデータにインデックスを作成する方法を示します。すべての例では、以下に示すサンプルJSON構造を使用し、適切に定義されたコレクションスキーマを持つ**MilvusClient**への接続を確立済みであると想定しています。

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

### 基本的な設定\{#basic-setup}

JSONインデックスを作成する前に、インデックスパラメータを準備してください。

```python
# インデックスパラメータを準備
index_params = MilvusClient.prepare_index_params()
```

### 例1：単純なJSONキーにインデックスを作成\{#example-1-index-a-simple-json-key}

製品カテゴリによる高速フィルタリングを可能にするために`category`フィールドにインデックスを作成します。

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX", # JSONパスインデクシングではAUTOINDEXに設定する必要があります
    index_name="category_index",  # ユニークなインデックス名
    # highlight-start
    params={
        "json_path": 'metadata["category"]', # JSONキーへのパス
        "json_cast_type": "varchar" # データキャスト型
    }
    # highlight-end
)
```

### 例2：ネストされたキーにインデックスを作成\{#example-2-index-a-nested-key}

サプライヤーの連絡先検索のために深くネストされた`email`フィールドにインデックスを作成します。

```python
# ネストされたキーにインデックスを作成
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX", # JSONパスインデクシングではAUTOINDEXに設定する必要があります
    index_name="email_index", # ユニークなインデックス名
    # highlight-start
    params={
        "json_path": 'metadata["supplier"]["contact"]["email"]', # ネストされたJSONキーへのパス
        "json_cast_type": "varchar" # データキャスト型
    }
    # highlight-end
)
```

### 例3：インデックス作成時にデータ型を変換\{#example-3-convert-data-type-at-index-time}

場合によっては数値データが誤って文字列として保存されることがあります。`STRING_TO_DOUBLE`キャスト関数を使用して変換および適切にインデックスを作成します。

```python
# インデックス作成時に文字列数値を倍精度に変換
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX", # JSONパスインデクシングではAUTOINDEXに設定する必要があります
    index_name="string_to_double_index", # ユニークなインデックス名
    params={
        "json_path": 'metadata["string_price"]', # インデックスされるJSONキーへのパス
        "json_cast_type": "double", # データキャスト型
        # highlight-next-line
        "json_cast_function": "STRING_TO_DOUBLE" # キャスト関数；大文字小文字を区別しない
    }
)
```

**重要**：変換がいずれかのドキュメントで失敗した場合（例：`"invalid"`のような数値でない文字列）、そのドキュメントの値はインデックスから除外され、フィルター結果には表示されません。

### 例4：完全なオブジェクトにインデックスを作成\{#example-4-index-entire-objects}

その中の任意のフィールドに対するクエリを可能にするために完全なJSONオブジェクトにインデックスを作成します。`json_cast_type="JSON"`を使用すると、システムは自動的に：

- **JSON構造をフラット化**：ネストされたオブジェクトは効率的なインデクシングのためにフラットなパスに変換されます

- **データ型を推測**：各値はその内容に基づいて数値、文字列、ブール値、または日付として自動的に分類されます

- **包括的なカバレッジを作成**：オブジェクト内のすべてのキーおよびネストされたパスが検索可能になります

上記の[サンプルJSON構造](./json-indexing#sample-json-structure)について、完全な`metadata`オブジェクトにインデックスを作成します。

```python
# 完全なJSONオブジェクトにインデックスを作成
index_params.add_index(
    field_name="metadata",
    index_type="AUTOINDEX",
    index_name="metadata_full_index",
    params={
        # highlight-start
        "json_path": "metadata",
        "json_cast_type": "JSON"
        # highlight-end
    }
)
```

JSON構造の一部にのみインデックスを作成することもできます。例：すべての`supplier`情報。

```python
# サブオブジェクトにインデックスを作成
index_params.add_index(
    field_name="metadata",
    index_type="AUTOINDEX",
    index_name="supplier_index",
    params={
        # highlight-start
        "json_path": 'metadata["supplier"]',
        "json_cast_type": "JSON"
        # highlight-end
    }
)
```

### インデックス構成の適用\{#apply-index-configuration}

すべてのインデックスパラメータを定義したら、コレクションに適用します。

```python
# すべてのインデックス構成をコレクションに適用
MilvusClient.create_index(
    collection_name="your_collection_name",
    index_params=index_params
)
```

インデクシングが完了すると、JSONフィールドクエリはこれらのインデックスを自動的に使用してパフォーマンスが高速化されます。

## よくある質問\{#faq}

### クエリのフィルター式がインデックスされたキャスト型とは異なる型を使用している場合、どうなりますか？\{#what-happens-if-a-querys-filter-expression-uses-a-different-type-than-the-indexed-cast-type}

フィルター式がインデックスの`json_cast_type`とは異なる型を使用している場合、Zilliz Cloudはインデックスを使用せず、データが許可する場合に遅いブルートフォーススキャンに移行する可能性があります。最適なパフォーマンスのために、フィルター式は常にインデックスのキャスト型と一致させてください。たとえば、`json_cast_type="double"`で数値インデックスが作成された場合、数値フィルター条件のみがインデックスを活用します。

### JSONインデックスを作成する際、JSONキーが異なるエンティティ間でデータ型が一貫していない場合、どうなりますか？\{#when-creating-a-json-index-what-if-a-json-key-has-inconsistent-data-types-across-different-entities}

型の一貫性がない場合、**部分的なインデクシング**が発生する可能性があります。たとえば、`metadata["price"]`フィールドが数値（`99.99`）および文字列（`"99.99"`）の両方として保存され、`json_cast_type="double"`でインデックスが作成された場合、数値のみがインデックスに含まれます。文字列形式のエントリはスキップされ、フィルター結果には表示されません。

### 同じJSONキーに複数のインデックスを作成できますか？\{#can-i-create-multiple-indexes-on-the-same-json-key}

いいえ、各JSONキーは1つのインデックスのみをサポートします。データに一致する単一の`json_cast_type`を選択する必要があります。ただし、完全なJSONオブジェクトとそのオブジェクト内のネストされたキーにそれぞれインデックスを作成することはできます。
