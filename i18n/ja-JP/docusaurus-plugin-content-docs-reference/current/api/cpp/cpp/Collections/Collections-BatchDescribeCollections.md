---
title: "BatchDescribeCollections() | Cloud"
slug: /cpp/cpp/Collections-BatchDescribeCollections
sidebar_label: "BatchDescribeCollections()"
beta: false
added_since: v2.6.3
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、複数のコレクションの完全な説明情報を 1 回の呼び出しで取得します。 | Cloud"
type: docx
token: IpztddRkJo1o6JxKNWHcPjO8n8f
sidebar_position: 8
keywords: 
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースのベクトルデータベース
  - ベクトルインデックス
  - zilliz
  - zilliz cloud
  - cloud
  - BatchDescribeCollections()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# BatchDescribeCollections()

この操作は、複数のコレクションの完全な説明情報を 1 回の呼び出しで取得します。

```c++
Status BatchDescribeCollections(const BatchDescribeCollectionsRequest& request, BatchDescribeCollectionsResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = BatchDescribeCollectionsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionNames(collection_names)
    .AddCollectionName(collection_name)
    .WithCollectionIDs(collection_ids)
    .AddCollectionID(collection_id);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    説明対象のコレクションを含むデータベースの名前を設定します。

- `WithCollectionNames(std::vector<std::string>&& collection_names)`

    説明対象のコレクション名を設定します。

- `AddCollectionName(const std::string& collection_name)`

    説明対象のコレクション名を 1 つ追加します。

- `WithCollectionIDs(std::vector<int64_t>&& collection_ids)`

    説明対象のコレクション ID を設定します。

- `AddCollectionID(int64_t collection_id)`

    説明対象のコレクション ID を 1 つ追加します。

**戻り値:**

*Status*

操作が成功したかどうかを示すステータスを返します。応答には、要求したコレクションの完全な説明情報が含まれます。

- **response** (*BatchDescribeCollectionsResponse*) -

    - **Descs** (*const std::ベクトル&lt;CollectionDesc&gt;&*) -

        コレクションの説明情報を取得します。

        - **DatabaseName** (*const std::string&*) -

            このコレクションが属するデータベースの名前です。

        - **CollectionName** (*const std::string&*) -

            コレクション名です。

        - **Description** (*const std::string&*) -

            コレクションの説明です。

        - **NumShards** (*int64_t*) -

            コレクションのシャード数です。

        - **スキーマ** (*const CollectionSchema&*) -

            コレクションのスキーマです。

            - **Name** (*const std::string&*) -

                コレクション名です。空にはできません。

            - **Description** (*const std::string&*) -

                コレクションの説明です。空でもかまいません。

            - **ShardsNum** (*int32_t*) -

                コレクションのシャード数です。数値は 0 より大きい必要があり、デフォルト値は 2 です。

            - **EnableDynamicField** (*bool*) -

                宣言されていないフィールドを非表示の `meta` 動的フィールドに格納するかどうかを指定します。有効にすると、スキーマで宣言されていないフィールドは、`meta` という名前の非表示 JSON フィールドにキーと値のペアとして格納されます。

            - **Fields** (*const std::ベクトル&lt;FieldSchema&gt;&*) -

                フィールドスキーマの配列です。

                - **Name** (*const std::string&*) -

                    このフィールドの名前です。空にはできません。

                - **Description** (*const std::string&*) -

                    このフィールドの説明です。空でもかまいません。

                - **FieldDataType** ([DataType](./Collections-DataType)) -

                    フィールドのデータ型です。

                - **ElementType** ([DataType](./Collections-DataType)) -

                    配列フィールドの要素型です。

                - **IsPrimaryKey** (*bool*) -

                    このフィールドが主キーかどうかです。各コレクションには主キーが 1 つだけあります。主キーにできるのは INT64 および VARCHAR フィールドのみです。

                - **AutoID** (*bool*) -

                    フィールド項目の ID が自動生成されるかどうかです。主キーフィールドにのみ適用されます。true の場合、サーバーは挿入時に ID を生成します。それ以外の場合、クライアントはエンティティごとに ID を指定する必要があります。

                - **IsPartitionKey** (*bool*) -

                    フィールド項目の ID がパーティションキーかどうかです。パーティションキーは各エンティティをパーティションにルーティングします。パーティションキーフィールドは null 許容にできません。

                - **IsClusteringKey** (*bool*) -

                    フィールド項目の ID がクラスタリングキーかどうかです。

                - **TypeParams** (*const std::map&lt;std::string, std::string>&*) -

                    このフィールドの追加のキーと値のペア設定です。

                - **Dimension** (*uint32_t*) -

                    ベクトルフィールドの次元を取得します。

                - **MaxLength** (*uint32_t*) -

                    varchar フィールドの最大長を取得します。

                - **MaxCapacity** (*uint32_t*) -

                    配列フィールドの最大容量を取得します。

                - **IsEnableAnalyzer** (*bool*) -

                    アナライザーを有効にするかどうかのフラグを取得します。

                - **IsEnableMatch** (*bool*) -

                    テキストマッチを有効にするかどうかのフラグを取得します。

                - **AnalyzerParams** (*nlohmann::json*) -

                    アナライザーパラメーターを取得します。

                - **MultiAnalyzerParams** (*nlohmann::json*) -

                    マルチアナライザーパラメーターを取得します。

                - **IsNullable** (*bool*) -

                    フィールド値が null 許容かどうかのフラグを取得します。null 許容フィールドは、挿入時に値が省略された場合または明示的に NULL の場合に NULL を格納します。主キーおよびパーティションキーフィールドは null 許容にできません。NULL を含むベクトルフィールドは、IS NULL 式でフィルタリングできません。

                - **DefaultValue** (*const nlohmann::json&*) -

                    このフィールドのデフォルト値を取得します。

                - **ExternalField** (*const std::string&*) -

                    外部フィールドのマッピング名を取得します。

            - **StructFields** (*const std::ベクトル&lt;StructFieldSchema&gt;&*) -

                構造体フィールドスキーマの配列です。

                - **Name** (*const std::string&*) -

                    このフィールドの名前です。空にはできません。

                - **Description** (*const std::string&*) -

                    このフィールドの説明です。空でもかまいません。

                - **MaxCapacity** (*int64_t*) -

                    構造体フィールドの最大容量を取得します。

                - **IsNullable** (*bool*) -

                    構造体フィールドが null 許容かどうかです。

                - **Fields** (*const std::ベクトル&lt;FieldSchema&gt;&*) -

                    構造体フィールドのサブフィールドを取得します。

                    - **Name** (*const std::string&*) -

                        このフィールドの名前です。空にはできません。

                    - **Description** (*const std::string&*) -

                        このフィールドの説明です。空でもかまいません。

                    - **FieldDataType** ([DataType](./Collections-DataType)) -

                        フィールドのデータ型です。

                    - **ElementType** ([DataType](./Collections-DataType)) -

                        配列フィールドの要素型です。

                    - **IsPrimaryKey** (*bool*) -

                        このフィールドが主キーかどうかです。各コレクションには主キーが 1 つだけあります。主キーにできるのは INT64 および VARCHAR フィールドのみです。

                    - **AutoID** (*bool*) -

                        フィールド項目の ID が自動生成されるかどうかです。主キーフィールドにのみ適用されます。true の場合、サーバーは挿入時に ID を生成します。それ以外の場合、クライアントはエンティティごとに ID を指定する必要があります。

                    - **IsPartitionKey** (*bool*) -

                        フィールド項目の ID がパーティションキーかどうかです。パーティションキーは各エンティティをパーティションにルーティングします。パーティションキーフィールドは null 許容にできません。

                    - **IsClusteringKey** (*bool*) -

                        フィールド項目の ID がクラスタリングキーかどうかです。

                    - **TypeParams** (*const std::map&lt;std::string, std::string>&*) -

                        このフィールドの追加のキーと値のペア設定です。

                    - **Dimension** (*uint32_t*) -

                        ベクトルフィールドの次元を取得します。

                    - **MaxLength** (*uint32_t*) -

                        varchar フィールドの最大長を取得します。

                    - **MaxCapacity** (*uint32_t*) -

                        配列フィールドの最大容量を取得します。

                    - **IsEnableAnalyzer** (*bool*) -

                        アナライザーを有効にするかどうかのフラグを取得します。

                    - **IsEnableMatch** (*bool*) -

                        テキストマッチを有効にするかどうかのフラグを取得します。

                    - **AnalyzerParams** (*nlohmann::json*) -

                        アナライザーパラメーターを取得します。

                    - **MultiAnalyzerParams** (*nlohmann::json*) -

                        マルチアナライザーパラメーターを取得します。

                    - **IsNullable** (*bool*) -

                        フィールド値が null 許容かどうかのフラグを取得します。null 許容フィールドは、挿入時に値が省略された場合または明示的に NULL の場合に NULL を格納します。主キーおよびパーティションキーフィールドは null 許容にできません。NULL を含むベクトルフィールドは、IS NULL 式でフィルタリングできません。

                    - **DefaultValue** (*const nlohmann::json&*) -

                        このフィールドのデフォルト値を取得します。

                    - **ExternalField** (*const std::string&*) -

                        外部フィールドのマッピング名を取得します。

            - **AnnsFieldNames** (*std::unordered_set&lt;std::string&gt;*) -

                Anns フィールド名を返します。

            - **PrimaryFieldName** (*std::string*) -

                主キーフィールド名を返します。

            - **Functions** (*const std::ベクトル&lt;FunctionPtr&gt;&*) -

                関数の配列を取得します。

                - **Name** (*const std::string&*) -

                    この関数の名前です。空にはできません。

                - **Description** (*const std::string&*) -

                    この関数の説明です。空でもかまいません。

                - **GetFunctionType** (*FunctionType*) -

                    関数の型です。

                - **InputFieldNames** (*const std::ベクトル&lt;std::string&gt;&*) -

                    入力フィールド名を取得します。

                - **OutputFieldNames** (*const std::ベクトル&lt;std::string&gt;&*) -

                    出力フィールド名を取得します。

                - **Params** (*const std::unordered_map&lt;std::string, std::string>&*) -

                    追加のパラメーターを取得します。

            - **ExternalSource** (*const std::string&*) -

                外部コレクションのソースパスを取得します。

            - **ExternalSpec** (*const nlohmann::json&*) -

                外部コレクションの仕様 JSON を取得します。

        - **ID** (*int64_t*) -

            コレクション ID です。

        - **Alias** (*const std::ベクトル&lt;std::string&gt;&*) -

            コレクションのエイリアスです。

        - **CreatedTime** (*uint64_t*) -

            コレクションが作成されたときのタイムスタンプです。

        - **UpdateTime** (*uint64_t*) -

            コレクションが更新されたときのタイムスタンプです。

        - **Properties** (*const std::unordered_map&lt;std::string, std::string>&*) -

            コレクションのプロパティです。

        - **ExternalSource** (*const std::string&*) -

            コレクションの外部データソースを取得します。

        - **ExternalSpec** (*const nlohmann::json&*) -

            コレクションの外部ファイル仕様を取得します。

        - **GetConsistencyLevel** ([ConsistencyLevel](./Collections-ConsistencyLevel)) -

            コレクションの整合性レベルです。

        - **NumPartitions** (*int64_t*) -

            コレクションのパーティション数です。パーティションキーを指定してコレクションを作成した場合にのみ有効です。

**エラーハンドリング:**

- **std::exception**

    リクエストの構築、転送、または応答の処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続済みの MilvusClientV2 で BatchDescribeCollections() を呼び出し、複数のコレクションの完全な説明情報を名前で 1 回のリクエストで取得します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::BatchDescribeCollectionsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionNames(std::move(collection_names))
    .AddCollectionName(collection_name);
milvus::BatchDescribeCollectionsResponse response;
status = client->BatchDescribeCollections(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto descs = response.Descs();
std::cout << "Described " << descs.size() << " collections" << std::endl;
```
