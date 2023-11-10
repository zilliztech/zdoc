---
slug: /create-collection-with-schema
beta: FALSE
notebook: 01_use_customized_schema.ipynb
sidebar_position: 2
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create Collection with Schema

This guide walks you through how to use a customized schema in a collection.

## Before you start{#before-you-start}

Before creating a collection, ensure that

- You are equipped with a detailed blueprint of your data model, or schema. Dive deeper into this by checking out the [Schema Explained](https://zilliverse.feishu.cn/wiki/M0ntwROsvi5KC3kRBlvczMsRnzb).

- You have created a cluster. Get a walkthrough on this in [Create Cluster](https://zilliverse.feishu.cn/wiki/HQxKw5QQiiktfHk3iascUEIPneh).

- You have obtained the example dataset for practice. Details can be found at [Example Dataset](https://zilliverse.feishu.cn/wiki/FfUwwn4dziGJJ3kd9l2cgNlWnjh).

## Procedure{#procedure}

In production settings, it's best practice to utilize a custom schema over a dynamic one. This guarantees your data is stored precisely as intended. To define a custom data model:

1. Detail each field in the collection by providing its name and data type.
    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
    <TabItem value='python'>

    ```python
    from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility
    
    CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT" # Set your cluster endpoint
    TOKEN="YOUR_CLUSTER_TOKEN" # Set your token
    COLLECTION_NAME="medium_articles_2020" # Set your collection name
    DATASET_PATH="../medium_articles_2020_dpr.json" # Set your dataset path
    
    connections.connect(
      alias='default', 
      #  Public endpoint obtained from Zilliz Cloud
      uri=CLUSTER_ENDPOINT,
      # API key or a colon-separated cluster username and password
      token=TOKEN, 
    )
    
    # 1. Define fields
    fields = [
        FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
        FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=512),   
        FieldSchema(name="title_vector", dtype=DataType.FLOAT_VECTOR, dim=768),
        FieldSchema(name="link", dtype=DataType.VARCHAR, max_length=512),
        FieldSchema(name="reading_time", dtype=DataType.INT64),
        FieldSchema(name="publication", dtype=DataType.VARCHAR, max_length=512),
        FieldSchema(name="claps", dtype=DataType.INT64),
        FieldSchema(name="responses", dtype=DataType.INT64)
    ]
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")
    
    async function main() {
    
        // 1. Connect to the cluster
        const client = new MilvusClient({address, token})
        
        // 2. Define fields
        fields = [
            {
                name: "id",
                data_type: DataType.Int64,
                is_primary_key: true,
                auto_id: true
            },
            {
                name: "title",
                data_type: DataType.VarChar,
                max_length: 512
            },
            {
                name: "title_vector",
                data_type: DataType.FloatVector,
                dim: 768
            },
            {
                name: "link",
                data_type: DataType.VarChar,
                max_length: 512
            },
            {
                name: "reading_time",
                data_type: DataType.Int64
            },
            {
                name: "publication",
                data_type: DataType.VarChar,
                max_length: 512
            },
            {
                name: "claps",
                data_type: DataType.Int64
            },
            {
                name: "responses",
                data_type: DataType.Int64
            }
        ]
    
    }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    public final class UseCustomizedSchemaDemo  {
        public static void main(String[] args) {
            String clusterEndpoint = "YOUR_CLUSTER_ENDPOINT";
            String token = "YOUR_CLUSTER_TOKEN";
            String collectionName = "medium_articles";
            String data_file = System.getProperty("user.dir") + "/medium_articles_2020_dpr.json";
    
            // 1. Connect to Zilliz Cloud cluster
            ConnectParam connectParam = ConnectParam.newBuilder()
                .withUri(clusterEndpoint)
                .withToken(token)
                .build();
    
            MilvusServiceClient client = new MilvusServiceClient(connectParam);
    
            System.out.println("Connected to Zilliz Cloud!");
    
    
            // Output:
            // Connected to Zilliz Cloud!
    
    
    
            // 2. Define fields
    
            FieldType id = FieldType.newBuilder()
                .withName("id")
                .withDataType(DataType.Int64)
                .withPrimaryKey(true)
                .withAutoID(true)
                .build();
    
            FieldType title = FieldType.newBuilder()
                .withName("title")
                .withDataType(DataType.VarChar)
                .withMaxLength(512)
                .build();
    
            FieldType title_vector = FieldType.newBuilder()
                .withName("title_vector")
                .withDataType(DataType.FloatVector)
                .withDimension(768)
                .build();
    
            FieldType link = FieldType.newBuilder()
                .withName("link")
                .withDataType(DataType.VarChar)
                .withMaxLength(512)
                .build();
    
            FieldType reading_time = FieldType.newBuilder()
                .withName("reading_time")
                .withDataType(DataType.Int64)
                .build();
    
            FieldType publication = FieldType.newBuilder()
                .withName("publication")
                .withDataType(DataType.VarChar)
                .withMaxLength(512)
                .build();
    
            FieldType claps = FieldType.newBuilder()
                .withName("claps")
                .withDataType(DataType.Int64)
                .build();
    
            FieldType responses = FieldType.newBuilder()
                .withName("responses")
                .withDataType(DataType.Int64)
                .build();
        }
    }
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    import "github.com/milvus-io/milvus-sdk-go/v2/client"
    
    func main() {
            CLUSTER_ENDPOINT := "YOUR_CLUSTER_ENDPOINT"
            TOKEN := "YOUR_CLUSTER_TOKEN"
            COLLNAME := "medium_articles_2020"
    
            // 1. Connect to cluster
    
            connParams := client.Config{
                    Address: CLUSTER_ENDPOINT,
                    APIKey:  TOKEN,
            }
    
            conn, err := client.NewClient(context.Background(), connParams)
    
            if err != nil {
                    log.Fatal("Failed to connect to Zilliz Cloud:", err.Error())
            }
    
            // 2. Create collection
    
            // Define fields
    
            id := entity.NewField().
                    WithName("id").
                    WithDataType(entity.FieldTypeInt64).
                    WithIsPrimaryKey(true)
    
            title := entity.NewField().
                    WithName("title").
                    WithDataType(entity.FieldTypeVarChar).
                    WithMaxLength(512)
    
            title_vector := entity.NewField().
                    WithName("title_vector").
                    WithDataType(entity.FieldTypeFloatVector).
                    WithDim(768)
    
            link := entity.NewField().
                    WithName("link").
                    WithDataType(entity.FieldTypeVarChar).
                    WithMaxLength(512)
    
            reading_time := entity.NewField().
                    WithName("reading_time").
                    WithDataType(entity.FieldTypeInt64)
    
            publication := entity.NewField().
                    WithName("publication").
                    WithDataType(entity.FieldTypeVarChar).
                    WithMaxLength(512)
    
            claps := entity.NewField().
                    WithName("claps").
                    WithDataType(entity.FieldTypeInt64)
    
            responses := entity.NewField().
                    WithName("responses").
                    WithDataType(entity.FieldTypeInt64)
                    
    }
    ```

    </TabItem>
    </Tabs>

1. After delineating the fields, draft a schema tailored to your collection.
    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
    <TabItem value='python'>

    ```python
    # 2. Build the schema
    schema = CollectionSchema(
        fields,
        description="Schema of Medium articles",
        enable_dynamic_field=False
    )
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // The list of fields in the previous step suffice.
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    public final class UseCustomizedSchemaDemo  {
        public static void main(String[] args) {
            
            // (Continued)
            
            // 3. Create collection
    
            CreateCollectionParam createCollectionParam = CreateCollectionParam.newBuilder()
                .withCollectionName("medium_articles")
                .withDescription("Schema of Medium articles")
                .addFieldType(id)
                .addFieldType(title)
                .addFieldType(title_vector)
                .addFieldType(link)
                .addFieldType(reading_time)
                .addFieldType(publication)
                .addFieldType(claps)
                .addFieldType(responses)
                .build();     
        }
    }
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    func main() {
        // (Continued)
        
        // Define schema
        schema := &entity.Schema{
             CollectionName: COLLNAME,
             AutoID:         true,
             Fields: []*entity.Field{
                  id,
                  title,
                  title_vector,
                  link,
                  reading_time,
                  publication,
                  claps,
                  responses,
             },
         }              
    }
    ```

    </TabItem>
    </Tabs>

1. With the schema in hand, you are set to initiate the creation of your collection.
    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
    <TabItem value='python'>

    ```python
    # 3. Create collection
    collection = Collection(
        name=COLLECTION_NAME, 
        description="Medium articles published between Jan and August in 2020 in prominent publications",
        schema=schema
    )
    
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    async function main() {
    
        // (Continued)
    
        // 3. Create collection
        res = await client.createCollection({
            collection_name: collectionName,
            fields: fields
        })
    
        console.log(res)
    
        // Output
        // 
        // { error_code: 'Success', reason: '', code: 0 }
        // 
    
    }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    public final class UseCustomizedSchemaDemo  {
        public static void main(String[] args) {
            
            // (Continued)
    
            R<RpcStatus> collection = client.createCollection(createCollectionParam);
    
            if (collection.getException() != null) {
                System.err.println("Failed to create collection: " + collection.getException().getMessage());
                return;
            }
    
            System.out.println("Collection created!");
    
            // Output:
            // Collection created!        
        }
    }
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    func main() {
        // (Continued)
        
        err = conn.CreateCollection(context.Background(), schema, 2)
    
        if err != nil {
            log.Fatal("Failed to create collection:", err.Error())
        }              
    }
    ```

    </TabItem>
    </Tabs>

## Supported data types{#supported-data-types}

To aid in your schema design, here are the data types Zilliz Cloud can accommodate:

- **Boolean values**: BOOLEAN

- **Floating points**: DOUBLE (8-byte) and FLOAT (4-byte)

- **Integers**: INT8 (8-bit), INT32 (32-bit), and INT64 (64-bit)

- **Float vectors**:  FLOAT_VECTOR

- **Characters**: VARCHAR

- **Structured data types**: [JSON](./javascript-object-notation-json-1)

Harness these types as building blocks for your collection's schema.

## Related topics{#related-topics}

- [Enable Dynamic Schema](https://zilliverse.feishu.cn/wiki/P68Iw4765i8qG6kE4u5cpzC3nAz)

- [Use Partition Key](https://zilliverse.feishu.cn/wiki/UGqiwkSpmiaMb1kSceqcmgl4nxg)

- [Use JSON Fields](https://zilliverse.feishu.cn/wiki/ZrhrwRGxWiwDLqkI84dceMOTnfc)
