---
title: "HybridSearch() | Cloud"
slug: /cpp/cpp/Vector-HybridSearch
sidebar_label: "HybridSearch()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Hybrid search a collection based on the given parameters and return results. | Cloud"
type: docx
token: EHmkdGRrlooizbxSZ8wc9CYgnAb
sidebar_position: 3
keywords: 
  - AI chatbots
  - cosine distance
  - what is a vector database
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

Hybrid search a collection based on the given parameters and return results.

```c++
Status HybridSearch(const HybridSearchRequest& request, HybridSearchResponse& response)
```

## Request Syntax\{#request-syntax}

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

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Set target db name, use default database if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Set name of the collection.

- `WithPartitionNames(std::set<std::string>&& partition_names)`

    Set the partition names. If partition nemes are empty, will query in the entire collection.

- `AddPartitionName(const std::string& partition_name)`

    Add a partition name.

- `WithOutputFields(std::set<std::string>&& output_field_names)`

    Set the output field names.

- `AddOutputField(const std::string& output_field)`

    Add an output field.

- `WithConsistencyLevel(ConsistencyLevel consistency_level)`

    Set the consistency level. Read the doc for more info: https://milvus.io/docs/consistency.md#Consistency-Level.

- `WithSubRequests(std::vector<SubSearchRequestPtr>&& requests)`

    Set sub search requests.

- `AddSubRequest(const SubSearchRequestPtr& request)`

    Add sub search request.

- `WithRerank(const FunctionPtr& rerank)`

    Set rerank, suc as RRF/Weighted function. Read the doc for more info: https://milvus.io/docs/reranking.md.

- `WithLimit(int64_t limit)`

    Set search limit(topk).

- `WithOffset(int64_t offset)`

    Set offset value. Note: this value is stored in the ExtraParams.

- `WithRoundDecimal(int64_t round_decimal)`

    Set round decimal value.

- `WithIgnoreGrowing(bool ignore_growing)`

    Set ignore growing flag.

- `AddExtraParam(const std::string& key, const std::string& value)`

    Add extra parameters such as "nlist", "ef".

- `WithGroupByField(const std::string& field_name)`

    Set group by field value.

- `WithGroupSize(int64_t group_size)`

    Set group size value.

- `WithStrictGroupSize(bool strict_group_size)`

    Set strict group size flag.

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

**REQUEST METHODS:**

- `SubSearchRequest& WithAnnsField(const std::string& ann_field)`

- `SubSearchRequest& WithLimit(int64_t limit)`

- `SubSearchRequest& WithFilter(std::string filter)`

- `SubSearchRequest& WithMetricType(milvus::MetricType metric_type)`

- `SubSearchRequest& WithTimezone(const std::string& timezone)`

**Inherited vector methods** (all return `SubSearchRequest&` for chaining):

- `AddFloatVector(const FloatVecFieldData::ElementT& vector)`

- `AddBinaryVector(const std::string& vector)`

- `AddSparseVector(const SparseFloatVecFieldData::ElementT& vector)`

- `AddFloat16Vector(const Float16VecFieldData::ElementT& vector)`

- `AddBFloat16Vector(const BFloat16VecFieldData::ElementT& vector)`

- `AddInt8Vector(const Int8VecFieldData::ElementT& vector)`

- `AddEmbeddedText(const std::string& text)`

- `AddEmbeddingList(EmbeddingList&& emb_list)` — for struct-field ANN

- `WithFloatVectors(std::vector<FloatVecFieldData::ElementT>&& vectors)` — batch

- `WithSparseVectors(...)`, `WithFloat16Vectors(...)`, etc. — batch variants

### Query vector types\{#query-vector-types}

Each `SubSearchRequest` accepts one query-vector representation matching the target field's [DataType](./Collections-DataType). Use the corresponding add or batch builder method; these are query inputs, not collection column payloads.

| Schema DataType | Request methods | C++ representation | Notes |
| --- | --- | --- | --- |
| `FLOAT_VECTOR` | `AddFloatVector()`, `WithFloatVectors()` | `std::vector<float>` | Dense float vectors. |
| `BINARY_VECTOR` | `AddBinaryVector()`, `WithBinaryVectors()` | Binary bytes or string convenience input | Uses the dedicated binary-vector representation. |
| `SPARSE_FLOAT_VECTOR` | `AddSparseVector()`, `WithSparseVectors()` | `std::map<uint32_t, float>` or supported JSON form | Sparse index-value pairs. |
| `FLOAT16_VECTOR` | `AddFloat16Vector()`, `WithFloat16Vectors()` | `std::vector<uint16_t>` or convertible float vectors | Float overloads perform conversion. |
| `BFLOAT16_VECTOR` | `AddBFloat16Vector()`, `WithBFloat16Vectors()` | `std::vector<uint16_t>` or convertible float vectors | Float overloads perform conversion. |
| `INT8_VECTOR` | `AddInt8Vector()`, `WithInt8Vectors()` | `std::vector<int8_t>` | Dense signed-byte vectors. |
| Function or struct-field input | `AddEmbeddedText()` / `WithEmbeddedTexts()`; `AddEmbeddingList()` / `WithEmbeddingLists()` | `std::string` or `EmbeddingList` | Use embedded text for supported functions and embedding lists for struct-field ANN search. |

**RETURNS:**

*Status*

Returns a status indicating whether the operation succeeded.

### FieldData\{#fielddata}

This is the template class that represents column-based data for a single field. Concrete aliases cover every supported data type. Instances of the concrete types are used when inserting data via `InsertRequest::WithRowsData()` or reading query/search results via `QueryResults::OutputField()` and `SingleResult::OutputField()`.

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

This class holds one or more query vectors of the same type, used as the target vectors for a `SearchRequest`, `SubSearchRequest`, or struct-field ANN search via `AddEmbeddingList()`. Build an `EmbeddingList` by calling the Add*/Set* methods, then pass it to `SearchRequestBase::AddEmbeddingList()`.

```c++
EmbeddingList list;
```

**METHODS:**

**Read methods:**

- `FieldDataPtr TargetVectors() const`

    Returns the underlying field data containing all vectors.

- `size_t Count() const`

    Returns the number of vectors added.

- `int64_t Dim() const`

    Returns the vector dimension. For embedded-text mode the value is `0`.

**Single-vector add methods:**

- `Status AddFloatVector(const FloatVecFieldData::ElementT& vector)`

    Appends one dense float vector.

- `Status AddBinaryVector(const std::string& vector)`

    Appends one binary vector. The string overload converts the string to binary bytes.

- `Status AddBinaryVector(const BinaryVecFieldData::ElementT& vector)`

    Appends one binary vector. The string overload converts the string to binary bytes.

- `Status AddSparseVector(const SparseFloatVecFieldData::ElementT& vector)`

    Appends one sparse vector from index-value data or a supported JSON representation.

- `Status AddSparseVector(const nlohmann::json& vector)`

    Appends one sparse vector from index-value data or a supported JSON representation.

- `Status AddFloat16Vector(const Float16VecFieldData::ElementT& vector)`

    Appends one float16 vector. The float-vector overload converts values to float16.

- `Status AddFloat16Vector(const std::vector<float>& vector)` — auto-converts float to float16

    Appends one float16 vector. The float-vector overload converts values to float16.

- `Status AddBFloat16Vector(const BFloat16VecFieldData::ElementT& vector)`

    Appends one bfloat16 vector. The float-vector overload converts values to bfloat16.

- `Status AddBFloat16Vector(const std::vector<float>& vector)` — auto-converts float to bfloat16

    Appends one bfloat16 vector. The float-vector overload converts values to bfloat16.

- `Status AddInt8Vector(const Int8VecFieldData::ElementT& vector)`

    Appends one dense int8 vector.

- `Status AddEmbeddedText(const std::string& text)` — for BM25 text-embedding

    Appends text for a supported text-embedding function such as BM25.

**Batch set methods (reset the list):**

- `Status SetFloatVectors(std::vector<FloatVecFieldData::ElementT>&& vectors)`

    Replaces the current list with dense float vectors.

- `Status SetBinaryVectors(const std::vector<std::string>& vectors)`

    Replaces the current list with binary vectors.

- `Status SetBinaryVectors(std::vector<BinaryVecFieldData::ElementT>&& vectors)`

    Replaces the current list with binary vectors.

- `Status SetSparseVectors(std::vector<SparseFloatVecFieldData::ElementT>&& vectors)`

    Replaces the current list with sparse vectors.

- `Status SetSparseVectors(const std::vector<nlohmann::json>& vectors)`

    Replaces the current list with sparse vectors.

- `Status SetFloat16Vectors(std::vector<Float16VecFieldData::ElementT>&& vectors)`

    Replaces the current list with float16 vectors; float input is converted when applicable.

- `Status SetFloat16Vectors(const std::vector<std::vector<float>>& vectors)` — auto-converts

    Replaces the current list with float16 vectors; float input is converted when applicable.

- `Status SetBFloat16Vectors(std::vector<BFloat16VecFieldData::ElementT>&& vectors)`

    Replaces the current list with bfloat16 vectors; float input is converted when applicable.

- `Status SetBFloat16Vectors(const std::vector<std::vector<float>>& vectors)` — auto-converts

    Replaces the current list with bfloat16 vectors; float input is converted when applicable.

- `Status SetInt8Vectors(std::vector<Int8VecFieldData::ElementT>&& vectors)`

    Replaces the current list with dense int8 vectors.

- `Status SetEmbeddedTexts(std::vector<std::string>&& texts)` — for BM25 text-embedding

    Replaces the current list with text input for a supported embedding function.

### SearchResults\{#searchresults}

`SearchResponse::Results()` returns one `SearchResults` object for the complete search call. `SearchResults` contains one `SingleResult` for each query vector, preserving query-vector order.

This class is returned by calling `Results()` on a `SearchResponse` or `HybridSearchResponse`.

```c++
SearchResults();
explicit SearchResults(std::vector<SingleResult>&& results);
```

**METHODS:**

- `const std::vector<SingleResult>& Results() const`

    Returns one `SingleResult` per query vector, in the same order as the vectors were added to the request.

- `const std::vector<float>& Recalls() const`

    Recall values per query vector. Populated only when the search is run on a Zilliz Cloud instance with `enable_recall_calculation` set to `true`. Otherwise the vector is empty.

#### SingleResult\{#singleresult}

`SingleResult` contains the top-k hits for one query vector, including scores, primary keys, and requested output fields. `SearchResults` is the outer collection that contains these per-query results.

```c++
struct SingleResult {
    SingleResult(const std::string& pk_name, const std::string& score_name,
                 std::vector<FieldDataPtr>&& output_fields,
                 const std::set<std::string>& output_names);
};

using SingleResultPtr = std::shared_ptr<SingleResult>;
```

**METHODS:**

- `const std::vector<float>& Scores() const`

    Returns the similarity scores or distances for this query vector.

- `IDArray Ids() const`

    Returns the primary-key values for the hits. Prefer OutputField() when the primary-key field type must be preserved.

- `const std::string& PrimaryKeyName() const`

    Returns the primary-key field name reported by the server.

- `const std::string& ScoreName() const`

    Returns the result score-field name, including any collision-avoidance prefix.

- `FieldDataPtr OutputField(const std::string& name) const`

    Returns one requested output field by name; the template overload casts it to the requested concrete FieldData type.

- `const std::vector<FieldDataPtr>& OutputFields() const`

    Returns all requested output fields as FieldDataPtr values.

- `const std::set<std::string>& OutputFieldNames() const`

    Returns the names of the requested output fields.

- `Status OutputRows(EntityRows& rows) const`

    Materializes all hits as row-oriented entity data.

- `Status OutputRow(int i, EntityRow& row) const`

    Materializes one hit by zero-based index.

- `uint64_t GetRowCount() const`

    Returns the number of hits in this result.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

#### Output field types\{#output-field-types}

Requested entity fields are returned through `FieldDataPtr`. The concrete `XxxFieldData` type follows the field's schema [DataType](./Collections-DataType); use `OutputField(name)` for the base pointer or `OutputField<T>(name)` for a checked shared-pointer cast.

The pointer convention is `XxxFieldDataPtr = std::shared_ptr<XxxFieldData>`. This result representation is shared by search and query interfaces and does not make the pointer aliases separate API pages.

## Example\{#example}

Demonstrates HybridSearch() with the C++ SDK.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::HybridSearchRequest();
milvus::HybridSearchResponse response;
util::CheckStatus(client->HybridSearch(request, response));
```
