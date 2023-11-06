---
slug: /search-query-and-get
beta: FALSE
notebook: 01_use_customized_schema.ipynb
sidebar_position: 1
---

import Admonition from '@theme/Admonition';
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

<Admonition type="info" icon="📘" title="Notes">

The collection created in this guide series has a primary key named **id**, and a vector field named **vector**. If you prefer to take full control of the collection’s schema, refer to [Use Customized Schema](./create-collection-with-schema), [Enable Dynamic Schema](./enable-dynamic-schema), and [JavaScript Object Notation (JSON)](./javascript-object-notation-json-1).

</Admonition>

## Search{#search}

### Single-vector search{#single-vector-search}

A single-vector search request involves using only one vector and asking for the top-K entities that are most similar to the input query vector.

Here is an example of a single-vector search.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
# Search using a MilvusClient object
# For search using a Collection object, scroll down.

from pymilvus import MilvusClient

# (Continued)

# Read the dataset
with open(DATASET_PATH) as f:
    data = json.load(f)

# Conduct an ANN search
res = client.search(
    collection_name=COLLECTION_NAME,
    data=[data["rows"][0]["title_vector"]],
    output_fields=["title"]
)

print(res)

# Output
#
# [
#     [
#         {
#             "id": 0,
#             "distance": 1.0,
#             "entity": {
#                 "title": "The Reported Mortality Rate of Coronavirus Is Not Important"
#             }
#         },
#         {
#             "id": 70,
#             "distance": 0.7525784969329834,
#             "entity": {
#                 "title": "How bad will the Coronavirus Outbreak get? \u2014 Predicting the outbreak figures"
#             }
#         },
#         {
#             "id": 160,
#             "distance": 0.7132074236869812,
#             "entity": {
#                 "title": "The Funeral Industry is a Killer"
#             }
#         },
#         {
#             "id": 111,
#             "distance": 0.6888885498046875,
#             "entity": {
#                 "title": "The role of AI in web-based ADA and WCAG compliance"
#             }
#         },
#         {
#             "id": 196,
#             "distance": 0.6882869601249695,
#             "entity": {
#                 "title": "The Question We Should Be Asking About the Cost of Youth Sports"
#             }
#         },
#         {
#             "id": 51,
#             "distance": 0.6719912886619568,
#             "entity": {
#                 "title": "What if Facebook had to pay you for the profit they are making?"
#             }
#         },
#         {
#             "id": 178,
#             "distance": 0.6699185371398926,
#             "entity": {
#                 "title": "Is The Environmental Damage Due To Cruise Ships Irreversible?"
#             }
#         },
#         {
#             "id": 47,
#             "distance": 0.6680259704589844,
#             "entity": {
#                 "title": "What Happens When the Google Cookie Crumbles?"
#             }
#         },
#         {
#             "id": 135,
#             "distance": 0.6597772836685181,
#             "entity": {
#                 "title": "How to Manage Risk as a Product Manager"
#             }
#         }
#     ]
# ]

# =============

# Search with a Collection object
from pymilvus import Collection

# 8. Search data
# Metric type should be the same as
# that defined in the index parameters 
# used to create the index.
search_params = {
    "metric_type": "L2"
}

results = collection.search(
    data=[data["rows"][0]["title_vector"]],
    anns_field="title_vector",
    param=search_params,
    output_fields=["title", "link"],
    limit=5
)

# Get all returned IDs
# results[0] indicates the result 
# of the first query vector in the 'data' list
ids = results[0].ids

print(ids)

# Output
#
# [0, 3177, 5607, 5641, 3441]

# Get the distance from 
# all returned vectors to the query vector.
distances = results[0].distances

print(distances)

# Output
#
# [0.0, 0.29999837279319763, 0.36103835701942444, 0.37674015760421753, 0.4162980318069458]

# Get the values of the output fields
# specified in the search request
entities = [ x.entity.to_dict()["entity"] for x in results[0] ]

print(entities)

# Output
#
# [
#     {
#         "title": "The Reported Mortality Rate of Coronavirus Is Not Important",
#         "link": "https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912"
#     },
#     {
#         "title": "Following the Spread of Coronavirus",
#         "link": "https://towardsdatascience.com/following-the-spread-of-coronavirus-23626940c125"
#     },
#     {
#         "title": "The Hidden Side Effect of the Coronavirus",
#         "link": "https://medium.com/swlh/the-hidden-side-effect-of-the-coronavirus-b6a7a5ee9586"
#     },
#     {
#         "title": "Why The Coronavirus Mortality Rate is Misleading",
#         "link": "https://towardsdatascience.com/why-the-coronavirus-mortality-rate-is-misleading-cc63f571b6a6"
#     },
#     {
#         "title": "Coronavirus shows what ethical Amazon could look like",
#         "link": "https://medium.com/swlh/coronavirus-shows-what-ethical-amazon-could-look-like-7c80baf2c663"
#     }
# ]

```

</TabItem>

<TabItem value='javascript'>

```javascript
async function main() {

    // (Continued)
    
    // 6. Coduct an ANN search

    res = await client.search({
        collection_name: collectionName,
        vector: rows[0].title_vector,
        limit: 5,
        output_fields: ["title", "link"]
    });
    
    console.log(res);

    // Output
    // 
    // {
    //   status: { error_code: 'Success', reason: '', code: 0 },
    //   results: [
    //     {
    //       score: 0.36103832721710205,
    //       id: '5607',
    //       title: 'The Hidden Side Effect of the Coronavirus',
    //       link: 'https://medium.com/swlh/the-hidden-side-effect-of-the-coronavirus-b6a7a5ee9586'
    //     },
    //     {
    //       score: 0.37674015760421753,
    //       id: '5641',
    //       title: 'Why The Coronavirus Mortality Rate is Misleading',
    //       link: 'https://towardsdatascience.com/why-the-coronavirus-mortality-rate-is-misleading-cc63f571b6a6'
    //     },
    //     {
    //       score: 0.416297972202301,
    //       id: '3441',
    //       title: 'Coronavirus shows what ethical Amazon could look like',
    //       link: 'https://medium.com/swlh/coronavirus-shows-what-ethical-amazon-could-look-like-7c80baf2c663'
    //     },
    //     {
    //       score: 0.436093807220459,
    //       id: '938',
    //       title: 'Mortality Rate As an Indicator of an Epidemic Outbreak',
    //       link: 'https://towardsdatascience.com/mortality-rate-as-an-indicator-of-an-epidemic-outbreak-704592f3bb39'
    //     },
    //     {
    //       score: 0.48886317014694214,
    //       id: '4275',
    //       title: 'How Can AI Help Fight Coronavirus?',
    //       link: 'https://medium.com/swlh/how-can-ai-help-fight-coronavirus-60f2182de93a'
    //     }
    //   ]
    // }
    // 
}
```

</TabItem>

<TabItem value='java'>

```java
public class UseCustomizedSchemaDemo 
{
    public static void main( String[] args )
    {
        // (Continued)
        String data_file = "/medium_articles_2020_dpr.json";
        String content;

        // read a local file
        Path file = Path.of(data_file);
        try {
            content = Files.readString(file);
        } catch (Exception e) {
            System.err.println("Failed to read file: " + e.getMessage());
            return;
        }

        System.out.println("Successfully read file");

        // Output:
        // Successfully read file

        // Load dataset
        JSONObject dataset = JSON.parseObject(content);

        // Insert your data in rows, all the fields not pre-defined in the schema 
        // are recognized as pre-defined schema
        List<JSONObject> rows = getRows(dataset.getJSONArray("rows"), 1000);
        
        List<String> ids = Lists.newArrayList("1");
        // List<String> ids = Lists.newArrayList("1", "2", "3");
        
        // 7. Search vectors
        List<List<Float>> queryVectors = new ArrayList<>();
        List<Float> queryVector1 = rows.get(0).getJSONArray("title_vector").toJavaList(Float.class);
        queryVectors.add(queryVector1);

        List<String> outputFields = new ArrayList<>();
        outputFields.add("title");
        outputFields.add("link");

        // Search vector in a collection

        SearchParam searchParam1 = SearchParam.newBuilder()
            .withCollectionName(collectionName)
            .withVectorFieldName("title_vector")
            .withVectors(queryVectors)
            .withTopK(5)   
            .withMetricType(MetricType.L2)  
            .withParams("{\"nprobe\":10,\"offset\":2, \"limit\":3}")
            .withConsistencyLevel(ConsistencyLevelEnum.BOUNDED)
            .withOutFields(outputFields)
            .build();

        R<SearchResults> response1 = client.search(searchParam1);

        SearchResultsWrapper wrapper1 = new SearchResultsWrapper(response1.getData().getResults());

        List<List<JSONObject>> results1 = new ArrayList<>();

        for (int i = 0; i < queryVectors.size(); ++i) {
            List<SearchResultsWrapper.IDScore> scores = wrapper1.getIDScore(i);
            List<String> titles = (List<String>) wrapper1.getFieldData("title", i);
            List<String> links = (List<String>) wrapper1.getFieldData("link", i);
            List<JSONObject> entities = new ArrayList<>();
            for (int j = 0; j < scores.size(); ++j) {
                SearchResultsWrapper.IDScore score = scores.get(j);
                JSONObject entity = new JSONObject();
                entity.put("id", score.getLongID());
                entity.put("distance", score.getScore());
                entity.put("title", titles.get(j));
                entity.put("link", links.get(j));
                entities.add(entity);
            }

            results1.add(entities);
        } 

        System.out.println(results1);

        // Output:
        // [[{"distance":0.6560175,"link":"https://medium.com/swlh/what-if-facebook-had-to-pay-you-for-the-profit-they-are-making-7571115139a7","id":445453895050486638,"title":"What if Facebook had to pay you for the profit they are making?"}, {"distance":0.663948,"link":"https://medium.com/swlh/what-happens-when-the-google-cookie-crumbles-a0405ef97bf1","id":445453895050486634,"title":"What Happens When the Google Cookie Crumbles?"}, {"distance":0.7018132,"link":"https://medium.com/personal-growth/a-psychologist-explains-how-anyone-can-beat-social-anxiety-7992014ced88","id":445453895050486655,"title":"A Clinical Psychologist Explains How to Beat Social Anxiety"}, {"distance":0.72767186,"link":"https://medium.com/swlh/building-comprehensible-customer-churn-prediction-models-ca61ecce529d","id":445453895050486594,"title":"Building Comprehensible Customer Churn Prediction Models"}, {"distance":0.7282397,"link":"https://medium.com/swlh/bad-luck-or-bad-strategy-9c3ca2352a3b","id":445453895050486646,"title":"Bad Luck? or Bad Strategy?"}]]
    }
}
```

</TabItem>

<TabItem value='go'>

```go
func main() {

        // (Continued)
    
        // 8. Search

        fmt.Println("Start searching ...")

        vectors := []entity.Vector{}

        for _, row := range data.Rows[:1] {
                vector := make(entity.FloatVector, 0, 768)
                vector = append(vector, row.TitleVector...)
                vectors = append(vectors, vector)
        }

        sp, _ := entity.NewIndexAUTOINDEXSearchParam(1)

        limit := client.WithLimit(10)
        offset := client.WithOffset(0)
        topK := 5
        outputFields := []string{"title", "claps", "reading_time"}

        res, err := conn.Search(
                context.Background(),               // context
                COLLNAME,                           // collectionName
                []string{},                         // partitionNames
                "claps > 30 and reading_time < 10", // expr
                outputFields,                       // outputfields
                vectors,                            // vectors
                "title_vector",                     // vectorField
                entity.MetricType("L2"),            // metricType
                topK,                               // topK
                sp,                                 // sp
                limit,                              // opts
                offset,                             // opts
        )

        if err != nil {
                log.Fatal("Failed to insert rows:", err.Error())
        }

        fmt.Println(resultsToJSON(res))
}

func resultsToJSON(results []client.SearchResult) string {
        var result []map[string]interface{}
        for _, r := range results {
                result = append(result, map[string]interface{}{
                        "counts":    r.ResultCount,
                        "fields":    fieldsToJSON(results, true),
                        "rows":      fieldsToJSON(results, false),
                        "distances": r.Scores,
                })
        }

        jsonData, _ := json.MarshalIndent(result, "", "  ")
        return string(jsonData)
}

func fieldsToJSON(results []client.SearchResult, inFields bool) []map[string]interface{} {
        var fields []map[string]interface{}
        var rows []map[string]interface{}
        var ret []map[string]interface{}
        for _, r := range results {
                for _, f := range r.Fields {
                        field := make(map[string]interface{})
                        name := f.Name()
                        data := typeSwitch(f)

                        for i, v := range data {
                                if len(rows) < i+1 {
                                        row := make(map[string]interface{})
                                        row[name] = v
                                        rows = append(rows, row)
                                } else {
                                        rows[i][name] = v
                                }
                        }

                        field[name] = data
                        fields = append(fields, field)
                }
        }

        if inFields {
                ret = fields
        } else {
                ret = rows
        }

        return ret
}

func typeSwitch(c entity.Column) []interface{} {
        ctype := c.FieldData().GetType().String()

        var data []interface{}
        switch ctype {
        case "Int64":
                longData := c.FieldData().GetScalars().GetLongData().Data
                for _, d := range longData {
                        data = append(data, d)
                }
        case "VarChar":
                stringData := c.FieldData().GetScalars().GetStringData().Data
                for _, d := range stringData {
                        data = append(data, d)
                }
        }
        // You should add more types here
        return data
}
```

</TabItem>

<TabItem value='bash'>

```bash
# read the first vector from the dataset
vector="$(cat path/to/medium_articles_2020_dpr.json \
    | jq '.rows[0].title_vector' )"

echo $vector

# Replace uri and API key with your own
curl --request POST \
     --url "${PUBLIC_ENDPOINT}/v1/vector/search" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data "{
        \"collectionName\": \"medium_articles_2020\",
        \"limit\": 3,
        \"vector\": $vector
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

### Bulk search{#bulk-search}

You can conduct a bulk search by providing multiple query vectors in a single request. In most cases, bulk search is more efficient than conducting single-vector searches because the total latency is much lower than searching against these query vectors in individual requests.

Note that RESTful API does not support Bulk search. You can use an iteration to iterate over the rows in the dataset and send a search request per row.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# Search using a MilvusClient object
# For search using a Collection object, scroll down.

from pymilvus import MilvusClient

# (Continued)

# Read the dataset
with open(DATASET_PATH) as f:
    data = json.load(f)

# Conduct an ANN search
res = client.search(
    collection_name=COLLECTION_NAME,
    data=[data["rows"][0]["title_vector"], data["rows"][1]["title_vector"]],
    output_fields=["title"],
    limit=5,
)

print(res)

# Output
#
# [
#     [
#         {
#             "id": 0,
#             "distance": 1.0,
#             "entity": {
#                 "title": "The Reported Mortality Rate of Coronavirus Is Not Important"
#             }
#         },
#         {
#             "id": 70,
#             "distance": 0.7525784969329834,
#             "entity": {
#                 "title": "How bad will the Coronavirus Outbreak get? \u2014 Predicting the outbreak figures"
#             }
#         },
#         {
#             "id": 160,
#             "distance": 0.7132074236869812,
#             "entity": {
#                 "title": "The Funeral Industry is a Killer"
#             }
#         },
#         {
#             "id": 111,
#             "distance": 0.6888885498046875,
#             "entity": {
#                 "title": "The role of AI in web-based ADA and WCAG compliance"
#             }
#         },
#         {
#             "id": 196,
#             "distance": 0.6882869601249695,
#             "entity": {
#                 "title": "The Question We Should Be Asking About the Cost of Youth Sports"
#             }
#         }
#    ],
#    [
#         {
#             "id": 51,
#             "distance": 0.6719912886619568,
#             "entity": {
#                 "title": "What if Facebook had to pay you for the profit they are making?"
#             }
#         },
#         {
#             "id": 178,
#             "distance": 0.6699185371398926,
#             "entity": {
#                 "title": "Is The Environmental Damage Due To Cruise Ships Irreversible?"
#             }
#         },
#         {
#             "id": 47,
#             "distance": 0.6680259704589844,
#             "entity": {
#                 "title": "What Happens When the Google Cookie Crumbles?"
#             }
#         },
#         {
#             "id": 135,
#             "distance": 0.6597772836685181,
#             "entity": {
#                 "title": "How to Manage Risk as a Product Manager"
#             }
#         }
#     ]
# ]

# =============

# Search with a Collection object
from pymilvus import Collection

# 8. Search data
# Metric type should be the same as
# that defined in the index parameters 
# used to create the index.
search_params = {
    "metric_type": "L2"
}

results = collection.search(
    data=[data["rows"][0]["title_vector"], data["rows"][1]["title_vector"]],
    anns_field="title_vector",
    param=search_params,
    output_fields=["title", "link"],
    limit=5
)

# Get all returned IDs
# results[0] indicates the result of the first query vector in the 'data' list
ids = results[0].ids

print(ids)

# Output
#
# [0, 3177, 5607, 5641, 3441]

# Get the distance from 
# all returned vectors to the query vector.
distances = results[0].distances

print(distances)

# Output
#
# [0.0, 0.29999837279319763, 0.36103835701942444, 0.37674015760421753, 0.4162980318069458]

# Get the values of the output fields
# specified in the search request
entities = [ x.entity.to_dict()["entity"] for x in results[0] ]

print(entities)

# Output
#
# [
#     {
#         "title": "The Reported Mortality Rate of Coronavirus Is Not Important",
#         "link": "https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912"
#     },
#     {
#         "title": "Following the Spread of Coronavirus",
#         "link": "https://towardsdatascience.com/following-the-spread-of-coronavirus-23626940c125"
#     },
#     {
#         "title": "The Hidden Side Effect of the Coronavirus",
#         "link": "https://medium.com/swlh/the-hidden-side-effect-of-the-coronavirus-b6a7a5ee9586"
#     },
#     {
#         "title": "Why The Coronavirus Mortality Rate is Misleading",
#         "link": "https://towardsdatascience.com/why-the-coronavirus-mortality-rate-is-misleading-cc63f571b6a6"
#     },
#     {
#         "title": "Coronavirus shows what ethical Amazon could look like",
#         "link": "https://medium.com/swlh/coronavirus-shows-what-ethical-amazon-could-look-like-7c80baf2c663"
#     }
# ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
async function main() {

    // (Continued)
    
    // 6. Coduct an ANN search

    res = await client.search({
        collection_name: collectionName,
        vectors: [ rows[0].title_vector, rows[1].title_vector ],
        limit: 5,
        filter: "claps > 30 and reading_time < 10",
        output_fields: ["title", "link"]
    });
    
    console.log(res);

    // Output
    // 
    // {
    //   status: { error_code: 'Success', reason: '', code: 0 },
    //   results: [
    //     [ [Object], [Object], [Object], [Object], [Object] ],
    //     [ [Object], [Object], [Object], [Object], [Object] ]
    //   ]
    // }
    // 
}
```

</TabItem>

<TabItem value='java'>

```java
public class UseCustomizedSchemaDemo 
{
    public static void main( String[] args )
    {
        // (Continued)

        // Search multiple vectors in a collection

        List<Float> queryVector2 = rows.get(1).getJSONArray("title_vector").toJavaList(Float.class);
        queryVectors.add(queryVector2);

        SearchParam searchParam3 = SearchParam.newBuilder()
            .withCollectionName(collectionName)
            .withVectorFieldName("title_vector")
            .withVectors(queryVectors)
            .withTopK(5)   
            .withMetricType(MetricType.L2)  
            .withParams("{\"nprobe\":10,\"offset\":2, \"limit\":3}")
            .withConsistencyLevel(ConsistencyLevelEnum.BOUNDED)
            .withOutFields(outputFields)
            .build();

        R<SearchResults> response3 = client.search(searchParam3);

        SearchResultsWrapper wrapper3 = new SearchResultsWrapper(response3.getData().getResults());

        List<List<JSONObject>> results3 = new ArrayList<>();

        for (int i = 0; i < queryVectors.size(); ++i) {
            List<SearchResultsWrapper.IDScore> scores = wrapper3.getIDScore(i);
            List<String> titles = (List<String>) wrapper3.getFieldData("title", i);
            List<String> links = (List<String>) wrapper3.getFieldData("link", i);
            List<JSONObject> entities = new ArrayList<>();
            for (int j = 0; j < scores.size(); ++j) {
                SearchResultsWrapper.IDScore score = scores.get(j);
                JSONObject entity = new JSONObject();
                entity.put("id", score.getLongID());
                entity.put("distance", score.getScore());
                entity.put("title", titles.get(j));
                entity.put("link", links.get(j));
                entities.add(entity);
            }

            results3.add(entities);
        } 

        System.out.println(results3);

        // Output:
        // [[{"distance":0.6560175,"link":"https://medium.com/swlh/what-if-facebook-had-to-pay-you-for-the-profit-they-are-making-7571115139a7","id":445453895050486638,"title":"What if Facebook had to pay you for the profit they are making?"}, {"distance":0.663948,"link":"https://medium.com/swlh/what-happens-when-the-google-cookie-crumbles-a0405ef97bf1","id":445453895050486634,"title":"What Happens When the Google Cookie Crumbles?"}, {"distance":0.7018132,"link":"https://medium.com/personal-growth/a-psychologist-explains-how-anyone-can-beat-social-anxiety-7992014ced88","id":445453895050486655,"title":"A Clinical Psychologist Explains How to Beat Social Anxiety"}, {"distance":0.72767186,"link":"https://medium.com/swlh/building-comprehensible-customer-churn-prediction-models-ca61ecce529d","id":445453895050486594,"title":"Building Comprehensible Customer Churn Prediction Models"}, {"distance":0.7282397,"link":"https://medium.com/swlh/bad-luck-or-bad-strategy-9c3ca2352a3b","id":445453895050486646,"title":"Bad Luck? or Bad Strategy?"}], [{"distance":0.5267407,"link":"https://medium.com/swlh/blockchain-iot-and-ai-a-perfect-fit-1-e04c6ad73fbc","id":445453895050486604,"title":"Blockchain, IoT and AI — A Perfect Fit"}, {"distance":0.54294807,"link":"https://towardsdatascience.com/how-to-write-movie-reviews-with-ai-d17f758f2ed5","id":445453895050486685,"title":"How To Write Movie Reviews with AI"}, {"distance":0.5753727,"link":"https://towardsdatascience.com/feature-selection-techniques-in-python-predicting-hotel-cancellations-48a77521ee4f","id":445453895050486683,"title":"Feature Selection Techniques in Python: Predicting Hotel Cancellations"}, {"distance":0.5788189,"link":"https://medium.com/swlh/guide-to-nest-js-rabbitmq-microservices-e1e8655d2853","id":445453895050486592,"title":"Guide to Nest JS-RabbitMQ Microservices"}, {"distance":0.57894915,"link":"https://towardsdatascience.com/opengl-in-java-how-to-use-hardware-acceleration-676334f18f11","id":445453895050486672,"title":"OpenGL in Java: how to use hardware acceleration"}]]
    }
}
```

</TabItem>

<TabItem value='go'>

```go
func main() {
    // (Continued)
        // 8. Search

        fmt.Println("Start searching ...")

        vectors := []entity.Vector{}

        for _, row := range data.Rows[:2] {
                vector := make(entity.FloatVector, 0, 768)
                vector = append(vector, row.TitleVector...)
                vectors = append(vectors, vector)
        }

        sp, _ := entity.NewIndexAUTOINDEXSearchParam(1)

        limit := client.WithLimit(10)
        offset := client.WithOffset(0)
        topK := 5
        outputFields := []string{"title", "claps", "reading_time"}

        res, err := conn.Search(
                context.Background(),               // context
                COLLNAME,                           // collectionName
                []string{},                         // partitionNames
                "claps > 30 and reading_time < 10", // expr
                outputFields,                       // outputfields
                vectors,                            // vectors
                "title_vector",                     // vectorField
                entity.MetricType("L2"),            // metricType
                topK,                               // topK
                sp,                                 // sp
                limit,                              // opts
                offset,                             // opts
        )

        if err != nil {
                log.Fatal("Failed to insert rows:", err.Error())
        }

        fmt.Println(resultsToJSON(res))
}
```

</TabItem>
</Tabs>

The number of hits objects in a bulk search result equals the number of query vectors in the search request. You can access the hits object of a query vector using its index in the query vector list.

### Search with filters{#search-with-filters}

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
vector="$(cat path/to/medium_articles_2020_dpr.json \
    | jq '.rows[0].title_vector' )"

echo $vector

# search with filter
curl --request POST \
     --url "${PUBLIC_ENDPOINT}/v1/vector/search" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data "{
        \"collectionName\": \"medium_articles_2020\",
        \"limit\": 5,
        \"vector\": $vector,
        \"filter\": \"10 < reading_time < 15\",
        \"outputFields\": [\"link\", \"reading_time\"]
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
vector="$(cat path/to/medium_articles_2020_dpr.json \
    | jq '.rows[0].title_vector' )"

echo $vector

# search with filter
curl --request POST \
     --url "${PUBLIC_ENDPOINT}/v1/vector/search" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data "{
        \"collectionName\": \"medium_articles_2020\",
        \"limit\": 5,
        \"vector\": $vector,
        \"filter\": \"claps > 1500 and responses > 15\",
        \"outputFields\": [\"title\", \"claps\", \"responses\"]
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
vector="$(cat path/to/medium_articles_2020_dpr.json \
    | jq '.rows[0].title_vector' )"

echo $vector

# search with filter
curl --request POST \
     --url "${PUBLIC_ENDPOINT}/v1/vector/search" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data "{
        \"collectionName\": \"medium_articles_2020\",
        \"limit\": 5,
        \"vector\": $vector,
        \"filter\": \"publication == 'Towards Data Science'\",
        \"outputFields\": [\"title\", \"publication\"]
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
vector="$(cat path/to/medium_articles_2020_dpr.json \
    | jq '.rows[0].title_vector' )"

echo $vector

# search with filter
curl --request POST \
     --url "${PUBLIC_ENDPOINT}/v1/vector/search" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data "{
        \"collectionName\": \"medium_articles_2020\",
        \"limit\": 5,
        \"vector\": $vector,
        \"filter\": \"publication not in ['Towards Data Science', 'Personal Growth']\",
        \"outputFields\": [\"title\", \"publication\"]
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
vector="$(cat path/to/medium_articles_2020_dpr.json \
    | jq '.rows[0].title_vector' )"

echo $vector

# search with filter
curl --request POST \
     --url "${PUBLIC_ENDPOINT}/v1/vector/search" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data "{
        \"collectionName\": \"medium_articles_2020\",
        \"limit\": 5,
        \"vector\": $vector,
        \"filter\": \"title like 'Top%'\",
        \"outputFields\": [\"title\"]
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
vector="$(cat path/to/medium_articles_2020_dpr.json \
    | jq '.rows[0].title_vector' )"

echo $vector

# search with filter
curl --request POST \
     --url "${PUBLIC_ENDPOINT}/v1/vector/search" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data "{
        \"collectionName\": \"medium_articles_2020\",
        \"limit\": 5,
        \"vector\": $vector,
        \"filter\": \"(publication == 'Towards Data Science') and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))\",
        \"outputFields\": [\"title\", \"publication\", \"claps\", \"response\", \"reading_time\"]
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
    filter='(publication == "Towards Data Science") and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))',
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
curl --request POST \
     --url "${PUBLIC_ENDPOINT}/v1/vector/query" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data "{
        \"collectionName\": \"medium_articles_2020\",
        \"filter\": \"(publication == 'Towards Data Science') and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))\",
        \"outputFields\": [\"title\", \"link\"]
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

## Get{#get}

## Related topics{#related-topics}

- [Drop Collection](./drop-collection-1) 

- [Use Customized Schema](./create-collection-with-schema) 

- [Enable Dynamic Schema](./enable-dynamic-schema) 

- [JavaScript Object Notation (JSON)](./javascript-object-notation-json-1) 
