---
slug: /use-partition-key
beta: FALSE
notebook: 03_use_partition_key.ipynb
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Use Partition Key

This guide walks you through using partition key to accelerate data retrieval from your collection.

Partition key enables Zilliz Cloud to store entities into different partitions based on their key values. This way, you can group entities with the same key together and avoid scanning irrelevant partitions when filtering by the key field. Partition keys can greatly speed up query performance compared to traditional filtering methods.

## Before you start{#before-you-start}

Before creating a collection, ensure that

- You have a blueprint of your data model (i.e. schema). For details, see [Schema Explained](./data-models-explained).

- You have created a dedicated cluster. For details, see [Create Cluster](./create-cluster).

- You have downloaded the example dataset. For details, see [Example Dataset](./example-dataset-1).

:::info Notes

You can [download the source code](https://assets.zilliz.com/zdoc/zilliz_cloud_sdk_examples.zip) of this guide for your reference while reading this guide.

:::

## Create collection with partition key enabled{#create-collection-with-partition-key-enabled}

To demonstrate the use of partition keys, we will continue to use the example dataset that contains over 5,000 articles, and `publication` will serve as the partition key.

The schema of the collection to be created is similar to the one specified in [Use Customized Schema](./create-collection-with-schema) except for the settings of the `publication` field.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 2. Define fields
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=512),   
    FieldSchema(name="title_vector", dtype=DataType.FLOAT_VECTOR, dim=768),
    FieldSchema(name="link", dtype=DataType.VARCHAR, max_length=512),
    FieldSchema(name="reading_time", dtype=DataType.INT64),
    # set `is_partition_key` to `true` for the field `publication`
    FieldSchema(name="publication", dtype=DataType.VARCHAR, is_partition_key = True, max_length=512),
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
        name: "title_vector",
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
        // set `is_partition_key` to `true` for the field `publication`
        is_partition_key: true
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
    // Use `withPartitionKey()` to set the field `publication` as the partition key
    .withPartitionKey(true)
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
        // Use `WithIsPartitionKey()` to set the field `publication` as the partition key
        WithIsPartitionKey(true).
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

After you have defined the fields, create a schema for the collection.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 3. Build the schema
schema = CollectionSchema(
    fields,
    description="Schema of Medium articles",
    # This is an alternative to `is_partition_key` in field settings.
    partition_key_field="publication"
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 3. Build the requst for creating a collection

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
    .addFieldType(title_vector)
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
                title_vector,
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

Finally, you can create a collection using the collection schema just defined.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 4. Create collection
collection = Collection(
    name="medium_articles", 
    description="Medium articles published between Jan and August in 2020 in prominent publications",
    schema=schema
)
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

## Conduct ANN search using partition key{#conduct-ann-search-using-partition-key}

Once you have indexed and loaded the collection as well as inserted data as described in [Use Customized Schema](./create-collection-with-schema), you can conduct an ANN search using the partition key. 

To conduct an ANN search using the partition key, you should include either of the following in the boolean expression of the search request:

- `expr='<partition_key>=="xxxx"'`

- `expr='<partition_key> in ["xxx", "xxx"]'`

Do replace `<partition_key>` with the name of the field that is designated as the partition key.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 8. Search data

result = collection.search(
    data=[rows[0]['title_vector']],
    anns_field="title_vector",
    param={"metric_type": "L2", "params": {"nprobe": 10}},
    limit=3,
    expr='claps > 30 and reading_time < 10 and publication in ["Towards Data Science", "Personal Growth"]',
    output_fields=["title", "link" ],
)

# Get all returned IDs
# results[0] indicates the result 
# of the first query vector in the 'data' list
ids = result[0].ids

print(ids)

# Output:
#
# [5607, 5641, 3441]

# Get the distance from 
# all returned vectors to the query vector.
distances = result[0].distances

print(distances)

# Output:
#
# [0.36103835701942444, 0.37674015760421753, 0.4162980318069458]

# Get the values of the output fields
# specified in the search request
hits = result[0]
for hit in hits:
    print(hit.entity.get("title"))
    print(hit.entity.get("link"))

# Output:
#
# The Hidden Side Effect of the Coronavirus
# <https://medium.com/swlh/the-hidden-side-effect-of-the-coronavirus-b6a7a5ee9586>
# Why The Coronavirus Mortality Rate is Misleading
# <https://towardsdatascience.com/why-the-coronavirus-mortality-rate-is-misleading-cc63f571b6a6>
# Coronavirus shows what ethical Amazon could look like
# <https://medium.com/swlh/coronavirus-shows-what-ethical-amazon-could-look-like-7c80baf2c663>
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 8. Search data

// You should include the following in the async function declaration

res = await client.search({
    collection_name,
    vector: rows[0].title_vector,
    limit: 3,
    filter: "claps > 30 and reading_time < 10 and publication in [\"Towards Data Science\", \"Personal Growth\"]",
    output_fields: ["title", "link"]
});

console.log(res);

// Output:
// {
//   status: { error_code: 'Success', reason: '' },
//   results: [
//     {
//       score: -0.8194807767868042,
//       id: '5607',
//       title: 'The Hidden Side Effect of the Coronavirus',
//       link: '<https://medium.com/swlh/the-hidden-side-effect-of-the-coronavirus-b6a7a5ee9586>'
//     },
//     {
//       score: -0.8116300106048584,
//       id: '5641',
//       title: 'Why The Coronavirus Mortality Rate is Misleading',
//       link: '<https://towardsdatascience.com/why-the-coronavirus-mortality-rate-is-misleading-cc63f571b6a6>'
//     },
//     {
//       score: -0.7918509244918823,
//       id: '3441',
//       title: 'Coronavirus shows what ethical Amazon could look like',
//       link: '<https://medium.com/swlh/coronavirus-shows-what-ethical-amazon-could-look-like-7c80baf2c663>'
//     }
//   ]
// }
```

</TabItem>

<TabItem value='java'>

```java
// 8. Search data

// You should include the following in the main function

List<List<Float>> queryVectors = new ArrayList<>();
List<Float> queryVector = rows.get(0).getJSONArray("title_vector").toJavaList(Float.class);
queryVectors.add(queryVector);

// Prepare the outputFields
List<String> outputFields = new ArrayList<>();
outputFields.add("title");
outputFields.add("link");

// Search vectors in a collection
SearchParam searchParam = SearchParam.newBuilder()
    .withCollectionName("medium_articles")
    .withVectorFieldName("title_vector")
    .withVectors(queryVectors)
    .withExpr("claps > 30 and reading_time < 10 and publication in [\"Towards Data Science\", \"Personal Growth\"]")
    .withTopK(3)   
    .withMetricType(MetricType.L2)  
    .withParams("{\\"nprobe\\":10,\\"offset\\":2, \\"limit\\":3}")
    .withConsistencyLevel(ConsistencyLevelEnum.BOUNDED)
    .withOutFields(outputFields)
    .build();

R<SearchResults> response = client.search(searchParam);

SearchResultsWrapper wrapper = new SearchResultsWrapper(response.getData().getResults());
System.out.println("Search results");

for (int i = 0; i < queryVectors.size(); ++i) {
    List<SearchResultsWrapper.IDScore> scores = wrapper.getIDScore(i);
        List<String> titles = (List<String>) wrapper.getFieldData("title", i);
    for (int j = 0; j < scores.size(); ++j) {
        SearchResultsWrapper.IDScore score = scores.get(j);
        System.out.println("Top " + j + " ID:" + score.getLongID() + " Distance:" + score.getScore());
                System.out.println("Title: " + titles.get(j));    
        }
}

// Output
// Search results
// Top 0 ID:442206870369024034 Distance:0.41629803
// Title: Coronavirus shows what ethical Amazon could look like
// Top 1 ID:442206870369021531 Distance:0.4360938
// Title: Mortality Rate As an Indicator of an Epidemic Outbreak
// Top 2 ID:442206870369024868 Distance:0.48886314
// Title: How Can AI Help Fight Coronavirus?
```

</TabItem>

<TabItem value='go'>

```go

// 8. Search data

// You should include the following in the main function

vectors := []entity.Vector{}

for _, row := range data.Rows[:1] {
        vector := make(entity.FloatVector, 0, 768)
        vector = append(vector, row.TitleVector...)
        vectors = append(vectors, vector)
}

// Prepare the search parameters
sp := searchParams{10}

// Start the search
searchResults, err := conn.Search(
        context.Background(),
        "medium_articles",                // collection name
        []string{},                       // partition name
        "claps > 30 and reading_time < 10 and publication in [\"Towards Data Science\", \"Personal Growth\"]",                               // boolean expression
        []string{"title", "publication"}, // output fields
        vectors,                          // query vectors
        "title_vector",                   // vector field name
        entity.MetricType("L2"),          // metric type
        3,                                // topK
        sp,                               // search parameters
)

if err != nil {
        log.Fatal("Failed to search:", err.Error())
}

// Parse the search results
for i, sr := range searchResults {
        log.Println("Result counts", i, ":", sr.ResultCount)

        ids := sr.IDs.FieldData().GetScalars().GetLongData().GetData()
        scores := sr.Scores
        titles := sr.Fields.GetColumn("title").FieldData().GetScalars().GetStringData().GetData()
        publications := sr.Fields.GetColumn("publication").FieldData().GetScalars().GetStringData().GetData()

        for i, record := range ids {
                log.Println("ID:", record, "Score:", scores[i], "Title:", titles[i], "Publication:", publications[i])
        }

}

// Output
// 2023/06/17 17:28:28 Result counts 0 : 3
// 2023/06/17 17:28:28 ID: 0 Score: 0 Title: The Reported Mortality Rate of Coronavirus Is Not Important Publication: The Startup
// 2023/06/17 17:28:28 ID: 3177 Score: 0.29999837 Title: Following the Spread of Coronavirus Publication: Towards Data Science
// 2023/06/17 17:28:28 ID: 5607 Score: 0.36103836 Title: The Hidden Side Effect of the Coronavirus Publication: The Startup

// =======================================================
// You should include the following in type definitions

// Define these struct and function to prepare the search parameters
type searchParams struct {
        nprobe int64
}

func (sp searchParams) Params() map[string]interface{} {
        return map[string]interface{}{
                "nprobe": sp.nprobe,
        }
}
```

</TabItem>
</Tabs>

## Typical use cases{#typical-use-cases}

You can use the partition key feature to achieve multi-tenancy with better search performance.

To do this, you can assign a tenant-specific value as the partition key field for each entity. Then, when you search or query the collection, you can include the partition key field in the boolean expression to filter entities by the tenant-specific value. This way, you can implement data isolation by tenants and avoid scanning unnecessary partitions.

## Related topics{#related-topics}

- [Use Customized Schema](./create-collection-with-schema) 

- [Enable Dynamic Schema](./enable-dynamic-schema) 

- [JavaScript Object Notation (JSON)](./javascript-object-notation-json-1) 

