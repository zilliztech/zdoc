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
  - AI chatbots
  - cosine distance
  - what is a ベクトル データベース
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - HybridSearch()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
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

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithPartitionNames(std::set<std::string>&& partition_names)`

    パーティション名を設定します。パーティション名が空の場合、コレクション全体に対してクエリが実行されます。

- `AddPartitionName(const std::string& partition_name)`

    パーティション名を追加します。

- `WithOutputFields(std::set<std::string>&& output_field_names)`

    出力フィールド名を設定します。

- `AddOutputField(const std::string& output_field)`

    出力フィールドを追加します。

- `WithConsistencyLevel(ConsistencyLevel consistency_level)`

    整合性レベルを設定します。詳細については、ドキュメントを参照してください: https://milvus.io/docs/consistency.md#Consistency-Level.

- `WithSubRequests(std::vector<SubSearchRequestPtr>&& requests)`

    サブ検索リクエストを設定します。

- `AddSubRequest(const SubSearchRequestPtr& request)`

    サブ検索リクエストを追加します。

- `WithRerank(const FunctionPtr& rerank)`

    RRF/Weighted 関数などのリランキングを設定します。詳細については、ドキュメントを参照してください: https://milvus.io/docs/reranking.md.

- `WithLimit(int64_t limit)`

    検索上限 (topk) を設定します。

- `WithOffset(int64_t offset)`

    オフセット値を設定します。注: この値は ExtraParams に格納されます。

- `WithRoundDecimal(int64_t round_decimal)`

    小数点以下の丸め桁数を設定します。

- `WithIgnoreGrowing(bool ignore_growing)`

    成長中セグメント無視フラグを設定します。

- `AddExtraParam(const std::string& key, const std::string& value)`

    "nlist" や "ef" などの追加パラメーターを設定します。

- `WithGroupByField(const std::string& field_name)`

    グループ化フィールド値を設定します。

- `WithGroupSize(int64_t group_size)`

    グループ サイズ値を設定します。

- `WithStrictGroupSize(bool strict_group_size)`

    厳密なグループ サイズ フラグを設定します。

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

**リクエスト メソッド:**

- `SubSearchRequest& WithAnnsField(const std::string& ann_field)`

- `SubSearchRequest& WithLimit(int64_t limit)`

- `SubSearchRequest& WithFilter(std::string filter)`

- `SubSearchRequest& WithMetricType(milvus::MetricType metric_type)`

- `SubSearchRequest& WithTimezone(const std::string& timezone)`

**継承されるベクトル メソッド** (いずれもメソッドチェーン用に `SubSearchRequest&` を返します):

- `AddFloatVector(const FloatVecFieldData::ElementT& vector)`

- `AddBinaryVector(const std::string& vector)`

- `AddSparseVector(const SparseFloatVecFieldData::ElementT& vector)`

- `AddFloat16Vector(const Float16VecFieldData::ElementT& vector)`

- `AddBFloat16Vector(const BFloat16VecFieldData::ElementT& vector)`

- `AddInt8Vector(const Int8VecFieldData::ElementT& vector)`

- `AddEmbeddedText(const std::string& text)`

- `AddEmbeddingList(EmbeddingList&& emb_list)` — 構造体フィールド ANN 用

- `WithFloatVectors(std::vector<FloatVecFieldData::ElementT>&& vectors)` — バッチ処理用

- `WithSparseVectors(...)`、`WithFloat16Vectors(...)` など — バッチ処理のバリエーション

### クエリ ベクトルの型\{#query-vector-types}

各 `SubSearchRequest` は、対象フィールドの [DataType](./Collections-DataType) に一致するクエリ ベクトル表現を 1 つ受け取ります。対応する add メソッドまたはバッチ ビルダー メソッドを使用してください。これらはクエリ入力であり、コレクションのカラム ペイロードではありません。

| スキーマ DataType | リクエスト メソッド | C++ での表現 | 備考 |
| --- | --- | --- | --- |
| `FLOAT_VECTOR` | `AddFloatVector()`, `WithFloatVectors()` | `std::vector<float>` | 密な浮動小数点ベクトル。 |
| `BINARY_VECTOR` | `AddBinaryVector()`, `WithBinaryVectors()` | バイナリ バイトまたは文字列による簡易入力 | 専用のバイナリ ベクトル表現を使用します。 |
| `SPARSE_FLOAT_VECTOR` | `AddSparseVector()`, `WithSparseVectors()` | `std::map<uint32_t, float>` またはサポートされている JSON 形式 | スパース インデックスと値のペア。 |
| `FLOAT16_VECTOR` | `AddFloat16Vector()`, `WithFloat16Vectors()` | `std::vector<uint16_t>` または変換可能な浮動小数点ベクトル | 浮動小数点オーバーロードにより変換が行われます。 |
| `BFLOAT16_VECTOR` | `AddBFloat16Vector()`, `WithBFloat16Vectors()` | `std::vector<uint16_t>` または変換可能な浮動小数点ベクトル | 浮動小数点オーバーロードにより変換が行われます。 |
| `INT8_VECTOR` | `AddInt8Vector()`, `WithInt8Vectors()` | `std::vector<int8_t>` | 密な符号付きバイト ベクトル。 |
| 関数または構造体フィールドの入力 | `AddEmbeddedText()` / `WithEmbeddedTexts()`; `AddEmbeddingList()` / `WithEmbeddingLists()` | `std::string` または `EmbeddingList` | サポートされている関数には埋め込みテキストを、構造体フィールド ANN 検索には埋め込みリストを使用します。 |

**戻り値:**

*Status*

操作の成否を示すステータスを返します。

### FieldData\{#fielddata}

単一フィールドのカラムベース データを表すテンプレート クラスです。具体的なエイリアスがサポート対象のすべてのデータ型に対応しています。`InsertRequest::WithRowsData()` を使用したデータ挿入や、`QueryResults::OutputField()` および `SingleResult::OutputField()` を使用したクエリ/search結果の読み取り時に、これらの具体型のインスタンスが使用されます。

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

このクラスは同じ型のクエリ ベクトルを 1 つ以上保持し、`SearchRequest`、`SubSearchRequest`、または `AddEmbeddingList()` を介した構造体フィールド ANN 検索の対象ベクトルとして使用されます。Add*/Set* メソッドを呼び出して `EmbeddingList` を構築し、それを `SearchRequestBase::AddEmbeddingList()` に渡します。

```c++
EmbeddingList list;
```

**メソッド:**

**読み取りメソッド:**

- `FieldDataPtr TargetVectors() const`

    すべてのベクトルを含む基盤となるフィールド データを返します。

- `size_t Count() const`

    追加されたベクトルの数を返します。

- `int64_t Dim() const`

    ベクトルの次元数を返します。埋め込みテキスト モードの場合、値は `0` となります。

**単一ベクトル追加メソッド:**

- `Status AddFloatVector(const FloatVecFieldData::ElementT& vector)`

    密な浮動小数点ベクトルを 1 つ追加します。

- `Status AddBinaryVector(const std::string& vector)`

    バイナリ ベクトルを 1 つ追加します。文字列オーバーロードでは文字列がバイナリ バイトに変換されます。

- `Status AddBinaryVector(const BinaryVecFieldData::ElementT& vector)`

    バイナリ ベクトルを 1 つ追加します。文字列オーバーロードでは文字列がバイナリ バイトに変換されます。

- `Status AddSparseVector(const SparseFloatVecFieldData::ElementT& vector)`

    インデックスと値のデータ、またはサポートされている JSON 表現からスパース ベクトルを 1 つ追加します。

- `Status AddSparseVector(const nlohmann::json& vector)`

    インデックスと値のデータ、またはサポートされている JSON 表現からスパース ベクトルを 1 つ追加します。

- `Status AddFloat16Vector(const Float16VecFieldData::ElementT& vector)`

    float16 ベクトルを 1 つ追加します。浮動小数点ベクトル オーバーロードでは値が float16 に変換されます。

- `Status AddFloat16Vector(const std::vector<float>& vector)` — float から float16 への自動変換

    float16 ベクトルを 1 つ追加します。浮動小数点ベクトル オーバーロードでは値が float16 に変換されます。

- `Status AddBFloat16Vector(const BFloat16VecFieldData::ElementT& vector)`

    bfloat16 ベクトルを 1 つ追加します。浮動小数点ベクトル オーバーロードでは値が bfloat16 に変換されます。

- `Status AddBFloat16Vector(const std::vector<float>& vector)` — float から bfloat16 への自動変換

    bfloat16 ベクトルを 1 つ追加します。浮動小数点ベクトル オーバーロードでは値が bfloat16 に変換されます。

- `Status AddInt8Vector(const Int8VecFieldData::ElementT& vector)`

    密な int8 ベクトルを 1 つ追加します。

- `Status AddEmbeddedText(const std::string& text)` — BM25 テキスト埋め込み用

    BM25 など、サポートされているテキスト埋め込み関数用のテキストを追加します。

**バッチ設定メソッド (リストをリセット):**

- `Status SetFloatVectors(std::vector<FloatVecFieldData::ElementT>&& vectors)`

    現在のリストを密な浮動小数点ベクトルで置き換えます。

- `Status SetBinaryVectors(const std::vector<std::string>& vectors)`

    現在のリストをバイナリ ベクトルで置き換えます。

- `Status SetBinaryVectors(std::vector<BinaryVecFieldData::ElementT>&& vectors)`

    現在のリストをバイナリ ベクトルで置き換えます。

- `Status SetSparseVectors(std::vector<SparseFloatVecFieldData::ElementT>&& vectors)`

    現在のリストをスパース ベクトルで置き換えます。

- `Status SetSparseVectors(const std::vector<nlohmann::json>& vectors)`

    現在のリストをスパース ベクトルで置き換えます。

- `Status SetFloat16Vectors(std::vector<Float16VecFieldData::ElementT>&& vectors)`

    現在のリストを float16 ベクトルで置き換えます。該当する場合、浮動小数点入力は変換されます。

- `Status SetFloat16Vectors(const std::vector<std::vector<float>>& vectors)` — 自動変換

    現在のリストを float16 ベクトルで置き換えます。該当する場合、浮動小数点入力は変換されます。

- `Status SetBFloat16Vectors(std::vector<BFloat16VecFieldData::ElementT>&& vectors)`

    現在のリストを bfloat16 ベクトルで置き換えます。該当する場合、浮動小数点入力は変換されます。

- `Status SetBFloat16Vectors(const std::vector<std::vector<float>>& vectors)` — 自動変換

    現在のリストを bfloat16 ベクトルで置き換えます。該当する場合、浮動小数点入力は変換されます。

- `Status SetInt8Vectors(std::vector<Int8VecFieldData::ElementT>&& vectors)`

    現在のリストを密な int8 ベクトルで置き換えます。

- `Status SetEmbeddedTexts(std::vector<std::string>&& texts)` — BM25 テキスト埋め込み用

    現在のリストをサポートされている埋め込み関数用のテキスト入力で置き換えます。

### SearchResults\{#searchresults}

`SearchResponse::Results()` は、検索呼び出し全体に対して 1 つの `SearchResults` オブジェクトを返します。`SearchResults` にはクエリ ベクトルごとに 1 つの `SingleResult` が含まれ、クエリ ベクトルの順序が維持されます。

このクラスは、`SearchResponse` または `HybridSearchResponse` に対して `Results()` を呼び出すことで返されます。

```c++
SearchResults();
explicit SearchResults(std::vector<SingleResult>&& results);
```

**メソッド:**

- `const std::vector<SingleResult>& Results() const`

    クエリベクトルごとに 1 つの `SingleResult` を、ベクトルがリクエストに追加された順序と同じ順序で返します。

- `const std::vector<float>& Recalls() const`

    クエリ ベクトルごとの再現率値。`enable_recall_calculation` が `true` に設定された Zilliz Cloud インスタンス上で検索が実行された場合にのみ設定されます。それ以外の場合、ベクトルは空になります。

#### SingleResult\{#singleresult}

`SingleResult` には、1 つのクエリ ベクトルに対する top-k ヒットが含まれており、スコア、プライマリ キー、および要求された出力フィールドが格納されています。`SearchResults` は、これらのクエリごとの結果を格納する外側のコレクションです。

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

    このクエリ ベクトルの類似度スコアまたは距離を返します。

- `IDArray Ids() const`

    ヒットした項目のプライマリ キー値を返します。プライマリ キー フィールドの型を保持する必要がある場合は、OutputField() を使用してください。

- `const std::string& PrimaryKeyName() const`

    サーバーから報告されたプライマリ キー フィールド名を返します。

- `const std::string& ScoreName() const`

    衝突回避プレフィックスを含む、結果のスコア フィールド名を返します。

- `FieldDataPtr OutputField(const std::string& name) const`

    名前を指定して要求された出力フィールドを 1 つ返します。テンプレート オーバーロードにより、要求された具体的な FieldData 型にキャストされます。

- `const std::vector<FieldDataPtr>& OutputFields() const`

    要求されたすべての出力フィールドを FieldDataPtr 値として返します。

- `const std::set<std::string>& OutputFieldNames() const`

    要求された出力フィールドの名前を返します。

- `Status OutputRows(EntityRows& rows) const`

    すべてのヒットを行指向のエンティティ データとして実体化します。

- `Status OutputRow(int i, EntityRow& row) const`

    0 から始まるインデックスを指定して 1 つのヒットを実体化します。

- `uint64_t GetRowCount() const`

    この結果に含まれるヒット数を返します。

**エラー処理:**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

#### 出力フィールドの型\{#output-field-types}

要求されたエンティティ フィールドは `FieldDataPtr` を通じて返されます。具体的な `XxxFieldData` 型は、フィールドのスキーマ [DataType](./Collections-DataType) に従います。ベース ポインターには `OutputField(name)` を、チェック付き共有ポインター キャストには `OutputField<T>(name)` を使用します。

ポインターの規則は `XxxFieldDataPtr = std::shared_ptr<XxxFieldData>` です。この結果表現は検索インターフェースとクエリ インターフェースで共有されており、ポインター エイリアスが個別の API ページになることはありません。

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
