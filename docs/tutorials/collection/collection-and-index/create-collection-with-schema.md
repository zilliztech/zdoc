---
slug: /create-collection-with-schema
beta: FALSE
notebook: 01_use_customized_schema.ipynb
sidebar_position: 2
---



# Create Collection with Schema

This guide walks you through how to use a customized schema in a collection.

## Before you start{#before-you-start}

Before creating a collection, ensure that

- You are equipped with a detailed blueprint of your data model, or schema. Dive deeper into this by checking out the [Schema Explained](./data-models-explained).

- You have established a dedicated cluster. Get a walkthrough on this in [Create Cluster](./create-cluster).

- You have obtained the example dataset for practice. Details can be found at [Example Dataset](./example-dataset-1).

## Procedure{#procedure}

In production settings, it's best practice to utilize a custom schema over a dynamic one. This guarantees your data is stored precisely as intended. To define a custom data model:

1. Detail each field in the collection by providing its name and data type.
    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
    <TabItem value='python'>

    ```python
    # 2. Define fields
    fields = [
        FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
        FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=512),   
        FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=768),
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
    // 2. Define Fields
    
    // You should include the following in the async function declaration.
    
    const fields = [
        {
            name: "id",
            data_type: DataType.Int64,
            is_primary_key: true
        },
        {
            name: "title",
            data_type: DataType.VarChar,
            max_length: 512,
        },
        {
            name: "vector",
            data_type: DataType.FloatVector,
            dim: 768,
        },
        {
            name: "link",
            data_type: DataType.VarChar,
            max_length: 512,
        },
        {
            name: "reading_time",
            data_type: DataType.Int64,
        },
        {
            name: "publication",
            data_type: DataType.VarChar,
            max_length: 512,
        },
        {
            name: "claps",
            data_type: DataType.Int64,
        },
        {
            name: "responses",
            data_type: DataType.Int64,
        },
    ];
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // 2. Define fields
    
    // You should include the following in the main function
    
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
        .withName("vector")
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
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // 2. Define fields
    
    // You should include the following in the main function
    
    id := entity.NewField().
            WithName("id").
            WithDataType(entity.FieldTypeInt64).
            WithIsPrimaryKey(true)
    
    title := entity.NewField().
            WithName("title").
            WithDataType(entity.FieldTypeVarChar).
            WithMaxLength(512)
    
    title_vector := entity.NewField().
            WithName("vector").
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
    ```

    </TabItem>
    </Tabs>

1. After delineating the fields, draft a schema tailored to your collection.
    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
    <TabItem value='python'>

    ```python
    # 3. Build the schema
    schema = CollectionSchema(
        fields,
        description="Schema of Medium articles",
        enable_dynamic_field=False
    )
    
    # 4. Set index parameters
    index_params = {
        "index_type": "AUTOINDEX",
        "metric_type": "L2",
        "params": {"nlist": 128}
    }
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // 3. Build the request for creating a collection
    
    // You should include the following in the async function declaration.
    
    const collection_name = "medium_articles";
    
    const req = {
        collection_name,
        fields
    }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // 3. Build the schema
    
    // You should include the following in the main function
    
    CreateCollectionParam createCollectionParam = CreateCollectionParam.newBuilder()
        .withCollectionName("medium_articles")
        .withDescription("Schema of Medium articles")
        .addFieldType(id)
        .addFieldType(title)
        .addFieldType(vector)
        .addFieldType(link)
        .addFieldType(reading_time)
        .addFieldType(publication)
        .addFieldType(claps)
        .addFieldType(responses)
        .withEnableDynamicField(true)
        .build();
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // 3. Build the schema
    
    // You should include the following in the main function
    
    schema := &entity.Schema{
            CollectionName: "medium_articles",
            Description:    "Medium articles published between Jan and August in 2020 in prominent publications",
            AutoID:         true,
            Fields: []*entity.Field{
                    id,
                    title,
                    vector,
                    link,
                    reading_time,
                    publication,
                    claps,
                    responses,
            },
    }
    ```

    </TabItem>
    </Tabs>

1. With the schema in hand, you are set to initiate the creation of your collection.
    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
    <TabItem value='python'>

    ```python
    # 4. Create collection
    
    client.create_collection_with_schema(
        collection_name="medium_articles",
        description="Medium articles published between Jan and August in 2020 in prominent publications",
        schema=schema,
        index_params=index_params
    )
    
    # Till now, you have created a collection with customized schema.
    # Zilliz Cloud also creates an index file and loads it into memory.
    
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // 4. Create collection
    
    // You should include the following in the async function declaration
    
    let res = await client.createCollection(req);
    
    console.log(res)
    
    // Output
    // { error_code: 'Success', reason: '' }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // 4. Create collection
    
    // You should include the following in the main function
    
    R<RpcStatus> collection = client.createCollection(createCollectionParam);
    
    if (collection.getException() != null) {
        System.out.println("Failed to create collection: " + collection.getException().getMessage());
        return;
    }
    
    System.out.println("Collection created!");
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // 4. Create collection
    
    // You should include the following in the main function
    
    colerr := conn.CreateCollection(context.Background(), schema, 2)
    
    if colerr != nil {
            log.Fatal("Failed to create collection:", colerr.Error())
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

- **Structured data types**: [JSON](./javascript-object-notation-json-1) and [Array](./undefined)

Harness these types as building blocks for your collection's schema.

## Related topics{#related-topics}

- [Enable Dynamic Schema](./enable-dynamic-schema) 

- [Use Partition Key](./use-partition-key) 

- [JavaScript Object Notation (JSON)](./javascript-object-notation-json-1) 
