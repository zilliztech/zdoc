---
slug: /search-query-and-get
beta: FALSE
notebook: 01_use_customized_schema.ipynb
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Search, Query, and Get

This guide walks you through performing nearest-neighbor searches and queries. A search involves looking for the closest vector to a given vector in a collection, while a query filters out entities that match a certain condition.

## Overview{#overview}

Zilliz Cloud employs Approximate Nearest Neighbor (ANN) search algorithms to process vector search requests. A search returns top-K entities that are most similar to the input query vector. To optimize throughput, bulk search is available, where multiple query vectors are searched in parallel. Filters, defined using boolean expressions, can be optionally applied to narrow down the scope of ANN searches.

On the other hand, a query filters out entities in a collection based on a certain condition defined using boolean expressions. The result of the query is a set of entities that match the specified condition. Unlike a search, which finds the closest vector to a given vector in a collection, queries are used to filter out entities based on specific criteria.

## Before you start{#before-you-start}

Before performing ANN searches and queries, ensure that

- You have connected to a cluster and created a collection. For details, see [Connect to Cluster](./connect-to-cluster) and [Create Collection](./create-collection-2).

- You have downloaded the example dataset and inserted the data into the collection. For details, see [Example Dataset](./example-dataset-1) and [Insert Entities](./insert-entities).

:::info Notes

The collection created in this guide series has a primary key named **id**, and a vector field named **vector**. If you prefer to take full control of the collection’s schema, refer to [Use Customized Schema](./create-collection-with-schema), [Enable Dynamic Schema](./enable-dynamic-schema), and [JavaScript Object Notation (JSON)](./javascript-object-notation-json-1).

:::

## Single-vector search{#single-vector-search}

A single-vector search request involves using only one vector and asking for the top-K entities that are most similar to the input query vector.

Here is an example of a single-vector search.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
with open("medium_articles_2020_dpr.json") as f:
    data = json.load(f)

# 'client' is a MilvusClient instance.
res = client.search(
    collection_name="medium_articles_2020",
    data=[data["rows"][0]["title_vector"]],
    output_fields=["title"]
)

print(res)

# Output:
# [
#    [
#       {'id': 0, 'distance': -1.0, 'entity': {'title': 'The Reported Mortality Rate of Coronavirus Is Not Important'}}, 
#       {'id': 70, 'distance': -0.7525784969329834, 'entity': {'title': 'How bad will the Coronavirus Outbreak get? — Predicting the outbreak figures'}}, 
#       {'id': 160, 'distance': -0.7132074236869812, 'entity': {'title': 'The Funeral Industry is a Killer'}}, 
#       {'id': 111, 'distance': -0.6888885498046875, 'entity': {'title': 'The role of AI in web-based ADA and WCAG compliance'}}, 
#       {'id': 196, 'distance': -0.6882869601249695, 'entity': {'title': 'The Question We Should Be Asking About the Cost of Youth Sports'}}, 
#       {'id': 51, 'distance': -0.6719912886619568, 'entity': {'title': 'What if Facebook had to pay you for the profit they are making?'}}, 
#       {'id': 178, 'distance': -0.6699185371398926, 'entity': {'title': 'Is The Environmental Damage Due To Cruise Ships Irreversible?'}}, 
#       {'id': 47, 'distance': -0.6680259704589844, 'entity': {'title': 'What Happens When the Google Cookie Crumbles?'}}, 
#       {'id': 135, 'distance': -0.6597772836685181, 'entity': {'title': 'How to Manage Risk as a Product Manager'}}
#    ]
# ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
const fs = require("fs")

const data = JSON.parse(fs.readFileSync('path/to/medium_articles_2020_dpr.json', 'utf8'));

res = await client.search({
    collection_name: "medium_articles_2020",
    vector: data.rows[0].title_vector,
    output_fields: ['title', 'link']
})

console.log(res)

// Output:
// {
//   status: { error_code: 'Success', reason: '' },
//   results: [
//     {
//       score: -1,
//       id: '0',
//       title: 'The Reported Mortality Rate of Coronavirus Is Not Important',
//       link: '<https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912>'
//     },
//     {
//       score: -0.8500007390975952,
//       id: '3177',
//       title: 'Following the Spread of Coronavirus',
//       link: '<https://towardsdatascience.com/following-the-spread-of-coronavirus-23626940c125>'
//     },
//     {
//       score: -0.7918509244918823,
//       id: '3441',
//       title: 'Coronavirus shows what ethical Amazon could look like',
//       link: '<https://medium.com/swlh/coronavirus-shows-what-ethical-amazon-could-look-like-7c80baf2c663>'
//     },
//     {
//       score: -0.7819530963897705,
//       id: '938',
//       title: 'Mortality Rate As an Indicator of an Epidemic Outbreak',
//       link: '<https://towardsdatascience.com/mortality-rate-as-an-indicator-of-an-epidemic-outbreak-704592f3bb39>'
//     },
//     {
//       score: -0.7686220407485962,
//       id: '3072',
//       title: 'Can we learn anything from the progression of influenza to analyze the COVID-19 pandemic better?',
//       link: '<https://towardsdatascience.com/can-we-learn-anything-from-the-progression-of-influenza-to-analyze-the-covid-19-pandemic-better-b20a5b3f4933>'
//     }
//   ]
// }
```

</TabItem>

<TabItem value='java'>

```java
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import io.milvus.param.highlevel.dml.InsertRowsParam;
import io.milvus.param.highlevel.dml.QuerySimpleParam;
import io.milvus.param.highlevel.dml.SearchSimpleParam;
import io.milvus.param.highlevel.dml.response.InsertResponse;
import io.milvus.param.highlevel.dml.response.QueryResponse;
import io.milvus.param.highlevel.dml.response.SearchResponse;
import io.milvus.response.QueryResultsWrapper;

public class QuickStart 
{
    public static void main( String[] args )
    {
        ...

        // Change the second argument of the `getRows` function 
        // to limit the number of rows obtained from the dataset.
        List<JSONObject> rows = getRows(dataset.getJSONArray("rows"), 5979);

        // 5. search
        List<List<Float>> queryVectors = new ArrayList<>();
        List<Float> queryVector1 = rows.get(0).getJSONArray("vector").toJavaList(Float.class);
        queryVectors.add(queryVector1);

        List<String> outputFields = new ArrayList<>();
        outputFields.add("title");

        SearchSimpleParam searchSimpleParam = SearchSimpleParam.newBuilder()
            .withCollectionName(collectionName)
            .withVectors(queryVectors)
            .withOutputFields(outputFields)
            .withOffset(0L)
            .withLimit(3L)
            .build();

        R<SearchResponse> searchRes = client.search(searchSimpleParam);

        if (searchRes.getException() != null) {
            System.out.println("Failed to search: " + searchRes.getException().getMessage());
            return;
        }

        for (QueryResultsWrapper.RowRecord rowRecord: searchRes.getData().getRowRecords()) {
            System.out.println(rowRecord);
        }

        // Output
        // [distance:0.0, id:0, title:The Reported Mortality Rate of Coronavirus Is Not Important]
        // [distance:0.29999837, id:3177, title:Following the Spread of Coronavirus]
        // [distance:0.36103836, id:5607, title:The Hidden Side Effect of the Coronavirus]

    }

    // The following is the function used to prepare the data 
    // Put it side by side with the main function.

    public static List<JSONObject> getRows(JSONArray dataset, int counts) {
        List<JSONObject> rows = new ArrayList<JSONObject>();
        for (int i = 0; i < counts; i++) {
            JSONObject json_row = new JSONObject(1, true);
            JSONObject original_row = dataset.getJSONObject(i);
        
            Long id = original_row.getLong("id");
            String title = original_row.getString("title");
            String link = original_row.getString("link");
            String publication = original_row.getString("publication");
            Long reading_time = original_row.getLong("reading_time");
            Long claps = original_row.getLong("claps");
            Long responses = original_row.getLong("responses");
            List<Float> vectors = original_row.getJSONArray("title_vector").toJavaList(Float.class);

            json_row.put("id", id);
            json_row.put("link", link);
            json_row.put("publication", publication);
            json_row.put("reading_time", reading_time);
            json_row.put("claps", claps);
            json_row.put("responses", responses);
            json_row.put("title", title);
            json_row.put("vector", vectors);
            rows.add(json_row);
        }
        return rows;
    }    
}
```

</TabItem>

<TabItem value='go'>

```go
type SearchParameters struct {
    nprobe float64
}

func (s SearchParameters) Params() map[string]interface{} {
    parameters := make(map[string]interface{})
    parameters["nprobe"] = s.nprobe

    return parameters
}

func (s SearchParameters) AddRadius(radius float64) {
}

func (s SearchParameters) AddRangeFilter(rangeFilter float64) {
}

// ===

func main() {
    ...

    vectors := []entity.Vector{}

    for _, row := range data.Rows[:1] {
        vector := make(entity.FloatVector, 0, 768)
        vector = append(vector, row.TitleVector...)
        vectors = append(vectors, vector)
    }

    var sp entity.SearchParam = SearchParameters{1024}

    limit := client.WithLimit(10)
    offset := client.WithOffset(0)

    res, err := conn.Search(
        context.Background(),               // context
        COLLNAME,                           // collectionName
        []string{},                         // partitionNames
        "claps > 30 and reading_time < 10", // expr
        []string{"claps", "reading_time"},  // outputFields
        vectors,                            // vectors
        "title_vector",                     // vectorField
        entity.MetricType("L2"),            // metricType
        5,                                  // topK
        sp,                                 // sp
        limit,                              // opts
        offset,                             // opts
    )

    if err != nil {
        log.Fatal("Failed to insert rows:", err.Error())
    }

    for i, result := range res {
        log.Println("Result counts", i, ":", result.ResultCount)

        ids := result.IDs.FieldData().GetScalars().GetLongData().GetData()
        scores := result.Scores
        titles := result.Fields.GetColumn("title").FieldData().GetScalars().GetStringData().GetData()
        publications := result.Fields.GetColumn("publication").FieldData().GetScalars().GetStringData().GetData()

        for i, record := range ids {
            log.Println("ID:", record, "Score:", scores[i], "Title:", titles[i], "Publication:", publications[i])
        }
    }
}
```

</TabItem>

<TabItem value='bash'>

```bash
# read the first vector from the dataset
vector="$(cat path/to/medium_articles_2020_dpr.json \\
    | jq '.rows[0].title_vector' )"

echo $vector

# Replace uri and API key with your own
curl --request POST \\
     --url "${PUBLIC_ENDPOINT}/v1/vector/search" \\
     --header "Authorization: Bearer ${API_KEY}" \\
     --header 'accept: application/json' \\
     --header 'content-type: application/json' \\
     --data "{
        \\"collectionName\\": \\"medium_articles_2020\\",
        \\"limit\\": 3,
        \\"vector\\": $vector
      }"

# Output:
# {
#   "code":200,
#   "data":[
#     {"distance":0,"id":442147653350123229},
#     {"distance":0.494843,"id":442147653350123300},
#     {"distance":0.65601754,"id":442147653350123281}]
# }
```

</TabItem>
</Tabs>

Before searching a collection, you must define the search parameters. Ensure that the metric type matches the one defined in the index parameters. Then, reference the search parameters in the search request and set the query vector, vector field name, limits, and any other applicable parameters.

The script above searches for articles with title vectors that are most similar to the given vector. The results display the top 5 most similar entities, along with their primary keys and distances.

The search result of a query vector is an iterable hits object. You can iterate over the hits to get a hit object that matches one of the nearest neighbors of the query vector in the search. If you have defined some output fields in the search request, use the `get` method of a hit object to get the value of a defined output field.

## Bulk search{#bulk-search}

You can conduct a bulk search by providing multiple query vectors in a single request. In most cases, bulk search is more efficient than conducting single-vector searches because the total latency is much lower than searching against these query vectors in individual requests.

Note that RESTful API does not support Bulk search. You can use an iteration to iterate over the rows in the dataset and send a search request per row.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
with open("medium_articles_2020_dpr.json") as f:
    data = json.load(f)

# 'client' is a MilvusClient instance.
res = client.search(
    collection_name="medium_articles_2020",
    data=[data["rows"][0]["title_vector"],data["rows"][1]["title_vector"]],  
    output_fields=["title", "link"],
    limit=5
)

print(res)

# Output:
# [
#    [
#      {'id': 1, 'distance': -0.9999998807907104, 'entity': {'title': 'Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else'}},
#      {'id': 4, 'distance': -0.7625510692596436, 'entity': {'title': 'Python NLP Tutorial: Information Extraction and Knowledge Graphs'}}, 
#      {'id': 17, 'distance': -0.7366295456886292, 'entity': {'title': 'Blockchain, IoT and AI — A Perfect Fit'}}, 
#      {'id': 98, 'distance': -0.7285258769989014, 'entity': {'title': 'How To Write Movie Reviews with AI'}}, 
#      {'id': 96, 'distance': -0.712313711643219, 'entity': {'title': 'Feature Selection Techniques in Python: Predicting Hotel Cancellations'}}
#    ], 
#    [
#      {'id': 2, 'distance': -1.0, 'entity': {'title': 'How Can We Best Switch in Python?'}}, 
#      {'id': 36, 'distance': -0.7909263372421265, 'entity': {'title': 'Building a Simple CLI Calculator App in Java'}}, 
#      {'id': 23, 'distance': -0.7671353220939636, 'entity': {'title': 'How Does the Internet Work?'}}, 
#      {'id': 98, 'distance': -0.7641586065292358, 'entity': {'title': 'How To Write Movie Reviews with AI'}}, 
#      {'id': 80, 'distance': -0.7512190341949463, 'entity': {'title': 'Understanding Natural Language Processing: how AI understands our languages'}}
#    ]
# ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
const fs = require("fs")

const data = JSON.parse(fs.readFileSync('path/to/medium_articles_2020_dpr.json', 'utf8'));

res = await client.search({
    collection_name: "medium_articles_2020",
    vectors: [data.rows[0].title_vector, data.rows[1].title_vector],
    limit: 5,
    output_fields: ['title', 'link']
})

// Output:
// {
//   status: { error_code: 'Success', reason: '' },
//   results: [
//     [ [Object], [Object], [Object], [Object], [Object] ],
//     [ [Object], [Object], [Object], [Object], [Object] ]
//   ]
// }
```

</TabItem>

<TabItem value='java'>

```java
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import io.milvus.param.highlevel.dml.InsertRowsParam;
import io.milvus.param.highlevel.dml.QuerySimpleParam;
import io.milvus.param.highlevel.dml.SearchSimpleParam;
import io.milvus.param.highlevel.dml.response.InsertResponse;
import io.milvus.param.highlevel.dml.response.QueryResponse;
import io.milvus.param.highlevel.dml.response.SearchResponse;
import io.milvus.response.QueryResultsWrapper;

public class QuickStart 
{
    public static void main( String[] args )
    {
        ...

        // Change the second argument of the `getRows` function 
        // to limit the number of rows obtained from the dataset.
        List<JSONObject> rows = getRows(dataset.getJSONArray("rows"), 5979);

        // 5. search
        List<List<Float>> queryVectors = new ArrayList<>();
        List<Float> queryVector1 = rows.get(0).getJSONArray("vector").toJavaList(Float.class);
        List<Float> queryVector2 = rows.get(1).getJSONArray("vector").toJavaList(Float.class);
        queryVectors.add(queryVector1, queryVector2);

        List<String> outputFields = new ArrayList<>();
        outputFields.add("title");

        SearchSimpleParam searchSimpleParam = SearchSimpleParam.newBuilder()
            .withCollectionName(collectionName)
            .withVectors(queryVectors)
            .withOutputFields(outputFields)
            .withOffset(0L)
            .withLimit(3L)
            .build();

        R<SearchResponse> searchRes = client.search(searchSimpleParam);

        if (searchRes.getException() != null) {
            System.out.println("Failed to search: " + searchRes.getException().getMessage());
            return;
        }

        for (QueryResultsWrapper.RowRecord rowRecord: searchRes.getData().getRowRecords()) {
            System.out.println(rowRecord);
        }

        // Output
        // [distance:0.0, id:0, title:The Reported Mortality Rate of Coronavirus Is Not Important]
        // [distance:0.29999837, id:3177, title:Following the Spread of Coronavirus]
        // [distance:0.36103836, id:5607, title:The Hidden Side Effect of the Coronavirus]
    }

    // The following is the function used to prepare the data 
    // Put it side by side with the main function.

    public static List<JSONObject> getRows(JSONArray dataset, int counts) {
        List<JSONObject> rows = new ArrayList<JSONObject>();
        for (int i = 0; i < counts; i++) {
            JSONObject json_row = new JSONObject(1, true);
            JSONObject original_row = dataset.getJSONObject(i);
        
            Long id = original_row.getLong("id");
            String title = original_row.getString("title");
            String link = original_row.getString("link");
            String publication = original_row.getString("publication");
            Long reading_time = original_row.getLong("reading_time");
            Long claps = original_row.getLong("claps");
            Long responses = original_row.getLong("responses");
            List<Float> vectors = original_row.getJSONArray("title_vector").toJavaList(Float.class);

            json_row.put("id", id);
            json_row.put("link", link);
            json_row.put("publication", publication);
            json_row.put("reading_time", reading_time);
            json_row.put("claps", claps);
            json_row.put("responses", responses);
            json_row.put("title", title);
            json_row.put("vector", vectors);
            rows.add(json_row);
        }
        return rows;
    }    
}
```

</TabItem>

<TabItem value='go'>

```go
type SearchParameters struct {
    nprobe float64
}

func (s SearchParameters) Params() map[string]interface{} {
    parameters := make(map[string]interface{})
    parameters["nprobe"] = s.nprobe

    return parameters
}

func (s SearchParameters) AddRadius(radius float64) {
}

func (s SearchParameters) AddRangeFilter(rangeFilter float64) {
}

// ===

func main() {
    ...

    vectors := []entity.Vector{}

    for _, row := range data.Rows[:2] {
        vector := make(entity.FloatVector, 0, 768)
        vectors = append(vectors, vector)
    }

    var sp entity.SearchParam = SearchParameters{1024}

    limit := client.WithLimit(10)
    offset := client.WithOffset(0)

    res, err := conn.Search(
        context.Background(),               // context
        COLLNAME,                           // collectionName
        []string{},                         // partitionNames
        "claps > 30 and reading_time < 10", // expr
        []string{"claps", "reading_time"},  // outputFields
        vectors,                            // vectors
        "title_vector",                     // vectorField
        entity.MetricType("L2"),            // metricType
        5,                                  // topK
        sp,                                 // sp
        limit,                              // opts
        offset,                             // opts
    )

    if err != nil {
        log.Fatal("Failed to insert rows:", err.Error())
    }

    for i, result := range res {
        log.Println("Result counts", i, ":", result.ResultCount)

        ids := result.IDs.FieldData().GetScalars().GetLongData().GetData()
        scores := result.Scores
        titles := result.Fields.GetColumn("title").FieldData().GetScalars().GetStringData().GetData()
        publications := result.Fields.GetColumn("publication").FieldData().GetScalars().GetStringData().GetData()

        for i, record := range ids {
            log.Println("ID:", record, "Score:", scores[i], "Title:", titles[i], "Publication:", publications[i])
        }
    }
}
```

</TabItem>
</Tabs>

The number of hits objects in a bulk search result equals the number of query vectors in the search request. You can access the hits object of a query vector using its index in the query vector list.

## Search with filters{#search-with-filters}

A filter is a boolean expression used to specify the conditions for an ANN search. You can use arithmetic, logical, and comparison operators to construct filters.

|  **Operator** |  **Description**                                                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
|  add (&&)     |  True if both operands are true                                                                                                               |
|  or (\|\|)    |  True if either operand is true                                                                                                               |
|  +, -, *, /   |  Addition, subtraction, multiplication, and division                                                                                          |
|  **           |  Exponent                                                                                                                                     |
|  %            |  Modulus                                                                                                                                      |
|  <, >         |  Less than, greater than                                                                                                                      |
|  ==, !=       |  Equal to, not equal to                                                                                                                       |
|  <=, >=       |  Less than or equal to, greater than or equal to                                                                                              |
|  not          |  Reverses the result of a given condition.                                                                                                    |
|  like         |  Compares a value to similar values using wildcard operators.<br/> <br/>  For example, like "prefix%" matches strings that begin with "prefix". |
|  in           |  Tests if an expression matches any value in a list of values.                                                                                |

The following are some example ANN searches with filters:

- Filter articles that readers can finish within 10 to 15 minutes.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
with open("path/to/medium_articles_2020_dpr.json") as f:
    data = json.load(f)

res = client.search(
    collection_name="medium_articles_2020",
    data = [data["rows"][0]["title_vector"]],
    output_fields=["title", "reading_time"],
    limit=5,
    filter="10 < reading_time < 15"
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const fs = require("fs")

const data = JSON.parse(fs.readFileSync('path/to/medium_articles_2020_dpr.json', 'utf8'));

res = await client.search({
    collection_name: "medium_articles_2020",
    vector: data.rows[0].title_vector,
    limit: 5,
    output_fields: ['title', 'reading_time'],
    filter: "10 < reading_time < 15"
})
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.List;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import io.milvus.param.highlevel.dml.SearchSimpleParam;
import io.milvus.param.highlevel.dml.response.SearchResponse;
import io.milvus.response.QueryResultsWrapper;

public class QuickStart 
{
    public static void main( String[] args )
    {
        ...
        List<Float> queryVector = rows.get(0).getJSONArray("vector").toJavaList(Float.class);
        queryVectors.add(queryVector);

        List<String> outputFields = new ArrayList<>();
        outputFields.add("title");
        outputFields.add("reading_time");

        SearchSimpleParam searchSimpleParamWithFilter = SearchSimpleParam.newBuilder()
            .withCollectionName(collectionName)
            .withVectors(queryVectors)
            .withOutputFields(outputFields)
            .withFilter("10 < reading_time < 15")
            .withOffset(0L)
            .withLimit(5L)
            .build();

        R<SearchResponse> searchRes = client.search(searchSimpleParam);

        if (searchRes.getException() != null) {
            System.out.println("Failed to search: " + searchRes.getException().getMessage());
            return;
        }

        for (QueryResultsWrapper.RowRecord rowRecord: searchRes.getData().getRowRecords()) {
            System.out.println(rowRecord);
        }
    }
}
```

</TabItem>

<TabItem value='go'>

```go
func main() {
    ...
    
    limit := client.WithLimit(10)
    offset := client.WithOffset(0)
    
    res, err := conn.Search(
        context.Background(),               // context
        COLLNAME,                           // collectionName
        []string{},                         // partitionNames
        "10 < reading_time < 15",           // expr
        []string{"title", "reading_time"},  // outputFields
        vectors,                            // vectors
        "title_vector",                     // vectorField
        entity.MetricType("L2"),            // metricType
        5,                                  // topK
        sp,                                 // sp
        limit,                              // opts
        offset,                             // opts
    )

    if err != nil {
        log.Fatal("Failed to insert rows:", err.Error())
    }

    for i, result := range res {
        log.Println("Result counts", i, ":", result.ResultCount)

        ids := result.IDs.FieldData().GetScalars().GetLongData().GetData()
        titles := result.Fields.GetColumn("title").FieldData().GetScalars().GetStringData().GetData()
        readingTimes := result.Fields.GetColumn("reading_time").FieldData().GetScalars().GetLongData().GetData()

        for i, record := range ids {
            log.Println("ID:", record, "Title:", titles[i], "Reading time:", readingTimes[i])
        }
    }    
}
```

</TabItem>

<TabItem value='bash'>

```bash
# read the first vector from the dataset
vector="$(cat path/to/medium_articles_2020_dpr.json \\
    | jq '.rows[0].title_vector' )"

echo $vector

# search with filter
curl --request POST \\
     --url "${PUBLIC_ENDPOINT}/v1/vector/search" \\
     --header "Authorization: Bearer ${API_KEY}" \\
     --header 'accept: application/json' \\
     --header 'content-type: application/json' \\
     --data "{
        \\"collectionName\\": \\"medium_articles_2020\\",
        \\"limit\\": 5,
        \\"vector\\": $vector,
        \\"filter\\": \\"10 < reading_time < 15\\",
        \\"outputFields\\": [\\"link\\", \\"reading_time\\"]
      }"
```

</TabItem>
</Tabs>

- Filter articles that have more than 1500 claps and 15 responses.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
with open("path/to/medium_articles_2020_dpr.json") as f:
    data = json.load(f)

res = client.search(
    collection_name="medium_articles_2020",
    data=[data["rows"][0]["title_vector"]],
    output_fields=['title', 'claps', 'responses'],
    limit=5,
    filter='claps > 1500 and responses > 15'
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const fs = require("fs")

const data = JSON.parse(fs.readFileSync('path/to/medium_articles_2020_dpr.json', 'utf8'));

res = await client.search({
    collection_name: "medium_articles_2020",
    vector: data.rows[0].title_vector,
    limit: 5,
    output_fields: ['title', 'claps', 'responses'],
    filter: "claps > 1500 and responses > 15"
})
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.List;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import io.milvus.param.highlevel.dml.SearchSimpleParam;
import io.milvus.param.highlevel.dml.response.SearchResponse;
import io.milvus.response.QueryResultsWrapper;

public class QuickStart 
{
    public static void main( String[] args )
    {
        ...
        List<Float> queryVector = rows.get(0).getJSONArray("vector").toJavaList(Float.class);
        queryVectors.add(queryVector);

        List<String> outputFields = new ArrayList<>();
        outputFields.add("title");
        outputFields.add("claps");
        outputFields.add("responses");

        SearchSimpleParam searchSimpleParamWithFilter = SearchSimpleParam.newBuilder()
            .withCollectionName(collectionName)
            .withVectors(queryVectors)
            .withOutputFields(outputFields)
            .withFilter("claps > 1500 and responses > 15")
            .withOffset(0L)
            .withLimit(5L)
            .build();

        R<SearchResponse> searchRes = client.search(searchSimpleParam);

        if (searchRes.getException() != null) {
            System.out.println("Failed to search: " + searchRes.getException().getMessage());
            return;
        }

        for (QueryResultsWrapper.RowRecord rowRecord: searchRes.getData().getRowRecords()) {
            System.out.println(rowRecord);
        }
    }
}
```

</TabItem>

<TabItem value='go'>

```go
func main() {
    ...
    
    limit := client.WithLimit(10)
    offset := client.WithOffset(0)
    
    res, err := conn.Query(
        context.Background(),                       // context
        COLLNAME,                                   // collectionName
        []string{},                                 // partitionNames
        "claps > 1500 and responses > 15",          // expr
        []string{"title", "claps", "responses"},    // outputFields
        vectors,                            // vectors
        "title_vector",                     // vectorField
        entity.MetricType("L2"),            // metricType
        5,                                  // topK
        sp,                                 // sp
        limit,                              // opts
        offset,                             // opts
    )

    if err != nil {
        log.Fatal("Failed to insert rows:", err.Error())
    }

    for i, result := range res {
        log.Println("Result counts", i, ":", result.ResultCount)

        ids := result.IDs.FieldData().GetScalars().GetLongData().GetData()
        titles := result.Fields.GetColumn("title").FieldData().GetScalars().GetStringData().GetData()
        claps := result.Fields.GetColumn("claps").FieldData().GetScalars().GetLongData().GetData()
        responses := result.Fields.GetColumn("response").FieldData().GetScalars().GetLongData().GetData()

        for i, record := range ids {
            log.Println("ID:", record, "Title:", titles[i], "Claps:", claps[i], "Responses:", responses[i])
        }
    }    
}
```

</TabItem>

<TabItem value='bash'>

```bash
# read the first vector from the dataset
vector="$(cat path/to/medium_articles_2020_dpr.json \\
    | jq '.rows[0].title_vector' )"

echo $vector

# search with filter
curl --request POST \\
     --url "${PUBLIC_ENDPOINT}/v1/vector/search" \\
     --header "Authorization: Bearer ${API_KEY}" \\
     --header 'accept: application/json' \\
     --header 'content-type: application/json' \\
     --data "{
        \\"collectionName\\": \\"medium_articles_2020\\",
        \\"limit\\": 5,
        \\"vector\\": $vector,
        \\"filter\\": \\"claps > 1500 and responses > 15\\",
        \\"outputFields\\": [\\"title\\", \\"claps\\", \\"responses\\"]
      }"
```

</TabItem>
</Tabs>

- Filter articles published by **Towards Data Science**.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
with open("path/to/medium_articles_2020_dpr.json") as f:
    data = json.load(f)

res = client.search(
    collection_name="medium_articles_2020",
    data=[data["rows"][0]["title_vector"]],
    limit=5,
    output_fields=["title", "publication"],
    filter='publication == "Towards Data Science"'
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const fs = require("fs")

const data = JSON.parse(fs.readFileSync('path/to/medium_articles_2020_dpr.json', 'utf8'));

res = await client.search({
    collection_name: "medium_articles_2020",
    vector: data.rows[0].title_vector,
    limit: 5,
    output_fields: ['title', 'publication'],
    filter: 'publication == "Towards Data Science"'
})
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.List;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import io.milvus.param.highlevel.dml.SearchSimpleParam;
import io.milvus.param.highlevel.dml.response.SearchResponse;
import io.milvus.response.QueryResultsWrapper;

public class QuickStart 
{
    public static void main( String[] args )
    {
        ...
        List<Float> queryVector = rows.get(0).getJSONArray("vector").toJavaList(Float.class);
        queryVectors.add(queryVector);

        List<String> outputFields = new ArrayList<>();
        outputFields.add("title");
        outputFields.add("publication");

        SearchSimpleParam searchSimpleParamWithFilter = SearchSimpleParam.newBuilder()
            .withCollectionName(collectionName)
            .withVectors(queryVectors)
            .withOutputFields(outputFields)
            .withFilter("publication == \"Towards Data Science\"")
            .withOffset(0L)
            .withLimit(5L)
            .build();

        R<SearchResponse> searchRes = client.search(searchSimpleParam);

        if (searchRes.getException() != null) {
            System.out.println("Failed to search: " + searchRes.getException().getMessage());
            return;
        }

        for (QueryResultsWrapper.RowRecord rowRecord: searchRes.getData().getRowRecords()) {
            System.out.println(rowRecord);
        }
    }
}
```

</TabItem>

<TabItem value='go'>

```go
func main() {
    ...
    
    limit := client.WithLimit(10)
    offset := client.WithOffset(0)
    
    res, err := conn.Query(
        context.Background(),                       // context
        COLLNAME,                                   // collectionName
        []string{},                                 // partitionNames
        "publication == \"Towards Data Science\"",  // expr
        []string{"title", "publication"},           // outputFields
        vectors,                            // vectors
        "title_vector",                     // vectorField
        entity.MetricType("L2"),            // metricType
        5,                                  // topK
        sp,                                 // sp
        limit,                              // opts
        offset,                             // opts
    )

    if err != nil {
        log.Fatal("Failed to insert rows:", err.Error())
    }

    for i, result := range res {
        log.Println("Result counts", i, ":", result.ResultCount)

        ids := result.IDs.FieldData().GetScalars().GetLongData().GetData()
        titles := result.Fields.GetColumn("title").FieldData().GetScalars().GetStringData().GetData()
        publications := result.Fields.GetColumn("publication").FieldData().GetScalars().GetStringData().GetData()

        for i, record := range ids {
            log.Println("ID:", record, "Title:", titles[i], "Publication:", publications[i])
        }
    }    
}
```

</TabItem>

<TabItem value='bash'>

```bash
# read the first vector from the dataset
vector="$(cat path/to/medium_articles_2020_dpr.json \\
    | jq '.rows[0].title_vector' )"

echo $vector

# search with filter
curl --request POST \\
     --url "${PUBLIC_ENDPOINT}/v1/vector/search" \\
     --header "Authorization: Bearer ${API_KEY}" \\
     --header 'accept: application/json' \\
     --header 'content-type: application/json' \\
     --data "{
        \\"collectionName\\": \\"medium_articles_2020\\",
        \\"limit\\": 5,
        \\"vector\\": $vector,
        \\"filter\\": \\"publication == 'Towards Data Science'\\",
        \\"outputFields\\": [\\"title\\", \\"publication\\"]
      }"
```

</TabItem>
</Tabs>

- Filter articles published by authors rather than **Towards Data Science** or **Personal Growth**.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
with open("path/to/medium_articles_2020_dpr.json") as f:
    data = json.load(f)

res = client.search(
    collection_name="medium_articles_2020",
    data=[data["rows"][0]["title_vector"]],
    output_fields=["title", "publication"],
    limit=5,
    filter='publication not in ["Towards Data Science", "Personal Growth"]'
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const fs = require("fs")

const data = JSON.parse(fs.readFileSync('path/to/medium_articles_2020_dpr.json', 'utf8'));

res = await client.search({
    collection_name: "medium_articles_2020",
    vector: data.rows[0].title_vector,
    limit: 5,
    output_fields: ['title', 'publication'],
    filter: 'publication not in ["Towards Data Science", "Personal Growth"]'
})
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.List;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import io.milvus.param.highlevel.dml.SearchSimpleParam;
import io.milvus.param.highlevel.dml.response.SearchResponse;
import io.milvus.response.QueryResultsWrapper;

public class QuickStart 
{
    public static void main( String[] args )
    {
        ...
        List<Float> queryVector = rows.get(0).getJSONArray("vector").toJavaList(Float.class);
        queryVectors.add(queryVector);

        List<String> outputFields = new ArrayList<>();
        outputFields.add("title");
        outputFields.add("publication");

        SearchSimpleParam searchSimpleParamWithFilter = SearchSimpleParam.newBuilder()
            .withCollectionName(collectionName)
            .withVectors(queryVectors)
            .withOutputFields(outputFields)
            .withFilter("publication not in [\"Towards Data Science\", \"Personal Growth\"]")
            .withOffset(0L)
            .withLimit(5L)
            .build();

        R<SearchResponse> searchRes = client.search(searchSimpleParam);

        if (searchRes.getException() != null) {
            System.out.println("Failed to search: " + searchRes.getException().getMessage());
            return;
        }

        for (QueryResultsWrapper.RowRecord rowRecord: searchRes.getData().getRowRecords()) {
            System.out.println(rowRecord);
        }
    }
}
```

</TabItem>

<TabItem value='go'>

```go
func main() {
    ...
    
    limit := client.WithLimit(10)
    offset := client.WithOffset(0)
    
    res, err := conn.Query(
        context.Background(),                       // context
        COLLNAME,                                   // collectionName
        []string{},                                 // partitionNames
        "publication not in [\"Towards Data Science\", \"Personal Growth\"]",  // expr
        []string{"title", "publication"},           // outputFields
        vectors,                            // vectors
        "title_vector",                     // vectorField
        entity.MetricType("L2"),            // metricType
        5,                                  // topK
        sp,                                 // sp
        limit,                              // opts
        offset,                             // opts
    )

    if err != nil {
        log.Fatal("Failed to insert rows:", err.Error())
    }

    for i, result := range res {
        log.Println("Result counts", i, ":", result.ResultCount)

        ids := result.IDs.FieldData().GetScalars().GetLongData().GetData()
        titles := result.Fields.GetColumn("title").FieldData().GetScalars().GetStringData().GetData()
        publications := result.Fields.GetColumn("publication").FieldData().GetScalars().GetStringData().GetData()

        for i, record := range ids {
            log.Println("ID:", record, "Title:", titles[i], "Publication:", publications[i])
        }
    }    
}
```

</TabItem>

<TabItem value='bash'>

```bash
# read the first vector from the dataset
vector="$(cat path/to/medium_articles_2020_dpr.json \\
    | jq '.rows[0].title_vector' )"

echo $vector

# search with filter
curl --request POST \\
     --url "${PUBLIC_ENDPOINT}/v1/vector/search" \\
     --header "Authorization: Bearer ${API_KEY}" \\
     --header 'accept: application/json' \\
     --header 'content-type: application/json' \\
     --data "{
        \\"collectionName\\": \\"medium_articles_2020\\",
        \\"limit\\": 5,
        \\"vector\\": $vector,
        \\"filter\\": \\"publication not in ['Towards Data Science', 'Personal Growth']\\",
        \\"outputFields\\": [\\"title\\", \\"publication\\"]
      }"
```

</TabItem>
</Tabs>

- Filter articles whose titles start with **Top**.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
with open("path/to/medium_articles_2020_dpr.json") as f:
    data = json.load(f)

res = client.search(
    collection_name="medium_articles_2020",
    data=[data["rows"][0]["title_vector"]],
    output_fields=["title", "link"],
    limit=5,
    filter='title like "Top%"'
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const fs = require("fs")

const data = JSON.parse(fs.readFileSync('path/to/medium_articles_2020_dpr.json', 'utf8'));

res = await client.search({
    collection_name: "medium_articles_2020",
    vector: data.rows[0].title_vector,
    limit: 5,
    output_fields: ['title'],
    filter: 'title like "Top%"'
})
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.List;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import io.milvus.param.highlevel.dml.SearchSimpleParam;
import io.milvus.param.highlevel.dml.response.SearchResponse;
import io.milvus.response.QueryResultsWrapper;

public class QuickStart 
{
    public static void main( String[] args )
    {
        ...
        List<Float> queryVector = rows.get(0).getJSONArray("vector").toJavaList(Float.class);
        queryVectors.add(queryVector);

        List<String> outputFields = new ArrayList<>();
        outputFields.add("title");

        SearchSimpleParam searchSimpleParamWithFilter = SearchSimpleParam.newBuilder()
            .withCollectionName(collectionName)
            .withVectors(queryVectors)
            .withOutputFields(outputFields)
            .withFilter("title like \"Top%\"")
            .withOffset(0L)
            .withLimit(5L)
            .build();

        R<SearchResponse> searchRes = client.search(searchSimpleParam);

        if (searchRes.getException() != null) {
            System.out.println("Failed to search: " + searchRes.getException().getMessage());
            return;
        }

        for (QueryResultsWrapper.RowRecord rowRecord: searchRes.getData().getRowRecords()) {
            System.out.println(rowRecord);
        }
    }
}
```

</TabItem>

<TabItem value='go'>

```go
func main() {
    ...
    
    limit := client.WithLimit(10)
    offset := client.WithOffset(0)
    
    res, err := conn.Query(
        context.Background(),                       // context
        COLLNAME,                                   // collectionName
        []string{},                                 // partitionNames
        "title like \"Top%\"",                      // expr
        []string{"title"},                          // outputFields
        vectors,                            // vectors
        "title_vector",                     // vectorField
        entity.MetricType("L2"),            // metricType
        5,                                  // topK
        sp,                                 // sp
        limit,                              // opts
        offset,                             // opts
    )

    if err != nil {
        log.Fatal("Failed to insert rows:", err.Error())
    }

    for i, result := range res {
        log.Println("Result counts", i, ":", result.ResultCount)

        ids := result.IDs.FieldData().GetScalars().GetLongData().GetData()
        titles := result.Fields.GetColumn("title").FieldData().GetScalars().GetStringData().GetData()

        for i, record := range ids {
            log.Println("ID:", record, "Title:", titles[i])
        }
    }    
}
```

</TabItem>

<TabItem value='bash'>

```bash
# read the first vector from the dataset
vector="$(cat path/to/medium_articles_2020_dpr.json \\
    | jq '.rows[0].title_vector' )"

echo $vector

# search with filter
curl --request POST \\
     --url "${PUBLIC_ENDPOINT}/v1/vector/search" \\
     --header "Authorization: Bearer ${API_KEY}" \\
     --header 'accept: application/json' \\
     --header 'content-type: application/json' \\
     --data "{
        \\"collectionName\\": \\"medium_articles_2020\\",
        \\"limit\\": 5,
        \\"vector\\": $vector,
        \\"filter\\": \\"title like 'Top%'\\",
        \\"outputFields\\": [\\"title\\"]
      }"
```

</TabItem>
</Tabs>

- Filter articles from **Towards Data Science** that readers can finish within 10 to 15 minutes or have more than 1500 responses and 15 claps.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
with open("path/to/medium_articles_2020_dpr.json") as f:
    data = json.load(f)

res = client.search(
    collection_name="medium_articles_2020",
    data=[data["rows"][0]["title_vector"]],
    limit=5,
    output_fields=["title", "publication", "claps", "response", "reading_time"],
    filter='(publication == "Towards Data Science") and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))'
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const fs = require("fs")

const data = JSON.parse(fs.readFileSync('path/to/medium_articles_2020_dpr.json', 'utf8'));

res = await client.search({
    collection_name: "medium_articles_2020",
    vector: data.rows[0].title_vector,
    limit: 5,
    output_fields: ["title", "publication", "claps", "responses", "reading_time"],
    filter: '(publication == "Towards Data Science") and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))'
})
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.List;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import io.milvus.param.highlevel.dml.SearchSimpleParam;
import io.milvus.param.highlevel.dml.response.SearchResponse;
import io.milvus.response.QueryResultsWrapper;

public class QuickStart 
{
    public static void main( String[] args )
    {
        ...
        List<Float> queryVector = rows.get(0).getJSONArray("vector").toJavaList(Float.class);
        queryVectors.add(queryVector);

        List<String> outputFields = new ArrayList<>();
        outputFields.add("title");
        outputFields.add("publication");
        outputFields.add("claps");
        outputFields.add("responses");
        outputFields.add("reading_time");

        SearchSimpleParam searchSimpleParamWithFilter = SearchSimpleParam.newBuilder()
            .withCollectionName(collectionName)
            .withVectors(queryVectors)
            .withOutputFields(outputFields)
            .withFilter("(publication == \"Towards Data Science\") and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))")
            .withOffset(0L)
            .withLimit(5L)
            .build();

        R<SearchResponse> searchRes = client.search(searchSimpleParam);

        if (searchRes.getException() != null) {
            System.out.println("Failed to search: " + searchRes.getException().getMessage());
            return;
        }

        for (QueryResultsWrapper.RowRecord rowRecord: searchRes.getData().getRowRecords()) {
            System.out.println(rowRecord);
        }
    }
}
```

</TabItem>

<TabItem value='go'>

```go
func main() {
    ...
    
    limit := client.WithLimit(10)
    offset := client.WithOffset(0)
    
    res, err := conn.Query(
        context.Background(),                       // context
        COLLNAME,                                   // collectionName
        []string{},                                 // partitionNames
        "(publication == \"Towards Data Science\") and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))",                      // expr
        []string{"title", "publication", "claps", "responses", "reading_time"},                          // outputFields
        vectors,                            // vectors
        "title_vector",                     // vectorField
        entity.MetricType("L2"),            // metricType
        5,                                  // topK
        sp,                                 // sp
        limit,                              // opts
        offset,                             // opts
    )

    if err != nil {
        log.Fatal("Failed to insert rows:", err.Error())
    }

    for i, result := range res {
        log.Println("Result counts", i, ":", result.ResultCount)

        ids := result.IDs.FieldData().GetScalars().GetLongData().GetData()
        titles := result.Fields.GetColumn("title").FieldData().GetScalars().GetStringData().GetData()
        publications := result.Fields.GetColumn("publication").FieldData().GetScalars().GetStringData().GetData()
        claps := result.Fields.GetColumn("claps").FieldData().GetScalars().GetLongData().GetData()
        responses := result.Fields.GetColumn("response").FieldData().GetScalars().GetLongData().GetData()
        readingTimes := result.Fields.GetColumn("reading_time").FieldData().GetScalars().GetLongData().GetData()
        
        for i, record := range ids {
            log.Println("ID:", record, "Title:", titles[i])
        }
    }    
}
```

</TabItem>

<TabItem value='bash'>

```bash
# read the first vector from the dataset
vector="$(cat path/to/medium_articles_2020_dpr.json \\
    | jq '.rows[0].title_vector' )"

echo $vector

# search with filter
curl --request POST \\
     --url "${PUBLIC_ENDPOINT}/v1/vector/search" \\
     --header "Authorization: Bearer ${API_KEY}" \\
     --header 'accept: application/json' \\
     --header 'content-type: application/json' \\
     --data "{
        \\"collectionName\\": \\"medium_articles_2020\\",
        \\"limit\\": 5,
        \\"vector\\": $vector,
        \\"filter\\": \\"(publication == 'Towards Data Science') and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))\\",
        \\"outputFields\\": [\\"title\\", \\"publication\\", \\"claps\\", \\"response\\", \\"reading_time\\"]
      }"
```

</TabItem>
</Tabs>

## Query{#query}

A query filters entities in a collection based on a defined condition using boolean expressions. The query result is a set of matching entities. Unlike a search that finds the closest vector to a given vector in a collection, queries filter entities based on specific criteria.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.query(
                collection_name="medium_articles_2020",
    filter='(publication == \\"Towards Data Science\\") and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))',
    output_fields=["title", "link"]    
)

print(res)

# Output:
# [
#     {
#        'title': 'Top 10 In-Demand programming languages to learn in 2020', 
#        'link': '<https://towardsdatascience.com/top-10-in-demand-programming-languages-to-learn-in-2020-4462eb7d8d3e>', 
#        'id': 69
#     }, 
#     {
#         'title': 'Data Cleaning in Python: the Ultimate Guide (2020)', 
#         'link': '<https://towardsdatascience.com/data-cleaning-in-python-the-ultimate-guide-2020-c63b88bf0a0d>', 
#         'id': 73
#    }, 
#    ...
# ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.query({
    collection_name: "medium_articles_2020",
    filter: '(publication == \\"Towards Data Science\\")\\
            and ((claps > 1500 and responses > 15)\\
            or (10 < reading_time < 15))',
    output_fields: ["title", "link"]
});

// Output:
// {
//   status: { error_code: 'Success', reason: '' },
//   data: [
//     {
//       title: 'Top 10 In-Demand programming languages to learn in 2020',
//       link: '<https://towardsdatascience.com/top-10-in-demand-programming-languages-to-learn-in-2020-4462eb7d8d3e>',
//       id: '69'
//     },
//     {
//       title: 'Data Cleaning in Python: the Ultimate Guide (2020)',
//       link: '<https://towardsdatascience.com/data-cleaning-in-python-the-ultimate-guide-2020-c63b88bf0a0d>',
//       id: '73'
//     },
//     {
//       title: 'Top Trends of Graph Machine Learning in 2020',
//       link: '<https://towardsdatascience.com/top-trends-of-graph-machine-learning-in-2020-1194175351a3>',
//       id: '75'
//     },
//     ...
//   ]
// }
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.List;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import io.milvus.param.highlevel.dml.QuerySimpleParam;
import io.milvus.param.highlevel.dml.response.QueryResponse;
import io.milvus.response.QueryResultsWrapper;

public class QuickStart 
{
    public static void main( String[] args )
    {
        ...
        List<String> outputFields = new ArrayList<>();
        outputFields.add("publication");
        outputFields.add("claps");

        QuerySimpleParam querySimpleParam = QuerySimpleParam.newBuilder()
            .withCollectionName(collectionName)
            .withFilter("claps > 100 and publication in [\"The Startup\", \"Towards Data Science\"]")
            .withOutputFields(outputFields)
            .withOffset(0L)
            .withLimit(3L)
            .build();

        R<QueryResponse> queryRes = client.query(querySimpleParam);

        if (queryRes.getException() != null) {
            System.out.println("Failed to query: " + queryRes.getException().getMessage());
            return;
        }

        for (QueryResultsWrapper.RowRecord rowRecord: queryRes.getData().getRowRecords()) {
            System.out.println(rowRecord);
        }
    }
}
```

</TabItem>

<TabItem value='go'>

```go
func main() {
    ...

    res, err := conn.Query(
        context.Background(),               // context
        COLLNAME,                           // collectionName
        []string{},                         // partitionNames
        "10 < reading_time < 15",           // expr
        []string{"title", "reading_time"},  // outputFields
        limit,                              // opts
        offset,                             // opts
    )

    if err != nil {
        log.Fatal("Failed to insert rows:", err.Error())
    }

    for i, result := range res {
        log.Println("Result counts", i, ":", result.ResultCount)

        ids := result.IDs.FieldData().GetScalars().GetLongData().GetData()
        titles := result.Fields.GetColumn("title").FieldData().GetScalars().GetStringData().GetData()
        readingTimes := result.Fields.GetColumn("reading_time").FieldData().GetScalars().GetLongData().GetData()

        for i, record := range ids {
            log.Println("ID:", record, "Title:", titles[i], "Reading time:", readingTimes[i])
        }
    }

}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \\
     --url "${PUBLIC_ENDPOINT}/v1/vector/query" \\
     --header "Authorization: Bearer ${API_KEY}" \\
     --header 'accept: application/json' \\
     --header 'content-type: application/json' \\
     --data "{
        \\"collectionName\\": \\"medium_articles_2020\\",
        \\"filter\\": \\"(publication == 'Towards Data Science') and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))\\",
        \\"outputFields\\": [\\"title\\", \\"link\\"]
      }"

# Output:
# {
#      "code": 200,
#      "data": [
#           {
#                "id": 442169042773502140,
#                "link": "<https://towardsdatascience.com/top-10-in-demand-programming-languages-to-learn-in-2020-4462eb7d8d3e>",
#                "title": "Top 10 In-Demand programming languages to learn in 2020"
#           },
#           {
#                "id": 442169042773502140,
#                "link": "<https://towardsdatascience.com/data-cleaning-in-python-the-ultimate-guide-2020-c63b88bf0a0d>",
#                "title": "Data Cleaning in Python: the Ultimate Guide (2020)"
#           },
#           ...
#      ]
# }
```

</TabItem>
</Tabs>

As demonstrated in the example above, the query result is a list of dictionaries. Each dictionary contains an `id` key and the keys specified in the output fields.

## Related topics{#related-topics}

- [Drop Collection](./drop-collection-1) 

- [Use Customized Schema](./create-collection-with-schema) 

- [Enable Dynamic Schema](./enable-dynamic-schema) 

- [JavaScript Object Notation (JSON)](./javascript-object-notation-json-1) 
