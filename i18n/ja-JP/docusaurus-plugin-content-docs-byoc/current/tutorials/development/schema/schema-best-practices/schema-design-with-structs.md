---
title: "Array of Structs を用いたデータモデル設計 | BYOC"
slug: /schema-design-with-structs
sidebar_label: "Structs を用いたデータモデル"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "現代の AI アプリケーション、特に Internet of Things (IoT) や自動運転では、通常、豊富で構造化されたイベントを扱います。たとえば、タイムスタンプと vector embedding を持つセンサー読み取り、エラーコードと音声スニペットを持つ診断ログ、位置情報、速度、シーンコンテキストを持つ走行区間などです。これらには、データベースがネストされたデータの取り込みと検索をネイティブにサポートすることが求められます。 | BYOC"
type: origin
token: VOkIwd5adiziGQkoDO1cRoRFnre
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Array of Structs を用いたデータモデル設計

現代の AI アプリケーション、特に Internet of Things (IoT) や自動運転では、通常、豊富で構造化されたイベントを扱います。たとえば、タイムスタンプと vector embedding を持つセンサー読み取り、エラーコードと音声スニペットを持つ診断ログ、位置情報、速度、シーンコンテキストを持つ走行区間などです。これらには、データベースがネストされたデータの取り込みと検索をネイティブにサポートすることが求められます。 

Zilliz Cloud では、ユーザーに原子的な構造イベントをフラットなデータモデルへ変換させる代わりに、Array of Structs を導入しています。これにより、配列内の各 Struct が scalar と vector を保持でき、意味的整合性を維持できます。

## なぜ Array of Structs なのか\{#why-array-of-structs}

自動運転からマルチモーダル検索まで、現代の AI アプリケーションはますますネストされた異種データに依存するようになっています。従来のフラットなデータモデルでは、"**1 つのドキュメントに多数のアノテーション付きチャンクがある**" や "**1 つの走行シーンに複数の観測された操作がある**" といった複雑な関係を表現するのが困難です。ここで Zilliz Cloud の Array of Structs データ型が力を発揮します。

Array of Structs を使うと、構造化された要素の順序付き集合を保存できます。各 Struct は、それぞれ独自の scalar フィールドと vector embedding の組み合わせを含みます。これにより、次のような用途に最適です。

- **階層データ**: 多数の子レコードを持つ親エンティティ。たとえば、多数のテキストチャンクを持つ書籍や、多数のアノテーション付きフレームを持つ動画など。

- **マルチモーダル embedding**: 各 Struct は、メタデータとともに、テキスト embedding と画像 embedding など複数の vector を保持できます。

- **時系列または逐次データ**: Array フィールド内の Struct は、時系列データやステップごとのイベントを自然に表現します。

JSON blob を保存したり、データを複数の collection に分割したりする従来の回避策とは異なり、Array of Structs は Zilliz Cloud 内でネイティブなスキーマ強制、vector index、効率的な保存を提供します。

## スキーマ設計ガイドライン\{#schema-design-guidelines}

[検索のためのデータモデル設計](./schema-design-hands-on) で説明したすべてのガイドラインに加えて、データモデル設計で Array of Structs を使い始める前に、以下の点も考慮する必要があります。

### Struct スキーマを定義する\{#define-the-struct-schema}

collection に Array フィールドを追加する前に、内部の Struct スキーマを定義します。struct 内の各フィールドには、scalar（**VARCHAR**、**INT**、**BOOLEAN** など）または vector（**FLOAT_VECTOR**）の明示的な型指定が必要です。

Struct スキーマは、検索や表示に使用するフィールドのみを含めるようにし、できるだけ簡潔に保つことを推奨します。使用しないメタデータで肥大化させないでください。

### max capacity を慎重に設定する\{#set-the-max-capacity-thoughtfully}

各 Array フィールドには、エンティティごとにその Array フィールドが保持できる要素数の上限を指定する属性があります。これは、ユースケースの上限に基づいて設定してください。たとえば、1 ドキュメントあたり 1,000 個のテキストチャンク、または 1 つの走行シーンあたり 100 回の操作などです。 

値を過剰に高く設定するとメモリを浪費します。また、Array フィールド内の Struct の最大数を決定するには、いくつか計算を行う必要があります。

### Struct 内の vector フィールドに index を作成する\{#index-vector-fields-in-structs}

index 作成は vector フィールドに対して必須です。これには、collection 内の vector フィールドと Struct 内に定義された vector フィールドの両方が含まれます。Struct 内の vector フィールドについては、index type として `AUTOINDEX` を使用し、metric type として `MAX_SIM` シリーズを使用する必要があります。

適用可能な制限の詳細については、[制限事項](./use-array-of-structs) を参照してください。

## 実世界の例: 自動運転向け CoVLA データセットのモデリング\{#a-real-world-example-modeling-the-covla-dataset-for-autonomous-driving}

[Turing Motors](https://tur.ing/posts/s1QUA1uh) が公開し、Winter Conference on Applications of Computer Vision (WACV) 2025 に採択された Comprehensive Vision-Language-Action (CoVLA) データセットは、自動運転における Vision-Language-Action (VLA) モデルの学習と評価のための豊かな基盤を提供します。通常は動画クリップである各データポイントには、生の視覚入力だけでなく、以下を記述する構造化キャプションも含まれます。

- **自車の挙動**（例: “Merge left while yielding to oncoming traffic”）

- 存在する**検出オブジェクト**（例: 先行車、歩行者、信号機）

- シーンのフレームレベルの**caption**

この階層的でマルチモーダルな性質により、これは Array of Structs 機能の理想的な適用先となります。CoVLA データセットの詳細については、[CoVLA Dataset Website](https://turingmotors.github.io/covla-ad/) を参照してください。

### ステップ 1: データセットを collection スキーマにマッピングする\{#step-1-map-the-dataset-into-a-collection-schema}

CoVLA データセットは、大規模なマルチモーダル運転データセットであり、10,000 本の動画クリップ、合計 80 時間を超える映像で構成されています。20Hz のレートでフレームをサンプリングし、各フレームに対して詳細な自然言語キャプションと車両状態および検出オブジェクトの座標情報をアノテーションしています。

データセット構造は次のとおりです。

```python
├── video_1                                       (VIDEO) # video.mp4
│   ├── video_id                                  (INT)
│   ├── video_url                                 (STRING)
│   ├── frames                                    (ARRAY)
│   │   ├── frame_1                               (STRUCT)
│   │   │   ├── caption                           (STRUCT) # captions.jsonl
│   │   │   │   ├── plain_caption                 (STRING)
│   │   │   │   ├── rich_caption                  (STRING)
│   │   │   │   ├── risk                          (STRING)
│   │   │   │   ├── risk_correct                  (BOOL)
│   │   │   │   ├── risk_yes_rate                 (FLOAT)
│   │   │   │   ├── weather                       (STRING)
│   │   │   │   ├── weather_rate                  (FLOAT)
│   │   │   │   ├── road                          (STRING)
│   │   │   │   ├── road_rate                     (FLOAT)
│   │   │   │   ├── is_tunnel                     (BOOL)
│   │   │   │   ├── is_tunnel_yes_rate            (FLOAT)
│   │   │   │   ├── is_highway                    (BOOL)
│   │   │   │   ├── is_highway_yes_rate           (FLOAT)
│   │   │   │   ├── has_pedestrain                (BOOL)
│   │   │   │   ├── has_pedestrain_yes_rate       (FLOAT)
│   │   │   │   ├── has_carrier_car               (BOOL)
│   │   │   ├── traffic_light                     (STRUCT) # traffic_lights.jsonl
│   │   │   │   ├── index                         (INT)
│   │   │   │   ├── class                         (STRING)
│   │   │   │   ├── bbox                          (LIST<FLOAT>)
│   │   │   ├── front_car                         (STRUCT) # front_cars.jsonl
│   │   │   │   ├── has_lead                      (BOOL)
│   │   │   │   ├── lead_prob                     (FLOAT)
│   │   │   │   ├── lead_x                        (FLOAT)
│   │   │   │   ├── lead_y                        (FLOAT)
│   │   │   │   ├── lead_speed_kmh                (FLOAT)
│   │   │   │   ├── lead_a                        (FLOAT)
│   │   ├── frame_2                               (STRUCT)
│   │   ├── ...                                   (STRUCT)
│   │   ├── frame_n                               (STRUCT)
├── video_2
├── ...
├── video_n
```

CoVLA データセットの構造は非常に階層的であり、収集されたデータが複数の `.jsonl` ファイルに分割され、`.mp4` 形式の動画クリップとともに管理されていることがわかります。

Zilliz Cloud では、collection スキーマ内にネスト構造を作成するために JSON フィールドまたは Array-of-Structs フィールドのいずれかを使用できます。ネスト形式の一部として vector embedding を含む場合は、Array-of-Structs フィールドのみがサポートされます。ただし、Array 内の Struct 自体にはさらにネストした構造を含めることはできません。CoVLA データセットを重要な関係性を保ったまま保存するには、不要な階層を取り除き、Zilliz Cloud の collection スキーマに適合するようデータをフラット化する必要があります。

以下の図は、このデータセットを後続のスキーマで示す schema を使ってどのようにモデリングできるかを示しています。

![PATjwyoKzhPELnb14kBcnAEAnGv](https://zdoc-images.s3.us-west-2.amazonaws.com/PATjwyoKzhPELnb14kBcnAEAnGv.png)

上図は、以下のフィールドで構成される動画クリップの構造を示しています。

- `video_id` は主キーとして機能し、INT64 型の整数を受け取ります。

- `states` は、現在の動画の各フレームにおける自車の状態を含む生の JSON body です。

- `captions` は Array of Structs であり、各 Struct は以下のフィールドを持ちます。

    - `frame_id` は、現在の動画内の特定のフレームを識別します。

    - `plain_caption` は、天候、道路状況などの周辺環境を含まない現在のフレームの説明であり、`plain_cap_vector` はその対応する vector embedding です。

    - `rich_caption` は、周辺環境を含む現在のフレームの説明であり、`rich_cap_vector` はその対応する vector embedding です。

    - `risk` は、現在のフレームで自車が直面しているリスクの説明であり、`risk_vector` はその対応する vector embedding です。

    - その他のすべてのフレーム属性。たとえば `road`、`weather`、`is_tunnel`、`has_pedestrain` など。

- `traffic_lights` は、現在のフレームで識別されたすべての信号機を含む JSON body です。

- `front_cars` も Array of Structs であり、現在のフレームで識別されたすべての先行車を含みます。

### ステップ 2: スキーマを初期化する\{#step-2-initialize-the-schemas}

まず、caption Struct、front_cars Struct、および collection のスキーマを初期化する必要があります。

- Caption Struct のスキーマを初期化します。

    ```python
    client = MilvusClient("YOUR_CLUSTER_ENDPOINT")
    
    # create the schema for the caption struct
    schema_for_caption = client.create_struct_field_schema()
    
    schema_for_caption.add_field(
        field_name="frame_id",
        datatype=DataType.INT64,
        description="ID of the frame to which the ego vehicle's behavior belongs"
    )
    
    schema_for_caption.add_field(
        field_name="plain_caption",
        datatype=DataType.VARCHAR,
        max_length=1024,
        description="plain description of the ego vehicle's behaviors"
    )
    
    schema_for_caption.add_field(
        field_name="plain_cap_vector",
        datatype=DataType.FLOAT_VECTOR,
        dim=768,
        description="vectors for the plain description of the ego vehicle's behaviors"
    )
    
    schema_for_caption.add_field(
        field_name="rich_caption",
        datatype=DataType.VARCHAR,
        max_length=1024,
        description="rich description of the ego vehicle's behaviors"
    )
    
    schema_for_caption.add_field(
        field_name="rich_cap_vector",
        datatype=DataType.FLOAT_VECTOR,
        dim=768,
        description="vectors for the rich description of the ego vehicle's behaviors"
    )
    
    schema_for_caption.add_field(
        field_name="risk",
        datatype=DataType.VARCHAR,
        max_length=1024,
        description="description of the ego vehicle's risks"
    )
    
    schema_for_caption.add_field(
        field_name="risk_vector",
        datatype=DataType.FLOAT_VECTOR,
        dim=768,
        description="vectors for the description of the ego vehicle's risks"
    )
    
    schema_for_caption.add_field(
        field_name="risk_correct",
        datatype=DataType.BOOL,
        description="whether the risk assessment is correct"
    )
    
    schema_for_caption.add_field(
        field_name="risk_yes_rate",
        datatype=DataType.FLOAT,
        description="probability/confidence of risk being present"
    )
    
    schema_for_caption.add_field(
        field_name="weather",
        datatype=DataType.VARCHAR,
        max_length=50,
        description="weather condition"
    )
    
    schema_for_caption.add_field(
        field_name="weather_rate",
        datatype=DataType.FLOAT,
        description="probability/confidence of the weather condition"
    )
    
    schema_for_caption.add_field(
        field_name="road",
        datatype=DataType.VARCHAR,
        max_length=50,
        description="road type"
    )
    
    schema_for_caption.add_field(
        field_name="road_rate",
        datatype=DataType.FLOAT,
        description="probability/confidence of the road type"
    )
    
    schema_for_caption.add_field(
        field_name="is_tunnel",
        datatype=DataType.BOOL,
        description="whether the road is a tunnel"
    )
    
    schema_for_caption.add_field(
        field_name="is_tunnel_yes_rate",
        datatype=DataType.FLOAT,
        description="probability/confidence of the road being a tunnel"
    )
    
    schema_for_caption.add_field(
        field_name="is_highway",
        datatype=DataType.BOOL,
        description="whether the road is a highway"
    )
    
    schema_for_caption.add_field(
        field_name="is_highway_yes_rate",
        datatype=DataType.FLOAT,
        description="probability/confidence of the road being a highway"
    )
    
    schema_for_caption.add_field(
        field_name="has_pedestrian",
        datatype=DataType.BOOL,
        description="whether there is a pedestrian present"
    )
    
    schema_for_caption.add_field(
        field_name="has_pedestrian_yes_rate",
        datatype=DataType.FLOAT,
        description="probability/confidence of pedestrian presence"
    )
    
    schema_for_caption.add_field(
        field_name="has_carrier_car",
        datatype=DataType.BOOL,
        description="whether there is a carrier car present"
    )
    ```

- Front Car Struct のスキーマを初期化します

    <Admonition type="info" icon="📘" title="注意">

    front car には vector embedding は含まれませんが、データサイズが JSON フィールドの最大値を超えるため、やはり array of Struct として含める必要があります。

    </Admonition>

    ```python
    schema_for_front_car = client.create_struct_field_schema()
    
    schema_for_front_car.add_field(
        field_name="frame_id",
        datatype=DataType.INT64,
        description="ID of the frame to which the ego vehicle's behavior belongs"
    )
    
    schema_for_front_car.add_field(
        field_name="has_lead",
        datatype=DataType.BOOL,
        description="whether there is a leading vehicle"
    )
    
    schema_for_front_car.add_field(
        field_name="lead_prob",
        datatype=DataType.FLOAT,
        description="probability/confidence of the leading vehicle's presence"
    )
    
    schema_for_front_car.add_field(
        field_name="lead_x",
        datatype=DataType.FLOAT,
        description="x position of the leading vehicle relative to the ego vehicle"
    )
    
    schema_for_front_car.add_field(
        field_name="lead_y",
        datatype=DataType.FLOAT,
        description="y position of the leading vehicle relative to the ego vehicle"
    )
    
    schema_for_front_car.add_field(
        field_name="lead_speed_kmh",
        datatype=DataType.FLOAT,
        description="speed of the leading vehicle in km/h"
    )
    
    schema_for_front_car.add_field(
        field_name="lead_a",
        datatype=DataType.FLOAT,
        description="acceleration of the leading vehicle"
    )
    ```

- collection のスキーマを初期化します

    ```python
    schema = client.create_schema()
    
    schema.add_field(
        field_name="video_id",
        datatype=DataType.VARCHAR,
        description="primary key",
        max_length=16,
        is_primary=True,
        auto_id=False
    )
    
    schema.add_field(
        field_name="video_url",
        datatype=DataType.VARCHAR,
        max_length=512,
        description="URL of the video"
    )
    
    schema.add_field(
        field_name="captions",
        datatype=DataType.ARRAY,
        element_type=DataType.STRUCT,
        struct_schema=schema_for_caption,
        max_capacity=600,
        description="captions for the current video"
    )
    
    schema.add_field(
        field_name="traffic_lights",
        datatype=DataType.JSON,
        description="frame-specific traffic lights identified in the current video"
    )
    
    schema.add_field(
        field_name="front_cars",
        datatype=DataType.ARRAY,
        element_type=DataType.STRUCT,
        struct_schema=schema_for_front_car,
        max_capacity=600,
        description="frame-specific leading cars identified in the current video"
    )
    ```

### ステップ 3: index パラメータを設定する\{#step-3-set-index-parameters}

すべての vector フィールドには index を作成する必要があります。要素 Struct 内の vector フィールドに index を作成するには、index type として `AUTOINDEX` を使用し、embedding リスト間の類似度を測定するために `MAX_SIM` シリーズの metric type を使用する必要があります。

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="captions[plain_cap_vector]", 
    index_type="AUTOINDEX", 
    metric_type="MAX_SIM_COSINE", 
    index_name="captions_plain_cap_vector_idx", # mandatory for now
    index_params={"M": 16, "efConstruction": 200}
)

index_params.add_index(
    field_name="captions[rich_cap_vector]", 
    index_type="AUTOINDEX", 
    metric_type="MAX_SIM_COSINE", 
    index_name="captions_rich_cap_vector_idx", # mandatory for now
    index_params={"M": 16, "efConstruction": 200}
)

index_params.add_index(
    field_name="captions[risk_vector]", 
    index_type="AUTOINDEX", 
    metric_type="MAX_SIM_COSINE", 
    index_name="captions_risk_vector_idx", # mandatory for now
    index_params={"M": 16, "efConstruction": 200}
)
```

JSON フィールド内のフィルタリングを高速化するために、JSON shredding を有効にすることを推奨します。

### ステップ 4: collection を作成する\{#step-4-create-a-collection}

スキーマと index の準備ができたら、次のように対象の collection を作成できます。

```python
client.create_collection(
    collection_name="covla_dataset",
    schema=schema,
    index_params=index_params
)
```

### ステップ 5: データを挿入する\{#step-5-insert-the-data}

Turing Motos は、CoVLA データセットを、生の動画クリップ（`.mp4`）、states（`states.jsonl`）、captions（`captions.jsonl`）、traffic lights（`traffic_lights.jsonl`）、front cars（`front_cars.jsonl`）を含む複数のファイルに分けて管理しています。

これらのファイルから各動画クリップに対応するデータ片をマージし、データを挿入する必要があります。以下は、特定の動画クリップについてデータ片をマージするスクリプトです。

```python
import json
from openai import OpenAI

openai_client = OpenAI(
    api_key='YOUR_OPENAI_API_KEY',
)

video_id = "0a0fc7a5db365174" # represent a single video with 600 frames

# get all front car records in the specified video clip
entries = []
front_cars = []
with open('data/front_car/{}.jsonl'.format(video_id), 'r') as f:
    for line in f:
        entries.append(json.loads(line))

for entry in entries:
    for key, value in entry.items():
        value['frame_id'] = int(key)
        front_cars.append(value)

# get all traffic lights identified in the specified video clip
entries = []
traffic_lights = []
frame_id = 0
with open('data/traffic_lights/{}.jsonl'.format(video_id), 'r') as f:
    for line in f:
        entries.append(json.loads(line))

for entry in entries:
    for key, value in entry.items():
        if not value or (value['index'] == 1 and key != '0'):
            frame_id+=1

        if value:
            value['frame_id'] = frame_id
            traffic_lights.append(value)
        else:
            value_dict = {}
            value_dict['frame_id'] = frame_id
            traffic_lights.append(value_dict)

# get all captions generated in the video clip and convert them into vector embeddings
entries = []
captions = []
with open('data/captions/{}.jsonl'.format(video_id), 'r') as f:
    for line in f:
        entries.append(json.loads(line))

def get_embedding(text, model="embeddinggemma:latest"):
    response = openai_client.embeddings.create(input=text, model=model)
    return response.data[0].embedding

# Add embeddings to each entry
for entry in entries:
    # Each entry is a dict with a single key (e.g., '0', '1', ...)
    for key, value in entry.items():
        value['frame_id'] = int(key)  # Convert key to integer and assign to frame_id

        if "plain_caption" in value and value["plain_caption"]:
            value["plain_cap_vector"] = get_embedding(value["plain_caption"])
        if "rich_caption" in value and value["rich_caption"]:
            value["rich_cap_vector"] = get_embedding(value["rich_caption"])
        if "risk" in value and value["risk"]:
            value["risk_vector"] = get_embedding(value["risk"])

        captions.append(value)

data = {
    "video_id": video_id,
    "video_url": "https://your-storage.com/{}".format(video_id),
    "captions": captions,
    "traffic_lights": traffic_lights,
    "front_cars": front_cars
}
```

このようにデータを処理した後、次のように挿入できます。

```python
client.insert(
    collection_name="covla_dataset",
    data=[data]
)

# {'insert_count': 1, 'ids': ['0a0fc7a5db365174'], 'cost': 0}
```

