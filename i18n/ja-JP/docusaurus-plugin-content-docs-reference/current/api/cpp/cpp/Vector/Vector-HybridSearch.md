---
title: "HybridSearch() | Cloud"
slug: /cpp/cpp/Vector-HybridSearch
sidebar_label: "HybridSearch()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "指定されたパラメーターに基づいてコレクションをハイブリッド検索し、結果を返します。 | Cloud"
type: docx
token: EHmkdGRrlooizbxSZ8wc9CYgnAb
sidebar_position: 3
keywords: 
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
  - zilliz
  - zilliz cloud
  - クラウド
  - HybridSearch()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# HybridSearch()

指定されたパラメーターに基づいてコレクションをハイブリッド検索し、結果を返します。

```c++
Status HybridSearch(const HybridSearchRequest& request, HybridSearchResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = HybridSearchRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionNames(partition_names)
    .AddPartitionName(partition_name)
    .WithOutputFields(output_field_names)
    .AddOutputField(output_field)
    .WithConsistencyLevel(consistency_level)
    .WithSubRequests(requests)
    .AddSubRequest(request)
    .WithRerank(rerank)
    .WithLimit(limit)
    .WithOffset(offset)
    .WithRoundDecimal(round_decimal)
    .WithIgnoreGrowing(ignore_growing)
    .AddExtraParam(key, value)
    .WithGroupByField(field_name)
    .WithGroupSize(group_size)
    .WithStrictGroupSize(strict_group_size);
```

### HybridSearchRequest\{#hybridsearchrequest}

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithPartitionNames(std::set<std::string>&& partition_names)`

    パーティション名を設定します。パーティション名が空の場合は、コレクション全体に対してクエリが実行されます。

- `AddPartitionName(const std::string& partition_name)`

    パーティション名を追加します。

- `WithOutputFields(std::set<std::string>&& output_field_names)`

    出力フィールド名を設定します。

- `AddOutputField(const std::string& output_field)`

    出力フィールドを追加します。

- `WithConsistencyLevel(ConsistencyLevel consistency_level)`

    整合性レベルを設定します。詳細については、[Consistency Level](/docs/consistency-level) を参照してください。

- `WithSubRequests(std::vector<SubSearchRequestPtr>&& requests)`

    サブ検索リクエストを設定します。

- `AddSubRequest(const SubSearchRequestPtr& request)`

    サブ検索リクエストを追加します。

- `WithRerank(const FunctionPtr& rerank)`

    RRF/Weighted 関数などのリランクを設定します。詳細については、[Weighted Ranker](/docs/reranking-weighted-reranker) とその関連ページを参照してください。

- `WithLimit(int64_t limit)`

    検索上限（topk）を設定します。

- `WithOffset(int64_t offset)`

    オフセット値を設定します。注：この値は ExtraParams に格納されます。

- `WithRoundDecimal(int64_t round_decimal)`

    小数点以下の丸め桁数を設定します。

- `WithIgnoreGrowing(bool ignore_growing)`

    成長中を無視するフラグを設定します。

- `AddExtraParam(const std::string& key, const std::string& value)`

    「nlist」、「ef」などの追加パラメーターを追加します。

- `WithGroupByField(const std::string& field_name)`

    グループ化フィールドの値を設定します。

- `WithGroupSize(int64_t group_size)`

    グループサイズの値を設定します。

- `WithStrictGroupSize(bool strict_group_size)`

    厳密なグループサイズフラグを設定します。

### SubSearchRequest\{#subsearchrequest}

```c++
SubSearchRequest()
    .WithAnnsField(field_name)
    .WithLimit(limit)
    .WithFilter(filter)
    .WithMetricType(metric_type)
    .WithTimezone(tz)
    .AddFloatVector(vector)       // or any Add*/With* vector method
    .WithFloatVectors(vectors);   // batch assignment
```

**リクエストメソッド:**

- `WithAnnsField(const std::string& ann_field)`

    ANN 検索の対象フィールドを設定します。

- `WithLimit(int64_t limit)`

    このサブ検索の検索上限（topk）を設定します。

- `WithFilter(std::string filter)`

    このサブ検索のフィルター式を設定します。

- `WithMetricType(milvus::MetricType metric_type)`

    このサブ検索のメトリックタイプを指定します。

- `WithTimezone(const std::string& timezone)`

    タイムゾーンを設定します。Timestamptz フィールドに対して有効です。

**継承されるベクトルメソッド**（いずれもチェーン用に `SubSearchRequest&` を返します）:

- `AddFloatVector(const FloatVecFieldData::ElementT& vector)`

    密な浮動小数点ベクトルを 1 つ追加します。

- `AddBinaryVector(const std::string& vector)`

    バイナリベクトルを 1 つ追加します。文字列オーバーロードは文字列をバイナリバイトに変換します。

- `AddSparseVector(const SparseFloatVecFieldData::ElementT& vector)`

    インデックスと値のデータからスパースベクトルを 1 つ追加します。

- `AddFloat16Vector(const Float16VecFieldData::ElementT& vector)`

    float16 ベクトルを 1 つ追加します。

- `AddBFloat16Vector(const BFloat16VecFieldData::ElementT& vector)`

    bfloat16 ベクトルを 1 つ追加します。

- `AddInt8Vector(const Int8VecFieldData::ElementT& vector)`

    密な int8 ベクトルを 1 つ追加します。

- `AddEmbeddedText(const std::string& text)`

    BM25 など、サポートされているテキスト埋め込み関数に埋め込みテキストを追加します。

- `AddEmbeddingList(EmbeddingList&& emb_list)` — for struct-field ANN

    構造体フィールド ANN 検索用の埋め込みリストを追加します。

- `WithFloatVectors(std::vector<FloatVecFieldData::ElementT>&& vectors)` — batch

    密な float ベクトルを一括設定します。

- `WithSparseVectors(...)`, `WithFloat16Vectors(...)`, etc. — batch variants

    対応する追加メソッドの一括処理用バリエーションです。

### クエリベクトルの型\{#query-vector-types}

各 `SubSearchRequest` は、対象フィールドの [DataType](./Collections-DataType) に一致するクエリベクトル表現を 1 つ受け取ります。対応する追加メソッドまたは一括ビルダーメソッドを使用してください。これらはクエリ入力であり、コレクションのカラムペイロードではありません。

| スキーマ DataType | リクエストメソッド | C++ での表現 | 備考 |
| --- | --- | --- | --- |
| FLOAT_VECTOR | AddFloatVector(), WithFloatVectors() | std::ベクトル&lt;float&gt; | 密な浮動小数点ベクトル。 |
| BINARY_VECTOR | AddBinaryVector(), WithBinaryVectors() | Binary bytes or string convenience input | 専用のバイナリベクトル表現を使用します。 |
| SPARSE_FLOAT_VECTOR | AddSparseVector(), WithSparseVectors() | std::map\<uint32_t, float> or supported JSON form | スパースインデックスと値のペア。 |
| FLOAT16_VECTOR | AddFloat16Vector(), WithFloat16Vectors() | std::ベクトル&lt;uint16_t&gt; or convertible float ベクトル | 浮動小数点のオーバーロードによって変換が実行されます。 |
| BFLOAT16_VECTOR | AddBFloat16Vector(), WithBFloat16Vectors() | std::ベクトル&lt;uint16_t&gt; or convertible float ベクトル | 浮動小数点のオーバーロードによって変換が実行されます。 |
| INT8_VECTOR | AddInt8Vector(), WithInt8Vectors() | std::ベクトル&lt;int8_t&gt; | 密な符号付きバイトベクトル。 |
| 関数または構造体フィールドの入力 | AddEmbeddedText() / WithEmbeddedTexts(); AddEmbeddingList() / WithEmbeddingLists() | std::string または EmbeddingList | サポートされている関数には埋め込みテキストを、構造体フィールド ANN 検索には埋め込みリストを使用します。 |

**戻り値:**

*Status*

操作が成功したかどうかを示すステータスを返します。

### FieldData\{#fielddata}

単一フィールドのカラムベースデータを表すテンプレートクラスです。具体的なエイリアスは、サポートされているすべてのデータ型に対応しています。これらの具象型のインスタンスは、`InsertRequest::WithRowsData()` によるデータ挿入時や、`QueryResults::OutputField()` および `SingleResult::OutputField()` によるクエリ/search 結果の読み取り時に使用されます。

```c++
// Base abstract interface (not instantiated directly)
class Field {
    const std::string& Name() const;
    DataType Type() const;
    DataType ElementType() const;   // for ARRAY fields only
    virtual size_t Count() const = 0;
    virtual void Reserve(size_t count) = 0;
};

using FieldDataPtr = std::shared_ptr<Field>;

// Template class
template <typename T, DataType Dt>
class FieldData : public Field {
    explicit FieldData(std::string name);
    FieldData(std::string name, const std::vector<T>& data);
    FieldData(std::string name, const std::vector<T>& data, const std::vector<bool>& valid_data);

    StatusCode Add(const T& element);
    StatusCode AddNull();
    StatusCode Append(const std::vector<T>& elements);
    size_t Count() const;
    void Reserve(size_t count);
    virtual const std::vector<T>& Data() const;
    virtual T Value(size_t i) const;
    virtual bool IsNull(size_t i) const;
    virtual const std::vector<bool>& ValidData() const;
};
```

### EmbeddingList\{#embeddinglist}

このクラスは、同じ型のクエリベクトルを 1 つ以上保持し、`SearchRequest`、`SubSearchRequest`、または `AddEmbeddingList()` を介した構造体フィールド ANN 検索のターゲットベクトルとして使用されます。Add*/Set* メソッドを呼び出して `EmbeddingList` を構築し、それを `SearchRequestBase::AddEmbeddingList()` に渡します。

```c++
EmbeddingList list;
```

**メソッド:**

**読み取りメソッド:**

- `FieldDataPtr TargetVectors() const`

    すべてのベクトルを含む基盤となるフィールドデータを返します。

- `size_t Count() const`

    追加されたベクトルの数を返します。

- `int64_t Dim() const`

    ベクトルの次元数を返します。埋め込みテキストモードの場合、値は `0` です。

**単一ベクトル追加メソッド:**

- `Status AddFloatVector(const FloatVecFieldData::ElementT& vector)`

    密な浮動小数点ベクトルを 1 つ追加します。

- `Status AddBinaryVector(const std::string& vector)`

    バイナリベクトルを 1 つ追加します。文字列オーバーロードは文字列をバイナリバイトに変換します。

- `Status AddBinaryVector(const BinaryVecFieldData::ElementT& vector)`

    バイナリベクトルを 1 つ追加します。文字列オーバーロードは文字列をバイナリバイトに変換します。

- `Status AddSparseVector(const SparseFloatVecFieldData::ElementT& vector)`

    インデックスと値のデータ、またはサポートされている JSON 表現からスパースベクトルを 1 つ追加します。

- `Status AddSparseVector(const nlohmann::json& vector)`

    インデックスと値のデータ、またはサポートされている JSON 表現からスパースベクトルを 1 つ追加します。

- `Status AddFloat16Vector(const Float16VecFieldData::ElementT& vector)`

    float16 ベクトルを 1 つ追加します。浮動小数点ベクトルのオーバーロードは値を float16 に変換します。

- `Status AddFloat16Vector(const std::vector<float>& vector)` — auto-converts float to float16

    float16 ベクトルを 1 つ追加します。浮動小数点ベクトルのオーバーロードは値を float16 に変換します。

- `Status AddBFloat16Vector(const BFloat16VecFieldData::ElementT& vector)`

    bfloat16 ベクトルを 1 つ追加します。浮動小数点ベクトルのオーバーロードは値を bfloat16 に変換します。

- `Status AddBFloat16Vector(const std::vector<float>& vector)` — auto-converts float to bfloat16

    bfloat16 ベクトルを 1 つ追加します。浮動小数点ベクトルのオーバーロードは値を bfloat16 に変換します。

- `Status AddInt8Vector(const Int8VecFieldData::ElementT& vector)`

    密な int8 ベクトルを 1 つ追加します。

- `Status AddEmbeddedText(const std::string& text)` — for BM25 text-embedding

    BM25 など、サポートされているテキスト埋め込み関数用のテキストを追加します。

**一括設定メソッド（リストをリセット）:**

- `Status SetFloatVectors(std::vector<FloatVecFieldData::ElementT>&& vectors)`

    現在のリストを密な浮動小数点ベクトルで置き換えます。

- `Status SetBinaryVectors(const std::vector<std::string>& vectors)`

    現在のリストをバイナリベクトルで置き換えます。

- `Status SetBinaryVectors(std::vector<BinaryVecFieldData::ElementT>&& vectors)`

    現在のリストをバイナリベクトルで置き換えます。

- `Status SetSparseVectors(std::vector<SparseFloatVecFieldData::ElementT>&& vectors)`

    現在のリストをスパースベクトルで置き換えます。

- `Status SetSparseVectors(const std::vector<nlohmann::json>& vectors)`

    現在のリストをスパースベクトルで置き換えます。

- `Status SetFloat16Vectors(std::vector<Float16VecFieldData::ElementT>&& vectors)`

    現在のリストを float16 ベクトルで置き換えます。適用可能な場合、浮動小数点入力は変換されます。

- `Status SetFloat16Vectors(const std::vector<std::vector<float>>& vectors)` — auto-converts

    現在のリストを float16 ベクトルで置き換えます。適用可能な場合、浮動小数点入力は変換されます。

- `Status SetBFloat16Vectors(std::vector<BFloat16VecFieldData::ElementT>&& vectors)`

    現在のリストを bfloat16 ベクトルで置き換えます。適用可能な場合、浮動小数点入力は変換されます。

- `Status SetBFloat16Vectors(const std::vector<std::vector<float>>& vectors)` — auto-converts

    現在のリストを bfloat16 ベクトルで置き換えます。適用可能な場合、浮動小数点入力は変換されます。

- `Status SetInt8Vectors(std::vector<Int8VecFieldData::ElementT>&& vectors)`

    現在のリストを密な int8 ベクトルで置き換えます。

- `Status SetEmbeddedTexts(std::vector<std::string>&& texts)` — for BM25 text-embedding

    現在のリストを、サポートされている埋め込み関数用のテキスト入力で置き換えます。

### SearchResults\{#searchresults}

`SearchResponse::Results()` は、検索呼び出し全体に対して 1 つの `SearchResults` オブジェクトを返します。`SearchResults` にはクエリベクトルごとに 1 つの `SingleResult` が含まれ、クエリベクトルの順序が維持されます。

このクラスは、`SearchResponse` または `HybridSearchResponse` に対して `Results()` を呼び出すことで返されます。

```c++
SearchResults();
explicit SearchResults(std::vector<SingleResult>&& results);
```

**メソッド:**

- `const std::vector<SingleResult>& Results() const`

    クエリベクトルごとに 1 つの `SingleResult` を、ベクトルがリクエストに追加された順序と同じ順序で返します。

- `const std::vector<float>& Recalls() const`

    クエリベクトルごとの再現率値です。Zilliz Cloud インスタンスで `enable_recall_calculation` が `true` に設定されて検索が実行された場合にのみ設定されます。それ以外の場合、ベクトルは空です。

#### SingleResult\{#singleresult}

`SingleResult` には、1 つのクエリベクトルに対する top-k ヒットが含まれ、スコア、プライマリキー、および要求された出力フィールドが格納されています。`SearchResults` は、これらのクエリごとの結果を含む外側のコレクションです。

```c++
struct SingleResult {
    SingleResult(const std::string& pk_name, const std::string& score_name,
                 std::vector<FieldDataPtr>&& output_fields,
                 const std::set<std::string>& output_names);
};

using SingleResultPtr = std::shared_ptr<SingleResult>;
```

**メソッド:**

- `const std::vector<float>& Scores() const`

    このクエリベクトルの類似度スコアまたは距離を返します。

- `IDArray Ids() const`

    ヒットのプライマリキー値を返します。プライマリキーフィールドの型を保持する必要がある場合は、OutputField() を使用してください。

- `const std::string& PrimaryKeyName() const`

    サーバーから報告されたプライマリキーフィールド名を返します。

- `const std::string& ScoreName() const`

    衝突回避プレフィックスを含む、結果のスコアフィールド名を返します。

- `FieldDataPtr OutputField(const std::string& name) const`

    名前で要求された出力フィールドを 1 つ返します。テンプレートオーバーロードは、要求された具体的な FieldData 型にキャストします。

- `const std::vector<FieldDataPtr>& OutputFields() const`

    要求されたすべての出力フィールドを FieldDataPtr 値として返します。

- `const std::set<std::string>& OutputFieldNames() const`

    要求された出力フィールドの名前を返します。

- `Status OutputRows(EntityRows& rows) const`

    すべてのヒットを行指向のエンティティデータとして実体化します。

- `Status OutputRow(int i, EntityRow& row) const`

    0 から始まるインデックスで 1 つのヒットを実体化します。

- `uint64_t GetRowCount() const`

    この結果のヒット数を返します。

**エラー処理:**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

#### 出力フィールドの型\{#output-field-types}

要求されたエンティティフィールドは `FieldDataPtr` を通じて返されます。具体的な `XxxFieldData` 型は、フィールドのスキーマ [DataType](./Collections-DataType) に従います。ベースポインターには `OutputField(name)` を、型チェック付きの共有ポインターキャストには `OutputField<T>(name)` を使用します。

ポインターの規則は `XxxFieldDataPtr = std::shared_ptr<XxxFieldData>` です。この結果表現は検索インターフェースとクエリインターフェースで共有されており、ポインターエイリアスが個別の API ページになるわけではありません。

## 例\{#example}

C++ SDK を使用した HybridSearch() の使用例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::HybridSearchRequest();
milvus::HybridSearchResponse response;
util::CheckStatus(client->HybridSearch(request, response));
```
