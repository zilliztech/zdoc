---
title: "Struct の配列を使ったデータモデル設計 | Cloud"
slug: /schema-design-with-structs
sidebar_label: "Struct を使ったデータモデル"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "現代の AI アプリケーション、特に Internet of Things (IoT) や自動運転では、通常、豊富で構造化されたイベントを扱います。たとえば、タイムスタンプと vector embedding を持つセンサー読み取り値、エラーコードと音声スニペットを持つ診断ログ、位置情報・速度・シーンコンテキストを持つ走行区間などです。これらには、データベースがネストされたデータの取り込みと検索をネイティブにサポートすることが求められます。 | Cloud"
type: origin
token: VOkIwd5adiziGQkoDO1cRoRFnre
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Struct の配列を使ったデータモデル設計

現代の AI アプリケーション、特に Internet of Things (IoT) や自動運転では、通常、豊富で構造化されたイベントを扱います。たとえば、タイムスタンプと vector embedding を持つセンサー読み取り値、エラーコードと音声スニペットを持つ診断ログ、位置情報・速度・シーンコンテキストを持つ走行区間などです。これらには、データベースがネストされたデータの取り込みと検索をネイティブにサポートすることが求められます。 

ユーザーに原子的な構造イベントをフラットなデータモデルへ変換させる代わりに、Zilliz Cloud では Array of Structs を導入しています。この形式では、配列内の各 Struct が scalar と vector を保持でき、意味的な整合性を維持できます。

## なぜ Array of Structs なのか\{#why-array-of-structs}

自動運転からマルチモーダル検索まで、現代の AI アプリケーションはますますネストされた異種データに依存しています。従来のフラットなデータモデルでは、「**1 つのドキュメントに多数のアノテーション付きチャンクがある**」や「**1 つの運転シーンに複数の観測された操作がある**」のような複雑な関係を表現するのが困難です。そこで Zilliz Cloud の Array of Structs データ型が力を発揮します。

Array of Structs を使うと、順序付けられた構造化要素の集合を保存できます。各 Struct には、それぞれ独自の scalar フィールドと vector embedding の組み合わせを含められます。これにより、次のような用途に最適です。

- **階層データ**: 複数の子レコードを持つ親エンティティ。たとえば、多数のテキストチャンクを持つ書籍や、多数のアノテーション付きフレームを持つ動画など。

- **マルチモーダル embedding**: 各 Struct は、メタデータとともに、テキスト embedding と画像 embedding など複数の vector を保持できます。

- **時系列または逐次データ**: Array フィールド内の Struct は、時系列データやステップごとのイベントを自然に表現します。

JSON blob を保存したり、データを複数の collection に分割したりする従来の回避策とは異なり、Array of Structs は Zilliz Cloud 内でネイティブな schema の強制、vector index、効率的なストレージを提供します。

## schema 設計ガイドライン\{#schema-design-guidelines}

[検索のためのデータモデル設計](./schema-design-hands-on) で説明したすべてのガイドラインに加えて、データモデル設計で Array of Structs を使い始める前に、次の点も考慮する必要があります。

### Struct schema を定義する\{#define-the-struct-schema}

collection に Array フィールドを追加する前に、内部の Struct schema を定義してください。struct 内の各フィールドは、scalar（**VARCHAR**、**INT**、**BOOLEAN** など）または vector（**FLOAT_VECTOR**）として明示的に型指定する必要があります。

Struct schema は、取得または表示に使用するフィールドだけを含めて、できるだけ簡潔に保つことをお勧めします。使わないメタデータで肥大化させないでください。

### 最大容量を慎重に設定する\{#set-the-max-capacity-thoughtfully}

各 Array フィールドには、エンティティごとにその Array フィールドが保持できる最大要素数を指定する属性があります。これはユースケースの上限に基づいて設定してください。たとえば、1 ドキュメントあたり 1,000 個のテキストチャンク、または 1 つの運転シーンあたり 100 個の操作などです。 

過度に高い値はメモリを無駄にするため、Array フィールド内の Struct の最大数を決定するために、ある程度の計算が必要になります。

### Struct 内の vector フィールドに index を作成する\{#index-vector-fields-in-structs}

index 作成は vector フィールドに必須であり、collection 内の vector フィールドと Struct 内で定義されたものの両方が対象です。Struct 内の vector フィールドについては、index type に `AUTOINDEX`、metric type に `MAX_SIM` シリーズを使用してください。

適用可能なすべての制限の詳細については、[制限事項](./use-array-of-structs) を参照してください。

## 実例: 自動運転向け CoVLA データセットのモデリング\{#a-real-world-example-modeling-the-covla-dataset-for-autonomous-driving}

[Turing Motors](https://tur.ing/posts/s1QUA1uh) によって導入され、Winter Conference on Applications of Computer Vision (WACV) 2025 に採択された Comprehensive Vision-Language-Action (CoVLA) データセットは、自動運転における Vision-Language-Action (VLA) モデルの学習と評価のための豊かな基盤を提供します。各データポイント（通常は動画クリップ）には、生の視覚入力だけでなく、以下を記述する構造化キャプションも含まれます。

- **自車両の挙動**（例: “Merge left while yielding to oncoming traffic”）

- **検出された物体**（例: 前方車両、歩行者、信号機）、および

- シーンのフレーム単位の **caption**

この階層的でマルチモーダルな性質により、このデータセットは Array of Structs 機能の理想的な候補となります。CoVLA データセットの詳細については、[CoVLA Dataset Website](https://turingmotors.github.io/covla-ad/) を参照してください。

### ステップ 1: データセットを collection schema にマッピングする\{#step-1-map-the-dataset-into-a-collection-schema}

CoVLA データセットは、10,000 本の動画クリップから構成される大規模なマルチモーダル運転データセットで、総計 80 時間を超える映像を含みます。フレームは 20Hz でサンプリングされ、各フレームには詳細な自然言語キャプションに加え、車両状態や検出された物体の座標情報が付与されています。

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

CoVLA データセットの構造は非常に階層的であり、収集されたデータが複数の `.jsonl` ファイルに分割され、さらに `.mp4` 形式の動画クリップが付随していることがわかります。

Zilliz Cloud では、collection schema 内にネスト構造を作成するために、JSON フィールドまたは Array-of-Structs フィールドのいずれかを使用できます。ネスト形式に vector embedding が含まれる場合は、Array-of-Structs フィールドのみがサポートされます。ただし、Array 内の Struct 自体には、さらにネストされた構造を含めることはできません。CoVLA データセットを重要な関係性を保持したまま保存するには、不要な階層を取り除き、Zilliz Cloud の collection schema に収まるようにデータをフラット化する必要があります。

以下の図は、後続の schema で示される構成を使って、このデータセットをどのようにモデリングできるかを示しています。

![PATjwyoKzhPELnb14kBcnAEAnGv](https://zdoc-images.s3.us-west-2.amazonaws.com/PATjwyoKzhPELnb14kBcnAEAnGv.png)

上の図は動画クリップの構造を示しており、次のフィールドで構成されています。

- `video_id` は主キーとして機能し、INT64 型の整数を受け取ります。

- `states` は、現在の動画の各フレームにおける自車両の状態を含む生の JSON body です。

- `captions` は Array of Structs であり、各 Struct は次のフィールドを持ちます。

    - `frame_id` は、現在の動画内の特定のフレームを識別します。

    - `plain_caption` は、天候、路面状況などの周辺環境を含まない現在のフレームの説明であり、`plain_cap_vector` はそれに対応する vector embeddings です。

    - `rich_caption` は、周辺環境を含む現在のフレームの説明であり、`rich_cap_vector` はそれに対応する vector embeddings です。

    - `risk` は、現在のフレームで自車両が直面するリスクの説明であり、`risk_vector` はそれに対応する vector embeddings です。

    - さらに、`road`、`weather`、`is_tunnel`、`has_pedestrain` など、フレームのその他すべての属性があります。

- `traffic_lights` は、現在のフレームで識別されたすべての信号機シグナルを含む JSON body です。

- `front_cars` も Array of Structs であり、現在のフレームで識別されたすべての前方車両を含みます。

### ステップ 2: schema を初期化する\{#step-2-initialize-the-schemas}

まず、caption Struct、front_cars Struct、および collection の schema を初期化する必要があります。

- Caption Struct の schema を初期化します。

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

- Front Car Struct の schema を初期化します

    <Admonition type="info" icon="📘" title="注意">

    front car には vector embeddings は含まれませんが、データサイズが JSON フィールドの最大値を超えるため、引き続き Struct の配列として含める必要があります。

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

- collection の schema を初期化します

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

すべての vector フィールドには index を作成する必要があります。要素 Struct 内の vector フィールドに index を作成するには、index type として `AUTOINDEX` を使用し、embedding リスト間の類似性を測定する metric type として `MAX_SIM` シリーズを使用する必要があります。

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

これらのフィールド内でのフィルタリングを高速化するために、JSON フィールドに対して JSON shredding を有効にすることをお勧めします。

### ステップ 4: collection を作成する\{#step-4-create-a-collection}

schema と index の準備ができたら、次のように対象の collection を作成できます。

```python
client.create_collection(
    collection_name="covla_dataset",
    schema=schema,
    index_params=index_params
)
```

### ステップ 5: データを挿入する\{#step-5-insert-the-data}

Turing Motos は、CoVLA データセットを複数のファイルに整理しています。これには、生の動画クリップ（`.mp4`）、states（`states.jsonl`）、captions（`captions.jsonl`）、traffic lights（`traffic_lights.jsonl`）、front cars（`front_cars.jsonl`）が含まれます。

これらのファイルから、各動画クリップに対応するデータ片をマージしてデータを挿入する必要があります。以下は、特定の動画クリップに対してデータ片をマージするスクリプトです。

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

このようにデータを処理したら、次のように挿入できます。

```python
client.insert(
    collection_name="covla_dataset",
    data=[data]
)

# {'insert_count': 1, 'ids': ['0a0fc7a5db365174'], 'cost': 0}
```

