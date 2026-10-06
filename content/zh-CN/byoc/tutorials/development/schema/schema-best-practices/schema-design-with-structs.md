---
title: "使用 Struct Array 进行 Schema 设计 | BYOC"
slug: /schema-design-with-structs
sidebar_label: "使用 Struct Array 进行 Schema 设计"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "现代 AI 应用，尤其是在物联网（IoT）和自动驾驶领域，通常会对丰富的结构化事件进行推理：带有时间戳和向量嵌入的传感器读数、带有错误代码和音频片段的诊断日志，或带有位置、速度和场景上下文的行程片段。这些应用要求数据库原生支持嵌套数据的存储和搜索。 | BYOC"
type: origin
token: QvlTw4C2xiMaMMkrJeVcAq4hnae
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 使用 Struct Array 进行 Schema 设计

现代 AI 应用，尤其是在物联网（IoT）和自动驾驶领域，通常会对丰富的结构化事件进行推理：带有时间戳和向量嵌入的传感器读数、带有错误代码和音频片段的诊断日志，或带有位置、速度和场景上下文的行程片段。这些应用要求数据库原生支持嵌套数据的存储和搜索。

Zilliz Cloud没有要求用户将其原子结构事件转换为扁平数据模型，而是引入了 Struct Array，其中 Array 中的每个 Struct 都可以包含标量和向量，从而保留语义完整性。

## 为何需要 Struct Array\{#why-array-of-structs}

现代 AI 应用，从自动驾驶到多模态检索，越来越依赖嵌套的异构数据。传统的扁平数据模型难以表示“**一个文档包含多个注释块**”或“**一个驾驶场景包含多个观察到的操作**”等复杂关系。而 Zilliz Cloud 中的 Struct Array 数据类型填补了这方面的空白。

Struct Array 字段允许您将一组有序的 Structs 存入其中，每个 Struct 带有自己的标量和向量数据。这就让其尤其适用于存储如下类型的数据：

- **多层嵌套数据**：具有多个子记录的父实体，例如包含许多文本块的书籍，或包含许多带注释帧的视频。

- **多模态向量嵌入**：每个 Struct 可以容纳多个向量，例如文本嵌入加上图像嵌入，以及元数据。

- **时序或顺序数据**：Array 字段中的 Struct 天然地可用于表示时间序列或逐步事件。

与存储 JSON 数据块或跨多个 Collection 拆分数据的传统解决方法不同，Struct Array 在 Zilliz Cloud 中提供原生模式强制、向量索引和高效存储。

## Schema 设计指南\{#schema-design-guidelines}

除了那些在 [Schema 设计指南](./schema-design-hands-on)中提及的设计原则之外，您在数据模型设计时引入 Struct Array 之前还需要考虑如下因素：

### 定义 Struct Schema\{#define-the-struct-schema}

在向您的 Collection 中添加 Array 类型的字段前，您需要定义内部 Struct 的 Schema。这包括明确定义其中每个字段的数据类型，如标量（**VARCHAR**、**INT**、**BOOLEAN** 等）和向量（**FLOAT_VECTOR**）。

建议您仅包含用于检索或显示的字段，以保持 Struct Schema 的简洁。避免因包含未使用的元数据而导致 Schema 臃肿。

### 谨慎设置 Max Capacity\{#set-the-max-capacity-thoughtfully}

每个 Array 字段都有一个属性，用于指定了每个 Struct Array 字段所能容纳的最大元素数量。请根据实际情况的上限来设置此属性。例如，每个文档有 1000个 文本块，或每个驾驶场景有 100 个操作。

过高的值会浪费内存，你需要进行一些计算来确定 Array 字段中 Struct 的最大数量。

### 为 Struct 中的向量字段创建索引\{#index-vector-fields-in-structs}

索引对于向量字段是必需的，包括集合中的向量字段和在结构体中定义的向量字段。对于结构体中的向量字段，您应该使用 `AUTOINDEX` 作为索引类型，使用 `MAX_SIM` 系列相似度类型作为度量类型。

## 一个现实世界的例子：为自动驾驶数据集 CoVLA 建模\{#a-real-world-example-modeling-the-covla-dataset-for-autonomous-driving}

由 [Turing Motors](https://tur.ing/posts/s1QUA1uh) 推出并被 2025 年冬季计算机视觉应用会议（WACV）接受的综合视觉-语言-行动（CoVLA）数据集，为在自动驾驶中训练和评估视觉-语言-行动（VLA）模型提供了丰富的基础。每个数据点（通常是一个视频片段）不仅包含原始视觉输入，还包含如下的结构化的说明信息：

- **自车行为**（如：“为避开对向来车向左并道”）

- **对象探测**（如：前车、人行道、交通信号灯等），以及

- **逐帧详情描述**

该数据级多层级、多模态的自然属性，使其非常适合 Struct Array 的设计初衷。关于 CoVLA 数据集的更多信息，可以参考 [CoVLA 数据集官网](https://turingmotors.github.io/covla-ad/)。

### 步骤 1：将数据级映射到 Collection Schema\{#step-1-map-the-dataset-into-a-collection-schema}

CoVLA 数据集是一个大规模、多模态的驾驶数据集，包含 10000 个视频片段，总时长超过 80 小时。它以 20Hz 的帧率采样，并为每一帧标注详细的自然语言描述，以及车辆状态信息和检测到的物体的坐标。

该数据集的数据结构如下：

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

您会发现 CoVLA 数据集的结构非常复杂，层级较多。收集到的数据分成了多个 `.jsonl` 文件与原始视频片段（`.mp4`）一起存放在数据集中。

在 Zilliz Cloud 中，您可以使用 JSON 字段或者 Struct Array 字段来处理多层嵌套结构。当内层嵌套结构中包含向量字段时，Struct Array 成为了唯一选择。但是，Struct Array 字段内的 Struct 并不支持 JSON 或 Array 字段。为了将 CoVLA 数据集存入 Collection，您需要移除不必要的嵌套层级。

下图展示了最终的建模结果：

![PATjwyoKzhPELnb14kBcnAEAnGv](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/PATjwyoKzhPELnb14kBcnAEAnGv.png)

在上图中，每个视频片段都包含如下字段：

- `video_id` 作为主键，接受 INT64 类型的整数。

- `states` 是一个原始 JSON 字段，其中包含当前视频每一帧中的自车状态。

- `captions` 是一个 Struct Array，每个 Struct 包含以下字段：

    - `frame_id` 用于标识当前视频中的特定帧。

    - `plain_caption` 是当前帧在不考虑环境因素（如天气、路况等）情况下的描述，而 `plain_cap_vector` 是其对应的向量嵌入。

    - `rich_caption`是对当前帧及其周围环境的描述，而 `rich_cap_vector` 是其对应的向量嵌入。

    - `risk` 是对自车在当前帧中面临的风险的描述，`risk_vector` 是其对应的向量嵌入。

    - 帧的所有其他属性，如道路、天气、是否为隧道、是否有行人等。

- `traffic_lights` 是一个JSON 字段，包含当前帧中识别出的所有交通信号灯信号。

- `front_cars` 是另一个 Struct Array 字段，包含当前帧中识别出的所有前车的信息。

### 步骤 2：初始化 Schema\{#step-2-initialize-the-schemas}

首先，我们需要创建 captions Struct、front_cars Struct、以及 Collection 的 Schema。

- 初始化 captions Struct Schema

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    from pymilvus import MilvusClient, DataType
    
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

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.v2.client.ConnectConfig;
    import io.milvus.v2.client.MilvusClientV2;
    import io.milvus.v2.common.DataType;
    import io.milvus.v2.service.collection.request.CreateCollectionReq;
    import java.util.Arrays;
    
    ConnectConfig connectConfig = ConnectConfig.builder()
            .uri("YOUR_CLUSTER_ENDPOINT")
            .token("YOUR_CLUSTER_TOKEN")
            .build();
    MilvusClientV2 client = new MilvusClientV2(connectConfig);
    
    // create the schema for the caption struct
    CreateCollectionReq.StructFieldSchema schemaForCaption = CreateCollectionReq.StructFieldSchema.builder()
            .name("captions")
            .description("captions for the current video")
            .maxCapacity(600)
            .fields(Arrays.asList(
                    CreateCollectionReq.FieldSchema.builder().name("frame_id").dataType(DataType.Int64)
                            .description("ID of the frame to which the ego vehicle's behavior belongs").build(),
                    CreateCollectionReq.FieldSchema.builder().name("plain_caption").dataType(DataType.VarChar).maxLength(1024)
                            .description("plain description of the ego vehicle's behaviors").build(),
                    CreateCollectionReq.FieldSchema.builder().name("plain_cap_vector").dataType(DataType.FloatVector).dimension(768)
                            .description("vectors for the plain description of the ego vehicle's behaviors").build(),
                    CreateCollectionReq.FieldSchema.builder().name("rich_caption").dataType(DataType.VarChar).maxLength(1024)
                            .description("rich description of the ego vehicle's behaviors").build(),
                    CreateCollectionReq.FieldSchema.builder().name("rich_cap_vector").dataType(DataType.FloatVector).dimension(768)
                            .description("vectors for the rich description of the ego vehicle's behaviors").build(),
                    CreateCollectionReq.FieldSchema.builder().name("risk").dataType(DataType.VarChar).maxLength(1024)
                            .description("description of the ego vehicle's risks").build(),
                    CreateCollectionReq.FieldSchema.builder().name("risk_vector").dataType(DataType.FloatVector).dimension(768)
                            .description("vectors for the description of the ego vehicle's risks").build(),
                    CreateCollectionReq.FieldSchema.builder().name("risk_correct").dataType(DataType.Bool)
                            .description("whether the risk assessment is correct").build(),
                    CreateCollectionReq.FieldSchema.builder().name("risk_yes_rate").dataType(DataType.Float)
                            .description("probability/confidence of risk being present").build(),
                    CreateCollectionReq.FieldSchema.builder().name("weather").dataType(DataType.VarChar).maxLength(50)
                            .description("weather condition").build(),
                    CreateCollectionReq.FieldSchema.builder().name("weather_rate").dataType(DataType.Float)
                            .description("probability/confidence of the weather condition").build(),
                    CreateCollectionReq.FieldSchema.builder().name("road").dataType(DataType.VarChar).maxLength(50)
                            .description("road type").build(),
                    CreateCollectionReq.FieldSchema.builder().name("road_rate").dataType(DataType.Float)
                            .description("probability/confidence of the road type").build(),
                    CreateCollectionReq.FieldSchema.builder().name("is_tunnel").dataType(DataType.Bool)
                            .description("whether the road is a tunnel").build(),
                    CreateCollectionReq.FieldSchema.builder().name("is_tunnel_yes_rate").dataType(DataType.Float)
                            .description("probability/confidence of the road being a tunnel").build(),
                    CreateCollectionReq.FieldSchema.builder().name("is_highway").dataType(DataType.Bool)
                            .description("whether the road is a highway").build(),
                    CreateCollectionReq.FieldSchema.builder().name("is_highway_yes_rate").dataType(DataType.Float)
                            .description("probability/confidence of the road being a highway").build(),
                    CreateCollectionReq.FieldSchema.builder().name("has_pedestrian").dataType(DataType.Bool)
                            .description("whether there is a pedestrian present").build(),
                    CreateCollectionReq.FieldSchema.builder().name("has_pedestrian_yes_rate").dataType(DataType.Float)
                            .description("probability/confidence of pedestrian presence").build(),
                    CreateCollectionReq.FieldSchema.builder().name("has_carrier_car").dataType(DataType.Bool)
                            .description("whether there is a carrier car present").build()
            ))
            .build();
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    import (
        "context"
        "log"
    
        "github.com/milvus-io/milvus/client/v3/entity"
        "github.com/milvus-io/milvus/client/v3/milvusclient"
    )
    
    ctx := context.Background()
    
    cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
        Address: "YOUR_CLUSTER_ENDPOINT",
        APIKey:  "YOUR_CLUSTER_TOKEN",
    })
    if err != nil {
        log.Fatal(err)
    }
    
    // create the schema for the caption struct
    captionSchema := entity.NewStructSchema().
        WithField(entity.NewField().WithName("frame_id").WithDataType(entity.FieldTypeInt64).
            WithDescription("ID of the frame to which the ego vehicle's behavior belongs")).
        WithField(entity.NewField().WithName("plain_caption").WithDataType(entity.FieldTypeVarChar).WithMaxLength(1024).
            WithDescription("plain description of the ego vehicle's behaviors")).
        WithField(entity.NewField().WithName("plain_cap_vector").WithDataType(entity.FieldTypeFloatVector).WithDim(768).
            WithDescription("vectors for the plain description of the ego vehicle's behaviors")).
        WithField(entity.NewField().WithName("rich_caption").WithDataType(entity.FieldTypeVarChar).WithMaxLength(1024).
            WithDescription("rich description of the ego vehicle's behaviors")).
        WithField(entity.NewField().WithName("rich_cap_vector").WithDataType(entity.FieldTypeFloatVector).WithDim(768).
            WithDescription("vectors for the rich description of the ego vehicle's behaviors")).
        WithField(entity.NewField().WithName("risk").WithDataType(entity.FieldTypeVarChar).WithMaxLength(1024).
            WithDescription("description of the ego vehicle's risks")).
        WithField(entity.NewField().WithName("risk_vector").WithDataType(entity.FieldTypeFloatVector).WithDim(768).
            WithDescription("vectors for the description of the ego vehicle's risks")).
        WithField(entity.NewField().WithName("risk_correct").WithDataType(entity.FieldTypeBool).
            WithDescription("whether the risk assessment is correct")).
        WithField(entity.NewField().WithName("risk_yes_rate").WithDataType(entity.FieldTypeFloat).
            WithDescription("probability/confidence of risk being present")).
        WithField(entity.NewField().WithName("weather").WithDataType(entity.FieldTypeVarChar).WithMaxLength(50).
            WithDescription("weather condition")).
        WithField(entity.NewField().WithName("weather_rate").WithDataType(entity.FieldTypeFloat).
            WithDescription("probability/confidence of the weather condition")).
        WithField(entity.NewField().WithName("road").WithDataType(entity.FieldTypeVarChar).WithMaxLength(50).
            WithDescription("road type")).
        WithField(entity.NewField().WithName("road_rate").WithDataType(entity.FieldTypeFloat).
            WithDescription("probability/confidence of the road type")).
        WithField(entity.NewField().WithName("is_tunnel").WithDataType(entity.FieldTypeBool).
            WithDescription("whether the road is a tunnel")).
        WithField(entity.NewField().WithName("is_tunnel_yes_rate").WithDataType(entity.FieldTypeFloat).
            WithDescription("probability/confidence of the road being a tunnel")).
        WithField(entity.NewField().WithName("is_highway").WithDataType(entity.FieldTypeBool).
            WithDescription("whether the road is a highway")).
        WithField(entity.NewField().WithName("is_highway_yes_rate").WithDataType(entity.FieldTypeFloat).
            WithDescription("probability/confidence of the road being a highway")).
        WithField(entity.NewField().WithName("has_pedestrian").WithDataType(entity.FieldTypeBool).
            WithDescription("whether there is a pedestrian present")).
        WithField(entity.NewField().WithName("has_pedestrian_yes_rate").WithDataType(entity.FieldTypeFloat).
            WithDescription("probability/confidence of pedestrian presence")).
        WithField(entity.NewField().WithName("has_carrier_car").WithDataType(entity.FieldTypeBool).
            WithDescription("whether there is a carrier car present"))
    
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    use milvus::v2::prelude::*;
    
    #[tokio::main]
    async fn main() -> Result<()> {
        let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
        let client = ClientV2::new(&config).await?;
    
        // create the schema for the caption struct
        let caption_schema = StructFieldSchema::new()
            .name("captions")
            .description("captions for the current video")
            .max_capacity(600)
            .add_field(FieldSchema::new().name("frame_id").data_type(DataType::Int64)
                .description("ID of the frame to which the ego vehicle's behavior belongs"))
    .add_field(FieldSchema::new().name("plain_caption").data_type(DataType::VarChar).max_length(1024)
                .description("plain description of the ego vehicle's behaviors"))
    .add_field(FieldSchema::new().name("plain_cap_vector").data_type(DataType::FloatVector).dimension(768)
                .description("vectors for the plain description of the ego vehicle's behaviors"))
    .add_field(FieldSchema::new().name("rich_caption").data_type(DataType::VarChar).max_length(1024)
                .description("rich description of the ego vehicle's behaviors"))
    .add_field(FieldSchema::new().name("rich_cap_vector").data_type(DataType::FloatVector).dimension(768)
                .description("vectors for the rich description of the ego vehicle's behaviors"))
    .add_field(FieldSchema::new().name("risk").data_type(DataType::VarChar).max_length(1024)
                .description("description of the ego vehicle's risks"))
    .add_field(FieldSchema::new().name("risk_vector").data_type(DataType::FloatVector).dimension(768)
                .description("vectors for the description of the ego vehicle's risks"))
    .add_field(FieldSchema::new().name("risk_correct").data_type(DataType::Bool)
                .description("whether the risk assessment is correct"))
    .add_field(FieldSchema::new().name("risk_yes_rate").data_type(DataType::Float)
                .description("probability/confidence of risk being present"))
    .add_field(FieldSchema::new().name("weather").data_type(DataType::VarChar).max_length(50)
                .description("weather condition"))
    .add_field(FieldSchema::new().name("weather_rate").data_type(DataType::Float)
                .description("probability/confidence of the weather condition"))
    .add_field(FieldSchema::new().name("road").data_type(DataType::VarChar).max_length(50)
                .description("road type"))
    .add_field(FieldSchema::new().name("road_rate").data_type(DataType::Float)
                .description("probability/confidence of the road type"))
    .add_field(FieldSchema::new().name("is_tunnel").data_type(DataType::Bool)
                .description("whether the road is a tunnel"))
    .add_field(FieldSchema::new().name("is_tunnel_yes_rate").data_type(DataType::Float)
                .description("probability/confidence of the road being a tunnel"))
    .add_field(FieldSchema::new().name("is_highway").data_type(DataType::Bool)
                .description("whether the road is a highway"))
    .add_field(FieldSchema::new().name("is_highway_yes_rate").data_type(DataType::Float)
                .description("probability/confidence of the road being a highway"))
    .add_field(FieldSchema::new().name("has_pedestrian").data_type(DataType::Bool)
                .description("whether there is a pedestrian present"))
    .add_field(FieldSchema::new().name("has_pedestrian_yes_rate").data_type(DataType::Float)
                .description("probability/confidence of pedestrian presence"))
    .add_field(FieldSchema::new().name("has_carrier_car").data_type(DataType::Bool)
                .description("whether there is a carrier car present"))
        ;
    ```

    </TabItem>

    <TabItem value='c++'>

    ```c++
    #include "milvus/MilvusClientV2.h"
    #include <iostream>
    
    auto client = milvus::MilvusClientV2::Create();
    auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
    }
    
    // create the schema for the caption struct
    milvus::StructFieldSchema schema_for_caption;
    schema_for_caption.SetName("captions");
    schema_for_caption.SetDescription("captions for the current video");
    schema_for_caption.SetMaxCapacity(600);
        schema_for_caption.AddField(milvus::FieldSchema("frame_id", milvus::DataType::INT64, "ID of the frame to which the ego vehicle's behavior belongs"));
        schema_for_caption.AddField(milvus::FieldSchema("plain_caption", milvus::DataType::VARCHAR, "plain description of the ego vehicle's behaviors").WithMaxLength(1024));
        schema_for_caption.AddField(milvus::FieldSchema("plain_cap_vector", milvus::DataType::FLOAT_VECTOR, "vectors for the plain description of the ego vehicle's behaviors").WithDimension(768));
        schema_for_caption.AddField(milvus::FieldSchema("rich_caption", milvus::DataType::VARCHAR, "rich description of the ego vehicle's behaviors").WithMaxLength(1024));
        schema_for_caption.AddField(milvus::FieldSchema("rich_cap_vector", milvus::DataType::FLOAT_VECTOR, "vectors for the rich description of the ego vehicle's behaviors").WithDimension(768));
        schema_for_caption.AddField(milvus::FieldSchema("risk", milvus::DataType::VARCHAR, "description of the ego vehicle's risks").WithMaxLength(1024));
        schema_for_caption.AddField(milvus::FieldSchema("risk_vector", milvus::DataType::FLOAT_VECTOR, "vectors for the description of the ego vehicle's risks").WithDimension(768));
        schema_for_caption.AddField(milvus::FieldSchema("risk_correct", milvus::DataType::BOOL, "whether the risk assessment is correct"));
        schema_for_caption.AddField(milvus::FieldSchema("risk_yes_rate", milvus::DataType::FLOAT, "probability/confidence of risk being present"));
        schema_for_caption.AddField(milvus::FieldSchema("weather", milvus::DataType::VARCHAR, "weather condition").WithMaxLength(50));
        schema_for_caption.AddField(milvus::FieldSchema("weather_rate", milvus::DataType::FLOAT, "probability/confidence of the weather condition"));
        schema_for_caption.AddField(milvus::FieldSchema("road", milvus::DataType::VARCHAR, "road type").WithMaxLength(50));
        schema_for_caption.AddField(milvus::FieldSchema("road_rate", milvus::DataType::FLOAT, "probability/confidence of the road type"));
        schema_for_caption.AddField(milvus::FieldSchema("is_tunnel", milvus::DataType::BOOL, "whether the road is a tunnel"));
        schema_for_caption.AddField(milvus::FieldSchema("is_tunnel_yes_rate", milvus::DataType::FLOAT, "probability/confidence of the road being a tunnel"));
        schema_for_caption.AddField(milvus::FieldSchema("is_highway", milvus::DataType::BOOL, "whether the road is a highway"));
        schema_for_caption.AddField(milvus::FieldSchema("is_highway_yes_rate", milvus::DataType::FLOAT, "probability/confidence of the road being a highway"));
        schema_for_caption.AddField(milvus::FieldSchema("has_pedestrian", milvus::DataType::BOOL, "whether there is a pedestrian present"));
        schema_for_caption.AddField(milvus::FieldSchema("has_pedestrian_yes_rate", milvus::DataType::FLOAT, "probability/confidence of pedestrian presence"));
        schema_for_caption.AddField(milvus::FieldSchema("has_carrier_car", milvus::DataType::BOOL, "whether there is a carrier car present"));
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";
    
    const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });
    
    // create the schema for the caption struct
    const captionStructFields = [
        { name: "frame_id", data_type: DataType.Int64, description: "ID of the frame to which the ego vehicle's behavior belongs" },
        { name: "plain_caption", data_type: DataType.VarChar, type_params: { max_length: 1024 }, description: "plain description of the ego vehicle's behaviors" },
        { name: "plain_cap_vector", data_type: DataType.FloatVector, type_params: { dim: 768 }, description: "vectors for the plain description of the ego vehicle's behaviors" },
        { name: "rich_caption", data_type: DataType.VarChar, type_params: { max_length: 1024 }, description: "rich description of the ego vehicle's behaviors" },
        { name: "rich_cap_vector", data_type: DataType.FloatVector, type_params: { dim: 768 }, description: "vectors for the rich description of the ego vehicle's behaviors" },
        { name: "risk", data_type: DataType.VarChar, type_params: { max_length: 1024 }, description: "description of the ego vehicle's risks" },
        { name: "risk_vector", data_type: DataType.FloatVector, type_params: { dim: 768 }, description: "vectors for the description of the ego vehicle's risks" },
        { name: "risk_correct", data_type: DataType.Bool, description: "whether the risk assessment is correct" },
        { name: "risk_yes_rate", data_type: DataType.Float, description: "probability/confidence of risk being present" },
        { name: "weather", data_type: DataType.VarChar, type_params: { max_length: 50 }, description: "weather condition" },
        { name: "weather_rate", data_type: DataType.Float, description: "probability/confidence of the weather condition" },
        { name: "road", data_type: DataType.VarChar, type_params: { max_length: 50 }, description: "road type" },
        { name: "road_rate", data_type: DataType.Float, description: "probability/confidence of the road type" },
        { name: "is_tunnel", data_type: DataType.Bool, description: "whether the road is a tunnel" },
        { name: "is_tunnel_yes_rate", data_type: DataType.Float, description: "probability/confidence of the road being a tunnel" },
        { name: "is_highway", data_type: DataType.Bool, description: "whether the road is a highway" },
        { name: "is_highway_yes_rate", data_type: DataType.Float, description: "probability/confidence of the road being a highway" },
        { name: "has_pedestrian", data_type: DataType.Bool, description: "whether there is a pedestrian present" },
        { name: "has_pedestrian_yes_rate", data_type: DataType.Float, description: "probability/confidence of pedestrian presence" },
        { name: "has_carrier_car", data_type: DataType.Bool, description: "whether there is a carrier car present" },
    ];
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # Note: The RESTful API does not support Array-of-Struct fields as of Milvus v3.0.x.
    ```

    </TabItem>
    </Tabs>

- 初始化 front_cars Struct Schema

    <Admonition type="info" title="说明">

    虽然 front_car 对象并不包含向量，但是因为数据体积超过 JSON 字段的上限，你仍然需要将其作为 Struct Array 引入。

    </Admonition>

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

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

    </TabItem>

    <TabItem value='java'>

    ```java
    // create the schema for the front car struct
    CreateCollectionReq.StructFieldSchema schemaForFrontCar = CreateCollectionReq.StructFieldSchema.builder()
            .name("front_cars")
            .description("frame-specific leading cars identified in the current video")
            .maxCapacity(600)
            .fields(Arrays.asList(
                    CreateCollectionReq.FieldSchema.builder().name("frame_id").dataType(DataType.Int64)
                            .description("ID of the frame to which the ego vehicle's behavior belongs").build(),
                    CreateCollectionReq.FieldSchema.builder().name("has_lead").dataType(DataType.Bool)
                            .description("whether there is a leading vehicle").build(),
                    CreateCollectionReq.FieldSchema.builder().name("lead_prob").dataType(DataType.Float)
                            .description("probability/confidence of the leading vehicle's presence").build(),
                    CreateCollectionReq.FieldSchema.builder().name("lead_x").dataType(DataType.Float)
                            .description("x position of the leading vehicle relative to the ego vehicle").build(),
                    CreateCollectionReq.FieldSchema.builder().name("lead_y").dataType(DataType.Float)
                            .description("y position of the leading vehicle relative to the ego vehicle").build(),
                    CreateCollectionReq.FieldSchema.builder().name("lead_speed_kmh").dataType(DataType.Float)
                            .description("speed of the leading vehicle in km/h").build(),
                    CreateCollectionReq.FieldSchema.builder().name("lead_a").dataType(DataType.Float)
                            .description("acceleration of the leading vehicle").build()
            ))
            .build();
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // create the schema for the front car struct
    frontCarSchema := entity.NewStructSchema().
        WithField(entity.NewField().WithName("frame_id").WithDataType(entity.FieldTypeInt64).
            WithDescription("ID of the frame to which the ego vehicle's behavior belongs")).
        WithField(entity.NewField().WithName("has_lead").WithDataType(entity.FieldTypeBool).
            WithDescription("whether there is a leading vehicle")).
        WithField(entity.NewField().WithName("lead_prob").WithDataType(entity.FieldTypeFloat).
            WithDescription("probability/confidence of the leading vehicle's presence")).
        WithField(entity.NewField().WithName("lead_x").WithDataType(entity.FieldTypeFloat).
            WithDescription("x position of the leading vehicle relative to the ego vehicle")).
        WithField(entity.NewField().WithName("lead_y").WithDataType(entity.FieldTypeFloat).
            WithDescription("y position of the leading vehicle relative to the ego vehicle")).
        WithField(entity.NewField().WithName("lead_speed_kmh").WithDataType(entity.FieldTypeFloat).
            WithDescription("speed of the leading vehicle in km/h")).
        WithField(entity.NewField().WithName("lead_a").WithDataType(entity.FieldTypeFloat).
            WithDescription("acceleration of the leading vehicle"))
    
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
        // create the schema for the front car struct
        let front_car_schema = StructFieldSchema::new()
            .name("front_cars")
            .description("frame-specific leading cars identified in the current video")
            .max_capacity(600)
            .add_field(FieldSchema::new().name("frame_id").data_type(DataType::Int64)
                .description("ID of the frame to which the ego vehicle's behavior belongs"))
    .add_field(FieldSchema::new().name("has_lead").data_type(DataType::Bool)
                .description("whether there is a leading vehicle"))
    .add_field(FieldSchema::new().name("lead_prob").data_type(DataType::Float)
                .description("probability/confidence of the leading vehicle's presence"))
    .add_field(FieldSchema::new().name("lead_x").data_type(DataType::Float)
                .description("x position of the leading vehicle relative to the ego vehicle"))
    .add_field(FieldSchema::new().name("lead_y").data_type(DataType::Float)
                .description("y position of the leading vehicle relative to the ego vehicle"))
    .add_field(FieldSchema::new().name("lead_speed_kmh").data_type(DataType::Float)
                .description("speed of the leading vehicle in km/h"))
    .add_field(FieldSchema::new().name("lead_a").data_type(DataType::Float)
                .description("acceleration of the leading vehicle"))
        ;
    ```

    </TabItem>

    <TabItem value='c++'>

    ```c++
    // create the schema for the front car struct
    milvus::StructFieldSchema schema_for_front_car;
    schema_for_front_car.SetName("front_cars");
    schema_for_front_car.SetDescription("frame-specific leading cars identified in the current video");
    schema_for_front_car.SetMaxCapacity(600);
        schema_for_front_car.AddField(milvus::FieldSchema("frame_id", milvus::DataType::INT64, "ID of the frame to which the ego vehicle's behavior belongs"));
        schema_for_front_car.AddField(milvus::FieldSchema("has_lead", milvus::DataType::BOOL, "whether there is a leading vehicle"));
        schema_for_front_car.AddField(milvus::FieldSchema("lead_prob", milvus::DataType::FLOAT, "probability/confidence of the leading vehicle's presence"));
        schema_for_front_car.AddField(milvus::FieldSchema("lead_x", milvus::DataType::FLOAT, "x position of the leading vehicle relative to the ego vehicle"));
        schema_for_front_car.AddField(milvus::FieldSchema("lead_y", milvus::DataType::FLOAT, "y position of the leading vehicle relative to the ego vehicle"));
        schema_for_front_car.AddField(milvus::FieldSchema("lead_speed_kmh", milvus::DataType::FLOAT, "speed of the leading vehicle in km/h"));
        schema_for_front_car.AddField(milvus::FieldSchema("lead_a", milvus::DataType::FLOAT, "acceleration of the leading vehicle"));
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // create the schema for the front car struct
    const frontCarStructFields = [
        { name: "frame_id", data_type: DataType.Int64, description: "ID of the frame to which the ego vehicle's behavior belongs" },
        { name: "has_lead", data_type: DataType.Bool, description: "whether there is a leading vehicle" },
        { name: "lead_prob", data_type: DataType.Float, description: "probability/confidence of the leading vehicle's presence" },
        { name: "lead_x", data_type: DataType.Float, description: "x position of the leading vehicle relative to the ego vehicle" },
        { name: "lead_y", data_type: DataType.Float, description: "y position of the leading vehicle relative to the ego vehicle" },
        { name: "lead_speed_kmh", data_type: DataType.Float, description: "speed of the leading vehicle in km/h" },
        { name: "lead_a", data_type: DataType.Float, description: "acceleration of the leading vehicle" },
    ];
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # Note: The RESTful API does not support Array-of-Struct fields as of Milvus v3.0.x.
    ```

    </TabItem>
    </Tabs>

- 初始化 Collection Schema

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

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

    </TabItem>

    <TabItem value='java'>

    ```java
    import java.util.Arrays;
    
    CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
            .fieldSchemaList(Arrays.asList(
                    CreateCollectionReq.FieldSchema.builder().name("video_id").dataType(DataType.VarChar)
                            .description("primary key").maxLength(16).isPrimaryKey(true).autoID(false).build(),
                    CreateCollectionReq.FieldSchema.builder().name("video_url").dataType(DataType.VarChar)
                            .description("URL of the video").maxLength(512).build(),
                    CreateCollectionReq.FieldSchema.builder().name("traffic_lights").dataType(DataType.JSON)
                            .description("frame-specific traffic lights identified in the current video").build()))
            .structFields(Arrays.asList(schemaForCaption, schemaForFrontCar))
            .build();
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    schema := entity.NewSchema().
        WithField(entity.NewField().WithName("video_id").WithDataType(entity.FieldTypeVarChar).WithMaxLength(16).
            WithIsPrimaryKey(true).WithIsAutoID(false).WithDescription("primary key")).
        WithField(entity.NewField().WithName("video_url").WithDataType(entity.FieldTypeVarChar).WithMaxLength(512).
            WithDescription("URL of the video")).
        WithField(entity.NewField().WithName("captions").
            WithDataType(entity.FieldTypeArray).
            WithElementType(entity.FieldTypeStruct).
            WithMaxCapacity(600).
            WithStructSchema(captionSchema).
            WithDescription("captions for the current video")).
        WithField(entity.NewField().WithName("traffic_lights").WithDataType(entity.FieldTypeJSON).
            WithDescription("frame-specific traffic lights identified in the current video")).
        WithField(entity.NewField().WithName("front_cars").
            WithDataType(entity.FieldTypeArray).
            WithElementType(entity.FieldTypeStruct).
            WithMaxCapacity(600).
            WithStructSchema(frontCarSchema).
            WithDescription("frame-specific leading cars identified in the current video"))
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
        let schema = CollectionSchema::new()
            .add_field(FieldSchema::new().name("video_id").data_type(DataType::VarChar).max_length(16)
                .primary_key(true).auto_id(false).description("primary key"))
            .add_field(FieldSchema::new().name("video_url").data_type(DataType::VarChar).max_length(512)
                .description("URL of the video"))
            .add_struct_field(caption_schema)
            .add_field(FieldSchema::new().name("traffic_lights").data_type(DataType::Json)
                .description("frame-specific traffic lights identified in the current video"))
            .add_struct_field(front_car_schema);
    ```

    </TabItem>

    <TabItem value='c++'>

    ```c++
    milvus::CollectionSchema schema;
    schema.AddField(milvus::FieldSchema("video_id", milvus::DataType::VARCHAR,
        "primary key", true, false).WithMaxLength(16));
    schema.AddField(milvus::FieldSchema("video_url", milvus::DataType::VARCHAR,
        "URL of the video").WithMaxLength(512));
    schema.AddStructField(schema_for_caption);
    schema.AddField(milvus::FieldSchema("traffic_lights", milvus::DataType::JSON,
        "frame-specific traffic lights identified in the current video"));
    schema.AddStructField(schema_for_front_car);
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    const schema = [
        { name: "video_id", data_type: DataType.VarChar, is_primary_key: true, autoID: false,
          type_params: { max_length: 16 }, description: "primary key" },
        { name: "video_url", data_type: DataType.VarChar,
          type_params: { max_length: 512 }, description: "URL of the video" },
        { name: "captions", data_type: DataType.Array, element_type: DataType.Struct, max_capacity: 600,
          fields: captionStructFields, description: "captions for the current video" },
        { name: "traffic_lights", data_type: DataType.JSON,
          description: "frame-specific traffic lights identified in the current video" },
        { name: "front_cars", data_type: DataType.Array, element_type: DataType.Struct, max_capacity: 600,
          fields: frontCarStructFields, description: "frame-specific leading cars identified in the current video" },
    ];
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # Note: The RESTful API does not support Array-of-Struct fields as of Milvus v3.0.x.
    ```

    </TabItem>
    </Tabs>

### 步骤 3：配置索引参数\{#step-3-set-index-params}

所有的向量字段都需要索引。为 Struct Array 字段中的向量字段创建索引，需要使用 `AUTOINDEX` 为索引类型，并在 `MAX_SIM` 系列相似度类型中选择合适的类型来度量 EmbeddingList 之间的相似度。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="captions[plain_cap_vector]", 
    index_type="AUTOINDEX", 
    metric_type="MAX_SIM_COSINE", 
    index_name="captions_plain_cap_vector_idx"
)

index_params.add_index(
    field_name="captions[rich_cap_vector]", 
    index_type="AUTOINDEX", 
    metric_type="MAX_SIM_COSINE", 
    index_name="captions_rich_cap_vector_idx"
)

index_params.add_index(
    field_name="captions[risk_vector]", 
    index_type="AUTOINDEX", 
    metric_type="MAX_SIM_COSINE", 
    index_name="captions_risk_vector_idx"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.Arrays;
import java.util.List;

List<IndexParam> indexParams = Arrays.asList(
        IndexParam.builder().fieldName("captions[plain_cap_vector]")
                .indexType(IndexParam.IndexType.AUTOINDEX)
                .metricType(IndexParam.MetricType.MAX_SIM_COSINE)
                .indexName("captions_plain_cap_vector_idx")
                .build(),
        IndexParam.builder().fieldName("captions[rich_cap_vector]")
                .indexType(IndexParam.IndexType.AUTOINDEX)
                .metricType(IndexParam.MetricType.MAX_SIM_COSINE)
                .indexName("captions_rich_cap_vector_idx")
                .build(),
        IndexParam.builder().fieldName("captions[risk_vector]")
                .indexType(IndexParam.IndexType.AUTOINDEX)
                .metricType(IndexParam.MetricType.MAX_SIM_COSINE)
                .indexName("captions_risk_vector_idx")
                .build());
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/index"

indexes := []milvusclient.CreateIndexOption{
    milvusclient.NewCreateIndexOption("covla_dataset", "captions[plain_cap_vector]", index.NewAutoIndex(entity.MaxSimCosine)).
        WithIndexName("captions_plain_cap_vector_idx"),
    milvusclient.NewCreateIndexOption("covla_dataset", "captions[rich_cap_vector]", index.NewAutoIndex(entity.MaxSimCosine)).
        WithIndexName("captions_rich_cap_vector_idx"),
    milvusclient.NewCreateIndexOption("covla_dataset", "captions[risk_vector]", index.NewAutoIndex(entity.MaxSimCosine)).
        WithIndexName("captions_risk_vector_idx"),
}
```

</TabItem>

<TabItem value='rust'>

```rust
    let index_params = vec![
        IndexParam::new().field_name("captions[plain_cap_vector]")
            .index_name("captions_plain_cap_vector_idx")
            .index_type(IndexType::AutoIndex)
            .metric_type(MetricType::MaxSimCosine),
        IndexParam::new().field_name("captions[rich_cap_vector]")
            .index_name("captions_rich_cap_vector_idx")
            .index_type(IndexType::AutoIndex)
            .metric_type(MetricType::MaxSimCosine),
        IndexParam::new().field_name("captions[risk_vector]")
            .index_name("captions_risk_vector_idx")
            .index_type(IndexType::AutoIndex)
            .metric_type(MetricType::MaxSimCosine),
    ];
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc captions_plain_cap_vector_idx("captions[plain_cap_vector]",
    "captions_plain_cap_vector_idx", milvus::IndexType::AUTOINDEX, milvus::MetricType::MAX_SIM_COSINE);
milvus::IndexDesc captions_rich_cap_vector_idx("captions[rich_cap_vector]",
    "captions_rich_cap_vector_idx", milvus::IndexType::AUTOINDEX, milvus::MetricType::MAX_SIM_COSINE);
milvus::IndexDesc captions_risk_vector_idx("captions[risk_vector]",
    "captions_risk_vector_idx", milvus::IndexType::AUTOINDEX, milvus::MetricType::MAX_SIM_COSINE);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = [
    { field_name: "captions[plain_cap_vector]", index_type: "AUTOINDEX",
      metric_type: "MAX_SIM_COSINE", index_name: "captions_plain_cap_vector_idx" },
    { field_name: "captions[rich_cap_vector]", index_type: "AUTOINDEX",
      metric_type: "MAX_SIM_COSINE", index_name: "captions_rich_cap_vector_idx" },
    { field_name: "captions[risk_vector]", index_type: "AUTOINDEX",
      metric_type: "MAX_SIM_COSINE", index_name: "captions_risk_vector_idx" },
];
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: The RESTful API does not support Array-of-Struct fields as of Milvus v3.0.x.
```

</TabItem>
</Tabs>

建议您为 JSON 类型的字段启用 JSON Shredding 来加速过滤。

### 步骤 4：创建 Collection\{#step-4-create-a-collection}

当 Schema 和索引参数都准备好之后，就可以使用它们来创建 Collection 了。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="covla_dataset",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
client.createCollection(CreateCollectionReq.builder()
        .collectionName("covla_dataset")
        .collectionSchema(schema)
        .indexParams(indexParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
err = cli.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("covla_dataset", schema).
        WithIndexOptions(indexes...))
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
    let request = CreateCollectionRequest::builder()
        .collection_name("covla_dataset")
        .schema(schema)
        .index_params(index_params)
        .build()?;
    client.create_collection(request).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::CreateCollectionRequest create_request;
create_request.WithCollectionName("covla_dataset");
create_request.WithCollectionSchema(std::make_shared<milvus::CollectionSchema>(schema));
create_request.WithIndexes({captions_plain_cap_vector_idx, captions_rich_cap_vector_idx, captions_risk_vector_idx});

status = client->CreateCollection(create_request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createCollection({
    collection_name: "covla_dataset",
    schema,
    index_params: indexParams,
});
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: The RESTful API does not support Array-of-Struct fields as of Milvus v3.0.x.
```

</TabItem>
</Tabs>

### 步骤 5：插入数据\{#insert-the-data}

Turing Motors 将 CoVLA 数据集分散到多个文件中，包括原始视频片段（`.mp4`）、自车状态（`states.jsonl`）、场景描述（`captions.jsonl`）、交通信息灯（`traffic_lights.jsonl`）以及前方车辆信息（`front_cars.jsonl`）。

您需要从这些数据中将每个视频片段的信息抽取出来按之前创建好的 Schema 的格式重新组合才能将其插入到 Collection 中。下方示例代码演示了合并指定视频片段所有数据的代码。

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

在经过上述方式的处理后，您就可以向 Collection 中插入这条视频片段的相关数据了。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.insert(
    collection_name="covla_dataset",
    data=[data]
)

# {'insert_count': 1, 'ids': ['0a0fc7a5db365174']}
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import io.milvus.v2.service.vector.request.InsertReq;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

List<Float> vector = Collections.nCopies(768, 0.1f); // placeholder vectors

JsonObject data = new JsonObject();
data.addProperty("video_id", "0a0fc7a5db365174");
data.addProperty("video_url", "https://your-storage.com/0a0fc7a5db365174");

JsonArray captions = new JsonArray();
JsonObject caption = new JsonObject();
caption.addProperty("frame_id", 0);
caption.addProperty("plain_caption", "Merge left while yielding to oncoming traffic");
caption.add("plain_cap_vector", new Gson().toJsonTree(vector));
caption.addProperty("rich_caption", "Merge left while yielding to oncoming traffic on a sunny highway");
caption.add("rich_cap_vector", new Gson().toJsonTree(vector));
caption.addProperty("risk", "Potential collision with the leading vehicle");
caption.add("risk_vector", new Gson().toJsonTree(vector));
caption.addProperty("risk_correct", true);
caption.addProperty("risk_yes_rate", 0.8);
caption.addProperty("weather", "sunny");
caption.addProperty("weather_rate", 0.9);
caption.addProperty("road", "highway");
caption.addProperty("road_rate", 0.7);
caption.addProperty("is_tunnel", false);
caption.addProperty("is_tunnel_yes_rate", 0.1);
caption.addProperty("is_highway", true);
caption.addProperty("is_highway_yes_rate", 0.9);
caption.addProperty("has_pedestrian", true);
caption.addProperty("has_pedestrian_yes_rate", 0.6);
caption.addProperty("has_carrier_car", false);
captions.add(caption);

JsonArray trafficLights = new JsonArray();
JsonObject trafficLight = new JsonObject();
trafficLight.addProperty("index", 0);
trafficLight.addProperty("class", "red");
trafficLight.add("bbox", new Gson().toJsonTree(Arrays.asList(1, 2, 3, 4)));
trafficLights.add(trafficLight);

JsonArray frontCars = new JsonArray();
JsonObject frontCar = new JsonObject();
frontCar.addProperty("frame_id", 0);
frontCar.addProperty("has_lead", true);
frontCar.addProperty("lead_prob", 0.9);
frontCar.addProperty("lead_x", 1.5);
frontCar.addProperty("lead_y", 0.5);
frontCar.addProperty("lead_speed_kmh", 60.0);
frontCar.addProperty("lead_a", 0.2);
frontCars.add(frontCar);

data.add("captions", captions);
data.add("traffic_lights", trafficLights);
data.add("front_cars", frontCars);

client.insert(InsertReq.builder()
        .collectionName("covla_dataset")
        .data(Collections.singletonList(data))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "encoding/json"

    "github.com/milvus-io/milvus/client/v3/column"
)

trafficLights, err := json.Marshal([]map[string]any{
    {"index": 0, "class": "red", "bbox": []float32{1, 2, 3, 4}},
    {"index": 1, "class": "green", "bbox": []float32{5, 6, 7, 8}},
})
if err != nil {
    log.Fatal(err)
}

// placeholder vectors
vector := func() []float32 {
    v := make([]float32, 768)
    for i := range v {
        v[i] = 0.1
    }
    return v
}

ins, err := cli.Insert(ctx, milvusclient.NewColumnBasedInsertOption("covla_dataset").
    WithColumns(
        column.NewColumnVarChar("video_id", []string{"0a0fc7a5db365174"}),
        column.NewColumnVarChar("video_url", []string{"https://your-storage.com/0a0fc7a5db365174"}),
        column.NewColumnJSONBytes("traffic_lights", [][]byte{trafficLights}),
    ).
    WithStructArrayColumn("captions", captionSchema, []map[string]any{
        {
            "frame_id":                []int64{0, 1},
            "plain_caption":           []string{"Merge left while yielding to oncoming traffic", "Continue straight on the highway"},
            "plain_cap_vector":        [][]float32{vector(), vector()},
            "rich_caption":            []string{"Merge left on a sunny highway", "Continue straight on a sunny highway"},
            "rich_cap_vector":         [][]float32{vector(), vector()},
            "risk":                    []string{"Potential collision with the leading vehicle", "No immediate risk"},
            "risk_vector":             [][]float32{vector(), vector()},
            "risk_correct":            []bool{true, true},
            "risk_yes_rate":           []float32{0.8, 0.1},
            "weather":                 []string{"sunny", "sunny"},
            "weather_rate":            []float32{0.9, 0.9},
            "road":                    []string{"highway", "highway"},
            "road_rate":               []float32{0.7, 0.8},
            "is_tunnel":               []bool{false, false},
            "is_tunnel_yes_rate":      []float32{0.1, 0.1},
            "is_highway":              []bool{true, true},
            "is_highway_yes_rate":     []float32{0.9, 0.9},
            "has_pedestrian":          []bool{true, false},
            "has_pedestrian_yes_rate": []float32{0.6, 0.2},
            "has_carrier_car":         []bool{false, false},
        },
    }).
    WithStructArrayColumn("front_cars", frontCarSchema, []map[string]any{
        {
            "frame_id":       []int64{0, 1},
            "has_lead":       []bool{true, false},
            "lead_prob":      []float32{0.9, 0.0},
            "lead_x":         []float32{1.5, 0.0},
            "lead_y":         []float32{0.5, 0.0},
            "lead_speed_kmh": []float32{60.0, 0.0},
            "lead_a":         []float32{0.2, 0.0},
        },
    }))
if err != nil {
    log.Fatal(err)
}
fmt.Println("insert OK, ids:", ins.IDs)
```

</TabItem>

<TabItem value='rust'>

```rust
    let request = InsertRequest::builder()
        .collection_name("covla_dataset")
        .columns(vec![
            FieldData::VarChar {
                name: "video_id".into(),
                values: vec!["0a0fc7a5db365174".to_string()],
            },
            FieldData::VarChar {
                name: "video_url".into(),
                values: vec!["https://your-storage.com/0a0fc7a5db365174".to_string()],
            },
            FieldData::Json {
                name: "traffic_lights".into(),
                values: vec![serde_json::json!([
                    {"index": 0, "class": "red", "bbox": [1.0, 2.0, 3.0, 4.0]},
                    {"index": 1, "class": "green", "bbox": [5.0, 6.0, 7.0, 8.0]}
                ])],
            },
            FieldData::Struct {
                name: "captions".into(),
                values: vec![vec![
                    serde_json::json!({
                        "frame_id": 0,
                        "plain_caption": "Merge left while yielding to oncoming traffic",
                        "plain_cap_vector": vec![0.1f32; 768],
                        "rich_caption": "Merge left while yielding to oncoming traffic on a sunny highway",
                        "rich_cap_vector": vec![0.1f32; 768],
                        "risk": "Potential collision with the leading vehicle",
                        "risk_vector": vec![0.1f32; 768],
                        "risk_correct": true,
                        "risk_yes_rate": 0.8,
                        "weather": "sunny",
                        "weather_rate": 0.9,
                        "road": "highway",
                        "road_rate": 0.7,
                        "is_tunnel": false,
                        "is_tunnel_yes_rate": 0.1,
                        "is_highway": true,
                        "is_highway_yes_rate": 0.9,
                        "has_pedestrian": true,
                        "has_pedestrian_yes_rate": 0.6,
                        "has_carrier_car": false,
                    }).as_object().cloned().expect("caption object"),
                ]],
            },
            FieldData::Struct {
                name: "front_cars".into(),
                values: vec![vec![
                    serde_json::json!({
                        "frame_id": 0,
                        "has_lead": true,
                        "lead_prob": 0.9,
                        "lead_x": 1.5,
                        "lead_y": 0.5,
                        "lead_speed_kmh": 60.0,
                        "lead_a": 0.2,
                    }).as_object().cloned().expect("front car object"),
                ]],
            },
        ])
        .build()?;
    client.insert(request).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::EntityRows rows = {{
    {"video_id", "0a0fc7a5db365174"},
    {"video_url", "https://your-storage.com/0a0fc7a5db365174"},
    {"captions", nlohmann::json::array({{
        {{
            {"frame_id", 0},
            {"plain_caption", "Merge left while yielding to oncoming traffic"},
            {"plain_cap_vector", std::vector<float>(768, 0.1f)},
            {"rich_caption", "Merge left while yielding to oncoming traffic on a sunny highway"},
            {"rich_cap_vector", std::vector<float>(768, 0.1f)},
            {"risk", "Potential collision with the leading vehicle"},
            {"risk_vector", std::vector<float>(768, 0.1f)},
            {"risk_correct", true},
            {"risk_yes_rate", 0.8},
            {"weather", "sunny"},
            {"weather_rate", 0.9},
            {"road", "highway"},
            {"road_rate", 0.7},
            {"is_tunnel", false},
            {"is_tunnel_yes_rate", 0.1},
            {"is_highway", true},
            {"is_highway_yes_rate", 0.9},
            {"has_pedestrian", true},
            {"has_pedestrian_yes_rate", 0.6},
            {"has_carrier_car", false}
        }}
    }})},
    {"traffic_lights", nlohmann::json::array({{
        {{"index", 0}, {"class", "red"}, {"bbox", std::vector<float>{1, 2, 3, 4}}}
    }})},
    {"front_cars", nlohmann::json::array({{
        {{
            {"frame_id", 0},
            {"has_lead", true},
            {"lead_prob", 0.9},
            {"lead_x", 1.5},
            {"lead_y", 0.5},
            {"lead_speed_kmh", 60.0},
            {"lead_a", 0.2}
        }}
    }})}
}};

milvus::InsertRequest insert_request;
insert_request.WithCollectionName("covla_dataset");
insert_request.WithRowsData(std::move(rows));

milvus::InsertResponse insert_resp;
status = client->Insert(insert_request, insert_resp);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = {
    video_id: "0a0fc7a5db365174",
    video_url: "https://your-storage.com/0a0fc7a5db365174",
    captions: [
        {
            frame_id: 0,
            plain_caption: "Merge left while yielding to oncoming traffic",
            plain_cap_vector: new Array(768).fill(0.1),
            rich_caption: "Merge left while yielding to oncoming traffic on a sunny highway",
            rich_cap_vector: new Array(768).fill(0.1),
            risk: "Potential collision with the leading vehicle",
            risk_vector: new Array(768).fill(0.1),
            risk_correct: true,
            risk_yes_rate: 0.8,
            weather: "sunny",
            weather_rate: 0.9,
            road: "highway",
            road_rate: 0.7,
            is_tunnel: false,
            is_tunnel_yes_rate: 0.1,
            is_highway: true,
            is_highway_yes_rate: 0.9,
            has_pedestrian: true,
            has_pedestrian_yes_rate: 0.6,
            has_carrier_car: false,
        },
    ],
    traffic_lights: [
        { index: 0, class: "red", bbox: [1, 2, 3, 4] },
        { index: 1, class: "green", bbox: [5, 6, 7, 8] },
    ],
    front_cars: [
        {
            frame_id: 0,
            has_lead: true,
            lead_prob: 0.9,
            lead_x: 1.5,
            lead_y: 0.5,
            lead_speed_kmh: 60,
            lead_a: 0.2,
        },
    ],
};

await client.insert({ collection_name: "covla_dataset", data: [data] });
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: The RESTful API does not support Array-of-Struct fields as of Milvus v3.0.x.
```

</TabItem>
</Tabs>