---
slug: /search-query-and-get
beta: FALSE
notebook: 00_quick_start.ipynb,01_use_customized_schema.ipynb
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

- You have connected to a cluster and created a collection. For details, see [Connect to Cluster](./connect-to-cluster) and [Create Collection](./create-collection).

- You have downloaded the example dataset and inserted the data into the collection. For details, see [Example Dataset](./example-dataset) and [Insert Entities](./insert-entities).

## Search{#search}

### Single-vector search{#single-vector-search}

A single-vector search request involves using only one vector and asking for the top-K entities that are most similar to the input query vector.

Here is an example of a single-vector search.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

<Tabs groupId="python" defaultValue='python' values={[{"label":"Starter API","value":"python"},{"label":"Advanced API","value":"python_1"}]}>
<TabItem value='python'>

```python
# Search using a MilvusClient object
from pymilvus import MilvusClient

# (Continued)

# Read the dataset
with open(DATASET_PATH) as f:
    data = json.load(f)

# single vector search
res = client.search(
    collection_name=COLLECTION_NAME,
    # highlight-next-line
    data=[data["rows"][0]["title_vector"]],
    output_fields=["title", "link"],
    limit=5
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
#                 "title": "The Reported Mortality Rate of Coronavirus Is Not Important",
#                 "link": "https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912"
#             }
#         },
#         {
#             "id": 70,
#             "distance": 0.7525784969329834,
#             "entity": {
#                 "title": "How bad will the Coronavirus Outbreak get? \u2014 Predicting the outbreak figures",
#                 "link": "https://towardsdatascience.com/how-bad-will-the-coronavirus-outbreak-get-predicting-the-outbreak-figures-f0b8e8b61991"
#             }
#         },
#         {
#             "id": 160,
#             "distance": 0.7132074236869812,
#             "entity": {
#                 "title": "The Funeral Industry is a Killer",
#                 "link": "https://medium.com/swlh/the-funeral-industry-is-a-killer-1775118a7778"
#             }
#         },
#         {
#             "id": 111,
#             "distance": 0.688888430595398,
#             "entity": {
#                 "title": "The role of AI in web-based ADA and WCAG compliance",
#                 "link": "https://towardsdatascience.com/the-role-of-ai-in-web-based-ada-and-wcag-compliance-4fc09e69f416"
#             }
#         }
#     ]
# ]

```

</TabItem>
<TabItem value='python_1'>

```python
# Search with a Collection object
from pymilvus import Collection

collection = Collection(COLLECTION_NAME)

# 8. Search data
# Metric type should be the same as
# that defined in the index parameters 
# used to create the index.
search_params = {
    "metric_type": "L2"
}

# single vector search

results = collection.search(
    # highlight-next-line
    data=[data["rows"][0]['title_vector']],
    anns_field="title_vector",
    param=search_params,
    output_fields=["title", "link"],
    limit=5
)

entities = [ x.entity.to_dict() for x in results[0] ]

print(entities)

# Output
#
# [
#     {
#         "id": 0,
#         "distance": 0.0,
#         "entity": {
#             "link": "https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912",
#             "title": "The Reported Mortality Rate of Coronavirus Is Not Important"
#         }
#     },
#     {
#         "id": 3177,
#         "distance": 0.29999837279319763,
#         "entity": {
#             "link": "https://towardsdatascience.com/following-the-spread-of-coronavirus-23626940c125",
#             "title": "Following the Spread of Coronavirus"
#         }
#     },
#     {
#         "id": 5607,
#         "distance": 0.36103835701942444,
#         "entity": {
#             "link": "https://medium.com/swlh/the-hidden-side-effect-of-the-coronavirus-b6a7a5ee9586",
#             "title": "The Hidden Side Effect of the Coronavirus"
#         }
#     },
#     {
#         "id": 5641,
#         "distance": 0.37674015760421753,
#         "entity": {
#             "link": "https://towardsdatascience.com/why-the-coronavirus-mortality-rate-is-misleading-cc63f571b6a6",
#             "title": "Why The Coronavirus Mortality Rate is Misleading"
#         }
#     },
#     {
#         "id": 3441,
#         "distance": 0.4162980318069458,
#         "entity": {
#             "link": "https://medium.com/swlh/coronavirus-shows-what-ethical-amazon-could-look-like-7c80baf2c663",
#             "title": "Coronavirus shows what ethical Amazon could look like"
#         }
#     }
# ]

```

</TabItem>
</Tabs>
</TabItem>

<TabItem value='javascript'>

```javascript
async function main() {

    // (Continued)
    
    // single vector search
    res = await client.search({
        collection_name: collectionName,
        // highlight-next-line
        vector: client_data[0].vector,
        output_fields: ['title', 'link'],
        limit: 5,
    })
    
    console.log(res)

    // Output
    // 
    // {
    //   status: { error_code: 'Success', reason: '', code: 0 },
    //   results: [
    //     {
    //       score: 1,
    //       id: '0',
    //       title: 'The Reported Mortality Rate of Coronavirus Is Not Important',
    //       link: 'https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912'
    //     },
    //     {
    //       score: 0.8500008583068848,
    //       id: '3177',
    //       title: 'Following the Spread of Coronavirus',
    //       link: 'https://towardsdatascience.com/following-the-spread-of-coronavirus-23626940c125'
    //     },
    //     {
    //       score: 0.8194807767868042,
    //       id: '5607',
    //       title: 'The Hidden Side Effect of the Coronavirus',
    //       link: 'https://medium.com/swlh/the-hidden-side-effect-of-the-coronavirus-b6a7a5ee9586'
    //     },
    //     {
    //       score: 0.8116300106048584,
    //       id: '5641',
    //       title: 'Why The Coronavirus Mortality Rate is Misleading',
    //       link: 'https://towardsdatascience.com/why-the-coronavirus-mortality-rate-is-misleading-cc63f571b6a6'
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
        // single vector search in a collection

        List<List<Float>> queryVectors = new ArrayList<>();
        List<Float> queryVector1 = rows.get(0).getJSONArray("title_vector").toJavaList(Float.class);
        queryVectors.add(queryVector1);

        List<String> outputFields = new ArrayList<>();
        outputFields.add("title");
        outputFields.add("link");

        SearchParam searchParam1 = SearchParam.newBuilder()
            .withCollectionName(collectionName)
            .withVectorFieldName("title_vector")
            .withVectors(queryVectors)
            .withTopK(5)   
            .withMetricType(MetricType.L2)  
            .withParams("{\"nprobe\":1024}")
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
        // [[
        //     {
        //         "distance": 0,
        //         "link": "https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912",
        //         "id": 445297206350469349,
        //         "title": "The Reported Mortality Rate of Coronavirus Is Not Important"
        //     },
        //     {
        //         "distance": 0.29999837,
        //         "link": "https://towardsdatascience.com/following-the-spread-of-coronavirus-23626940c125",
        //         "id": 445297206350472526,
        //         "title": "Following the Spread of Coronavirus"
        //     },
        //     {
        //         "distance": 0.36103836,
        //         "link": "https://medium.com/swlh/the-hidden-side-effect-of-the-coronavirus-b6a7a5ee9586",
        //         "id": 445297206350474956,
        //         "title": "The Hidden Side Effect of the Coronavirus"
        //     },
        //     {
        //         "distance": 0.37674016,
        //         "link": "https://towardsdatascience.com/why-the-coronavirus-mortality-rate-is-misleading-cc63f571b6a6",
        //         "id": 445297206350474990,
        //         "title": "Why The Coronavirus Mortality Rate is Misleading"
        //     },
        //     {
        //         "distance": 0.41629803,
        //         "link": "https://medium.com/swlh/coronavirus-shows-what-ethical-amazon-could-look-like-7c80baf2c663",
        //         "id": 445297206350472790,
        //         "title": "Coronavirus shows what ethical Amazon could look like"
        //     }
        // ]]    }
}
```

</TabItem>

<TabItem value='go'>

```go
func main() {

        // (Continued)
    
        // 8. Search

        // single vector search
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
                context.Background(),    // context
                COLLNAME,                // collectionName
                []string{},              // partitionNames
                "",                      // expr
                outputFields,            // outputfields
                vectors,                 // vectors
                "title_vector",          // vectorField
                entity.MetricType("L2"), // metricType
                topK,                    // topK
                sp,                      // sp
                limit,                   // opts
                offset,                  // opts
        )

        if err != nil {
                log.Fatal("Failed to insert rows:", err.Error())
        }

        fmt.Println(resultsToJSON(res))

        // Output: 
        // [
        //         {
        //                 "counts": 5,
        //                 "distances": [
        //                         0,
        //                         0.29999837,
        //                         0.36103836,
        //                         0.37674016,
        //                         0.41629803
        //                 ],
        //                 "rows": [
        //                         {
        //                                 "claps": 1100,
        //                                 "reading_time": 13,
        //                                 "title": "The Reported Mortality Rate of Coronavirus Is Not Important"
        //                         },
        //                         {
        //                                 "claps": 215,
        //                                 "reading_time": 10,
        //                                 "title": "Following the Spread of Coronavirus"
        //                         },
        //                         {
        //                                 "claps": 83,
        //                                 "reading_time": 8,
        //                                 "title": "The Hidden Side Effect of the Coronavirus"
        //                         },
        //                         {
        //                                 "claps": 2900,
        //                                 "reading_time": 9,
        //                                 "title": "Why The Coronavirus Mortality Rate is Misleading"
        //                         },
        //                         {
        //                                 "claps": 51,
        //                                 "reading_time": 4,
        //                                 "title": "Coronavirus shows what ethical Amazon could look like"
        //                         }
        //                 ]
        //         }
        // ]
}

func resultsToJSON(results []client.SearchResult) string {
        var result []map[string]interface{}
        for _, r := range results {
                result = append(result, map[string]interface{}{
                        "counts":    r.ResultCount,
                        // "fields":    fieldsToJSON(results, true),
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

<Tabs groupId="python" defaultValue='python' values={[{"label":"Starter API","value":"python"},{"label":"Advanced API","value":"python_1"}]}>
<TabItem value='python'>

```python
# Search using a MilvusClient object
from pymilvus import MilvusClient

# (Continued)

# Read the dataset
with open(DATASET_PATH) as f:
    data = json.load(f)

# bulk vector search
res = client.search(
    collection_name=COLLECTION_NAME,
    # highlight-next-line
    data=[data["rows"][0]['title_vector'], data["rows"][1]['title_vector']],
    output_fields=["title", "link"],
    limit=5
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
#                 "title": "The Reported Mortality Rate of Coronavirus Is Not Important",
#                 "link": "https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912"
#             }
#         },
#         {
#             "id": 70,
#             "distance": 0.7525784969329834,
#             "entity": {
#                 "title": "How bad will the Coronavirus Outbreak get? \u2014 Predicting the outbreak figures",
#                 "link": "https://towardsdatascience.com/how-bad-will-the-coronavirus-outbreak-get-predicting-the-outbreak-figures-f0b8e8b61991"
#             }
#         },
#         {
#             "id": 160,
#             "distance": 0.7132074236869812,
#             "entity": {
#                 "title": "The Funeral Industry is a Killer",
#                 "link": "https://medium.com/swlh/the-funeral-industry-is-a-killer-1775118a7778"
#             }
#         },
#         {
#             "id": 111,
#             "distance": 0.688888430595398,
#             "entity": {
#                 "title": "The role of AI in web-based ADA and WCAG compliance",
#                 "link": "https://towardsdatascience.com/the-role-of-ai-in-web-based-ada-and-wcag-compliance-4fc09e69f416"
#             }
#         }
#     ],
#     [
#         {
#             "id": 1,
#             "distance": 0.9999999403953552,
#             "entity": {
#                 "title": "Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else",
#                 "link": "https://medium.com/swlh/dashboards-in-python-3-advanced-examples-for-dash-beginners-and-everyone-else-b1daf4e2ec0a"
#             }
#         },
#         {
#             "id": 4,
#             "distance": 0.7625511884689331,
#             "entity": {
#                 "title": "Python NLP Tutorial: Information Extraction and Knowledge Graphs",
#                 "link": "https://medium.com/swlh/python-nlp-tutorial-information-extraction-and-knowledge-graphs-43a2a4c4556c"
#             }
#         },
#         {
#             "id": 155,
#             "distance": 0.7575345039367676,
#             "entity": {
#                 "title": "How To Use Web Sockets (Socket IO) With Digital Ocean Load Balancers And Kubernetes (DOK8S) With Ingress Nginx",
#                 "link": "https://medium.com/swlh/how-to-use-web-sockets-socket-io-with-digital-ocean-load-balancers-and-kubernetes-dok8s-with-e4dd5531c67e"
#             }
#         },
#         {
#             "id": 17,
#             "distance": 0.7366296052932739,
#             "entity": {
#                 "title": "Blockchain, IoT and AI \u2014 A Perfect Fit",
#                 "link": "https://medium.com/swlh/blockchain-iot-and-ai-a-perfect-fit-1-e04c6ad73fbc"
#             }
#         },
#         {
#             "id": 113,
#             "distance": 0.7317826747894287,
#             "entity": {
#                 "title": "AutoAI: The Magic of Converting Data to Models",
#                 "link": "https://towardsdatascience.com/autoai-the-magic-of-converting-data-to-models-185f26d22234"
#             }
#         }
#     ]
# ]

```

</TabItem>
<TabItem value='python_1'>

```python
# Search with a Collection object
from pymilvus import Collection

collection = Collection(COLLECTION_NAME)

# 8. Search data
# Metric type should be the same as
# that defined in the index parameters 
# used to create the index.
search_params = {
    "metric_type": "L2"
}

# bulk vector search

results = collection.search(
    # highlight-next-line
    data=[data["rows"][0]['title_vector'], data["rows"][1]['title_vector']],
    anns_field="title_vector",
    param=search_params,
    output_fields=["title", "link"],
    limit=5
)

entities = [ list(map(lambda y: y.entity.to_dict(), x)) for x in results ]

print(entities)

# Output
#
# [
#     [
#         {
#             "id": 0,
#             "distance": 0.0,
#             "entity": {
#                 "title": "The Reported Mortality Rate of Coronavirus Is Not Important",
#                 "link": "https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912"
#             }
#         },
#         {
#             "id": 3177,
#             "distance": 0.29999837279319763,
#             "entity": {
#                 "title": "Following the Spread of Coronavirus",
#                 "link": "https://towardsdatascience.com/following-the-spread-of-coronavirus-23626940c125"
#             }
#         },
#         {
#             "id": 5607,
#             "distance": 0.36103835701942444,
#             "entity": {
#                 "title": "The Hidden Side Effect of the Coronavirus",
#                 "link": "https://medium.com/swlh/the-hidden-side-effect-of-the-coronavirus-b6a7a5ee9586"
#             }
#         },
#         {
#             "id": 5641,
#             "distance": 0.37674015760421753,
#             "entity": {
#                 "title": "Why The Coronavirus Mortality Rate is Misleading",
#                 "link": "https://towardsdatascience.com/why-the-coronavirus-mortality-rate-is-misleading-cc63f571b6a6"
#             }
#         },
#         {
#             "id": 3441,
#             "distance": 0.4162980318069458,
#             "entity": {
#                 "title": "Coronavirus shows what ethical Amazon could look like",
#                 "link": "https://medium.com/swlh/coronavirus-shows-what-ethical-amazon-could-look-like-7c80baf2c663"
#             }
#         }
#     ],
#     [
#         {
#             "id": 1,
#             "distance": 0.0,
#             "entity": {
#                 "title": "Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else",
#                 "link": "https://medium.com/swlh/dashboards-in-python-3-advanced-examples-for-dash-beginners-and-everyone-else-b1daf4e2ec0a"
#             }
#         },
#         {
#             "id": 5571,
#             "distance": 0.19530069828033447,
#             "entity": {
#                 "title": "Dashboards in Python Using Dash \u2014 Creating a Data Table using Data from Reddit",
#                 "link": "https://medium.com/swlh/dashboards-in-python-using-dash-creating-a-data-table-using-data-from-reddit-1d6c0cecb4bd"
#             }
#         },
#         {
#             "id": 3244,
#             "distance": 0.4073413610458374,
#             "entity": {
#                 "title": "OCR Engine Comparison \u2014 Tesseract vs. EasyOCR",
#                 "link": "https://medium.com/swlh/ocr-engine-comparison-tesseract-vs-easyocr-729be893d3ae"
#             }
#         },
#         {
#             "id": 3276,
#             "distance": 0.4157174229621887,
#             "entity": {
#                 "title": "How to Import Data to Salesforce Marketing Cloud (ExactTarget) Using Python REST API",
#                 "link": "https://medium.com/swlh/how-to-import-data-to-salesforce-marketing-cloud-exacttarget-using-python-rest-api-1302a26f89c0"
#             }
#         },
#         {
#             "id": 1196,
#             "distance": 0.41766005754470825,
#             "entity": {
#                 "title": "How to Automate Multiple Excel Workbooks and Perform Analysis",
#                 "link": "https://towardsdatascience.com/how-to-automate-multiple-excel-workbooks-and-perform-analysis-13e8aa5a2042"
#             }
#         }
#     ]
# ]
```

</TabItem>
</Tabs>
</TabItem>

<TabItem value='javascript'>

```javascript
async function main() {

    // (Continued)
    
    // bulk vector search
    res = await client.search({
        collection_name: collectionName,
        // highlight-next-line
        vectors: [ client_data[0].vector, client_data[1].vector ],
        output_fields: ['title', 'link'],
        limit: 5,
    })
    
    console.log(res)

    // Output
    // 
    // {
    //   status: { error_code: 'Success', reason: '', code: 0 },
    //   results: [
    //     [ [Object], [Object], [Object], [Object] ],
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

        SearchParam searchParam2 = SearchParam.newBuilder()
            .withCollectionName(collectionName)
            .withVectorFieldName("title_vector")
            .withVectors(queryVectors)
            .withTopK(5)   
            .withMetricType(MetricType.L2)  
            .withParams("{\"nprobe\":1024}")
            .withConsistencyLevel(ConsistencyLevelEnum.BOUNDED)
            .withOutFields(outputFields)
            .build();

        R<SearchResults> response2 = client.search(searchParam2);

        SearchResultsWrapper wrapper2 = new SearchResultsWrapper(response2.getData().getResults());

        List<List<JSONObject>> results2 = new ArrayList<>();

        for (int i = 0; i < queryVectors.size(); ++i) {
            List<SearchResultsWrapper.IDScore> scores = wrapper2.getIDScore(i);
            List<String> titles = (List<String>) wrapper2.getFieldData("title", i);
            List<String> links = (List<String>) wrapper2.getFieldData("link", i);
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

            results2.add(entities);
        } 

        System.out.println(results2);

        // Output:
        // [
        //     [
        //         {
        //             "distance": 0,
        //             "link": "https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912",
        //             "id": 445297206350469349,
        //             "title": "The Reported Mortality Rate of Coronavirus Is Not Important"
        //         },
        //         {
        //             "distance": 0.29999837,
        //             "link": "https://towardsdatascience.com/following-the-spread-of-coronavirus-23626940c125",
        //             "id": 445297206350472526,
        //             "title": "Following the Spread of Coronavirus"
        //         },
        //         {
        //             "distance": 0.36103836,
        //             "link": "https://medium.com/swlh/the-hidden-side-effect-of-the-coronavirus-b6a7a5ee9586",
        //             "id": 445297206350474956,
        //             "title": "The Hidden Side Effect of the Coronavirus"
        //         },
        //         {
        //             "distance": 0.37674016,
        //             "link": "https://towardsdatascience.com/why-the-coronavirus-mortality-rate-is-misleading-cc63f571b6a6",
        //             "id": 445297206350474990,
        //             "title": "Why The Coronavirus Mortality Rate is Misleading"
        //         },
        //         {
        //             "distance": 0.41629803,
        //             "link": "https://medium.com/swlh/coronavirus-shows-what-ethical-amazon-could-look-like-7c80baf2c663",
        //             "id": 445297206350472790,
        //             "title": "Coronavirus shows what ethical Amazon could look like"
        //         }
        //     ],
        //     [
        //         {
        //             "distance": 0,
        //             "link": "https://medium.com/swlh/dashboards-in-python-3-advanced-examples-for-dash-beginners-and-everyone-else-b1daf4e2ec0a",
        //             "id": 445297206350469350,
        //             "title": "Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else"
        //         },
        //         {
        //             "distance": 0.1953007,
        //             "link": "https://medium.com/swlh/dashboards-in-python-using-dash-creating-a-data-table-using-data-from-reddit-1d6c0cecb4bd",
        //             "id": 445297206350474920,
        //             "title": "Dashboards in Python Using Dash \u2014 Creating a Data Table using Data from Reddit"
        //         },
        //         {
        //             "distance": 0.40734136,
        //             "link": "https://medium.com/swlh/ocr-engine-comparison-tesseract-vs-easyocr-729be893d3ae",
        //             "id": 445297206350472593,
        //             "title": "OCR Engine Comparison \u2014 Tesseract vs. EasyOCR"
        //         },
        //         {
        //             "distance": 0.41571742,
        //             "link": "https://medium.com/swlh/how-to-import-data-to-salesforce-marketing-cloud-exacttarget-using-python-rest-api-1302a26f89c0",
        //             "id": 445297206350472625,
        //             "title": "How to Import Data to Salesforce Marketing Cloud (ExactTarget) Using Python REST API"
        //         },
        //         {
        //             "distance": 0.41766006,
        //             "link": "https://towardsdatascience.com/how-to-automate-multiple-excel-workbooks-and-perform-analysis-13e8aa5a2042",
        //             "id": 445297206350470545,
        //             "title": "How to Automate Multiple Excel Workbooks and Perform Analysis"
        //         }
        //     ]
        // ]
}
```

</TabItem>

<TabItem value='go'>

```go
func main() {
        // (Continued)
        // 8. Search

        // multiple vector search
        vectors = []entity.Vector{}

        for _, row := range data.Rows[:2] {
                vector := make(entity.FloatVector, 0, 768)
                vector = append(vector, row.TitleVector...)
                vectors = append(vectors, vector)
        }

        sp, _ = entity.NewIndexAUTOINDEXSearchParam(1)

        limit = client.WithLimit(10)
        offset = client.WithOffset(0)
        topK = 5
        outputFields = []string{"title", "claps", "reading_time"}

        res, err = conn.Search(
                context.Background(),    // context
                COLLNAME,                // collectionName
                []string{},              // partitionNames
                "",                      // expr
                outputFields,            // outputfields
                vectors,                 // vectors
                "title_vector",          // vectorField
                entity.MetricType("L2"), // metricType
                topK,                    // topK
                sp,                      // sp
                limit,                   // opts
                offset,                  // opts
        )

        if err != nil {
                log.Fatal("Failed to insert rows:", err.Error())
        }

        fmt.Println(resultsToJSON(res))

        // Output: 
        // [
        //         {
        //                 "counts": 5,
        //                 "distances": [
        //                         0,
        //                         0.29999837,
        //                         0.36103836,
        //                         0.37674016,
        //                         0.41629803
        //                 ],
        //                 "rows": [
        //                         {
        //                                 "claps": 726,
        //                                 "reading_time": 14,
        //                                 "title": "Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else"
        //                         },
        //                         {
        //                                 "claps": 546,
        //                                 "reading_time": 13,
        //                                 "title": "Dashboards in Python Using Dash — Creating a Data Table using Data from Reddit"
        //                         },
        //                         {
        //                                 "claps": 110,
        //                                 "reading_time": 4,
        //                                 "title": "OCR Engine Comparison — Tesseract vs. EasyOCR"
        //                         },
        //                         {
        //                                 "claps": 51,
        //                                 "reading_time": 4,
        //                                 "title": "How to Import Data to Salesforce Marketing Cloud (ExactTarget) Using Python REST API"
        //                         },
        //                         {
        //                                 "claps": 92,
        //                                 "reading_time": 12,
        //                                 "title": "How to Automate Multiple Excel Workbooks and Perform Analysis"
        //                         }
        //                 ]
        //         },
        //         {
        //                 "counts": 5,
        //                 "distances": [
        //                         0,
        //                         0.1953007,
        //                         0.40734136,
        //                         0.41571742,
        //                         0.41766006
        //                 ],
        //                 "rows": [
        //                         {
        //                                 "claps": 726,
        //                                 "reading_time": 14,
        //                                 "title": "Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else"
        //                         },
        //                         {
        //                                 "claps": 546,
        //                                 "reading_time": 13,
        //                                 "title": "Dashboards in Python Using Dash — Creating a Data Table using Data from Reddit"
        //                         },
        //                         {
        //                                 "claps": 110,
        //                                 "reading_time": 4,
        //                                 "title": "OCR Engine Comparison — Tesseract vs. EasyOCR"
        //                         },
        //                         {
        //                                 "claps": 51,
        //                                 "reading_time": 4,
        //                                 "title": "How to Import Data to Salesforce Marketing Cloud (ExactTarget) Using Python REST API"
        //                         },
        //                         {
        //                                 "claps": 92,
        //                                 "reading_time": 12,
        //                                 "title": "How to Automate Multiple Excel Workbooks and Perform Analysis"
        //                         }
        //                 ]
        //         }
        // ]
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

    <Tabs groupId="python" defaultValue='python' values={[{"label":"Starter API","value":"python"},{"label":"Advanced API","value":"python_1"}]}>
    <TabItem value='python'>

    ```python
    # Search using a MilvusClient object
    from pymilvus import MilvusClient
    
    res = client.search(
        collection_name=COLLECTION_NAME,
        data=[data["rows"][0]["title_vector"]],
        # highlight-start
        filter="10 < reading_time < 15",
        output_fields=["title", "reading_time"],
        # highlight-end
        limit=5
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
    #                 "title": "The Reported Mortality Rate of Coronavirus Is Not Important",
    #                 "reading_time": 13
    #             }
    #         },
    #         {
    #             "id": 7,
    #             "distance": 0.6361639499664307,
    #             "entity": {
    #                 "title": "Building Comprehensible Customer Churn Prediction Models",
    #                 "reading_time": 13
    #             }
    #         },
    #         {
    #             "id": 103,
    #             "distance": 0.6340133547782898,
    #             "entity": {
    #                 "title": "A Primer on Domain Adaptation",
    #                 "reading_time": 12
    #             }
    #         },
    #         {
    #             "id": 90,
    #             "distance": 0.6230067610740662,
    #             "entity": {
    #                 "title": "SVM: An optimization problem",
    #                 "reading_time": 11
    #             }
    #         }
    #     ]
    # ]
    
    ```

    </TabItem>
    <TabItem value='python_1'>

    ```python
    # Search using a Collection object
    from pymilvus import Collection
    
    collection = Collection(COLLECTION_NAME)
    
    results = collection.search(
        data=[data["rows"][0]['title_vector']],
        anns_field="title_vector",
        param=search_params,
        # highlight-start
        expr="10 < reading_time < 15",
        output_fields=["title", "reading_time"],
        # highlight-end
        limit=5
    )
    
    entities = [ x.entity.to_dict() for x in results[0] ]
    
    print(entities)
    
    # Output
    #
    # [
    #     {
    #         "id": 0,
    #         "distance": 0.0,
    #         "entity": {
    #             "title": "The Reported Mortality Rate of Coronavirus Is Not Important",
    #             "reading_time": 13
    #         }
    #     },
    #     {
    #         "id": 5780,
    #         "distance": 0.4586222767829895,
    #         "entity": {
    #             "title": "Heart Disease Risk Assessment Using Machine Learning",
    #             "reading_time": 12
    #         }
    #     },
    #     {
    #         "id": 5503,
    #         "distance": 0.5037478804588318,
    #         "entity": {
    #             "title": "New Data Shows a Lower Covid-19 Fatality Rate",
    #             "reading_time": 13
    #         }
    #     },
    #     {
    #         "id": 4331,
    #         "distance": 0.5255616307258606,
    #         "entity": {
    #             "title": "Common Pipenv Errors",
    #             "reading_time": 11
    #         }
    #     },
    #     {
    #         "id": 2803,
    #         "distance": 0.5679889917373657,
    #         "entity": {
    #             "title": "How Does US Healthcare Compare With Healthcare Around the World?",
    #             "reading_time": 12
    #         }
    #     }
    # ]
    ```

    </TabItem>
    </Tabs>
    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    async function main() {
    
        // （Continued）
    
        res = await client.search({
            collection_name: collectionName,
            vector: client_data[0].vector,
            // highlight-start
            filter: "10 < reading_time < 15",
            output_fields: ["title", "reading_time"],        
            // highlight-end
            limit: 5,
        })
        
        console.log(res)
    
        // Output
        // 
        // {
        //   status: { error_code: 'Success', reason: '', code: 0 },
        //   results: [
        //     {
        //       score: 1,
        //       id: '0',
        //       title: 'The Reported Mortality Rate of Coronavirus Is Not Important',
        //       reading_time: 13
        //     },
        //     {
        //       score: 0.7706888914108276,
        //       id: '5780',
        //       title: 'Heart Disease Risk Assessment Using Machine Learning',
        //       reading_time: 12
        //     },
        //     {
        //       score: 0.7372192144393921,
        //       id: '4331',
        //       title: 'Common Pipenv Errors',
        //       reading_time: 11
        //     },
        //     {
        //       score: 0.7160055637359619,
        //       id: '2803',
        //       title: 'How Does US Healthcare Compare With Healthcare Around the World?',
        //       reading_time: 12
        //     }
        //   ]
        // }
        // 
    }
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
    
    public class UseCustomizedSchemaDemo 
    {
        public static void main( String[] args )
        {
            // (Continued)
            queryVectors.clear();
            queryVectors.add(queryVector1);
    
            outputFields.clear();
            outputFields.add("title");
            outputFields.add("reading_time");
    
            SearchParam searchParam3 = SearchParam.newBuilder()
                .withCollectionName(collectionName)
                .withVectorFieldName("title_vector")
                .withVectors(queryVectors)
                .withTopK(5)   
                .withMetricType(MetricType.L2)  
                .withParams("{\"nprobe\":1024}")
                .withConsistencyLevel(ConsistencyLevelEnum.BOUNDED)
                .withOutFields(outputFields)
                .withExpr("10 < reading_time < 15")
                .build();
    
            R<SearchResults> response3 = client.search(searchParam3);
    
            SearchResultsWrapper wrapper3 = new SearchResultsWrapper(response3.getData().getResults());
    
            List<List<JSONObject>> results3 = new ArrayList<>();
    
            for (int i = 0; i < queryVectors.size(); ++i) {
                List<SearchResultsWrapper.IDScore> scores = wrapper3.getIDScore(i);
                List<String> titles = (List<String>) wrapper3.getFieldData("title", i);
                List<Long> readingTimes = (List<Long>) wrapper3.getFieldData("reading_time", i);
                List<JSONObject> entities = new ArrayList<>();
                for (int j = 0; j < scores.size(); ++j) {
                    SearchResultsWrapper.IDScore score = scores.get(j);
                    JSONObject entity = new JSONObject();
                    entity.put("id", score.getLongID());
                    entity.put("distance", score.getScore());
                    entity.put("title", titles.get(j));
                    entity.put("reading_time", readingTimes.get(j));
                    entities.add(entity);
                }
    
                results3.add(entities);
            } 
    
            System.out.println(results3);
    
            // Output:
            // [[
            //     {
            //         "reading_time": 13,
            //         "distance": 0,
            //         "id": 445297206350469349,
            //         "title": "The Reported Mortality Rate of Coronavirus Is Not Important"
            //     },
            //     {
            //         "reading_time": 12,
            //         "distance": 0.45862228,
            //         "id": 445297206350475129,
            //         "title": "Heart Disease Risk Assessment Using Machine Learning"
            //     },
            //     {
            //         "reading_time": 13,
            //         "distance": 0.5037479,
            //         "id": 445297206350474852,
            //         "title": "New Data Shows a Lower Covid-19 Fatality Rate"
            //     },
            //     {
            //         "reading_time": 11,
            //         "distance": 0.52556163,
            //         "id": 445297206350473680,
            //         "title": "Common Pipenv Errors"
            //     },
            //     {
            //         "reading_time": 12,
            //         "distance": 0.567989,
            //         "id": 445297206350472152,
            //         "title": "How Does US Healthcare Compare With Healthcare Around the World?"
            //     }
            // ]]
        }
    }
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    func main() {
            // (Continued)
    
            vectors = []entity.Vector{}
    
            for _, row := range data.Rows[:1] {
                    vector := make(entity.FloatVector, 0, 768)
                    vector = append(vector, row.TitleVector...)
                    vectors = append(vectors, vector)
            }
    
            sp, _ = entity.NewIndexAUTOINDEXSearchParam(1)
    
            limit = client.WithLimit(10)
            offset = client.WithOffset(0)
            topK = 5
            outputFields = []string{"title", "reading_time"}
            expr := "10 < reading_time < 15"
    
            res, err = conn.Search(
                    context.Background(),    // context
                    COLLNAME,                // collectionName
                    []string{},              // partitionNames
                    expr,                    // expr
                    outputFields,            // outputfields
                    vectors,                 // vectors
                    "title_vector",          // vectorField
                    entity.MetricType("L2"), // metricType
                    topK,                    // topK
                    sp,                      // sp
                    limit,                   // opts
                    offset,                  // opts
            )
    
            if err != nil {
                    log.Fatal("Failed to insert rows:", err.Error())
            }
    
            fmt.Println(resultsToJSON(res))
    
            // Output: 
            // [
            //         {
            //                 "counts": 5,
            //                 "distances": [
            //                         0,
            //                         0.45862228,
            //                         0.5037479,
            //                         0.52556163,
            //                         0.567989
            //                 ],
            //                 "rows": [
            //                         {
            //                                 "reading_time": 13,
            //                                 "title": "The Reported Mortality Rate of Coronavirus Is Not Important"
            //                         },
            //                         {
            //                                 "reading_time": 12,
            //                                 "title": "Heart Disease Risk Assessment Using Machine Learning"
            //                         },
            //                         {
            //                                 "reading_time": 13,
            //                                 "title": "New Data Shows a Lower Covid-19 Fatality Rate"
            //                         },
            //                         {
            //                                 "reading_time": 11,
            //                                 "title": "Common Pipenv Errors"
            //                         },
            //                         {
            //                                 "reading_time": 12,
            //                                 "title": "How Does US Healthcare Compare With Healthcare Around the World?"
            //                         }
            //                 ]
            //         }
            // ]
    
            // ------
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

    <Tabs groupId="python" defaultValue='python' values={[{"label":"Starter API","value":"python"},{"label":"Advanced API","value":"python_1"}]}>
    <TabItem value='python'>

    ```python
    # Search using a MilvusClient object
    
    res = client.search(
        collection_name=COLLECTION_NAME,
        data=[data["rows"][0]["title_vector"]],
        # highlight-start
        filter='claps > 1500 and responses > 15',
        output_fields=['title', 'claps', 'responses'],
        # highlight-end
        limit=5
    )
    
    print(res)
    
    # Output
    #
    # [
    #     [
    #         {
    #             "id": 130,
    #             "distance": 0.5737711787223816,
    #             "entity": {
    #                 "title": "The Only \u201cCompetition\u201d Slide You\u2019ll Ever Need in a Pitch Deck",
    #                 "claps": 1940,
    #                 "responses": 25
    #             }
    #         },
    #         {
    #             "id": 66,
    #             "distance": 0.5508044362068176,
    #             "entity": {
    #                 "title": "How to Be Memorable in Social Settings",
    #                 "claps": 8600,
    #                 "responses": 34
    #             }
    #         },
    #         {
    #             "id": 69,
    #             "distance": 0.4541875422000885,
    #             "entity": {
    #                 "title": "Top 10 In-Demand programming languages to learn in 2020",
    #                 "claps": 3000,
    #                 "responses": 18
    #             }
    #         }
    #     ]
    # ]
    
    ```

    </TabItem>
    <TabItem value='python_1'>

    ```python
    # Search using a Collection object
    from pymilvus import Collection
    
    collection = Collection(COLLECTION_NAME)
    
    results = collection.search(
        data=[data["rows"][0]['title_vector']],
        anns_field="title_vector",
        param=search_params,
        # highlight-start
        expr='claps > 1500 and responses > 15',
        output_fields=['title', 'claps', 'responses'],
        # highlight-end
        limit=5
    )
    
    entities = [ x.entity.to_dict() for x in results[0] ]
    
    print(entities)
    
    # Output
    #
    # [
    #     {
    #         "id": 5641,
    #         "distance": 0.37674015760421753,
    #         "entity": {
    #             "title": "Why The Coronavirus Mortality Rate is Misleading",
    #             "claps": 2900,
    #             "responses": 47
    #         }
    #     },
    #     {
    #         "id": 4701,
    #         "distance": 0.6518568992614746,
    #         "entity": {
    #             "title": "The Discovery of Aliens Would Be Terrible",
    #             "claps": 4300,
    #             "responses": 95
    #         }
    #     },
    #     {
    #         "id": 1394,
    #         "distance": 0.6772847175598145,
    #         "entity": {
    #             "title": "Remote Work Is Not Here to Stay",
    #             "claps": 2600,
    #             "responses": 212
    #         }
    #     },
    #     {
    #         "id": 4573,
    #         "distance": 0.6836910247802734,
    #         "entity": {
    #             "title": "Apple May Lose the Developer Crowd",
    #             "claps": 1800,
    #             "responses": 40
    #         }
    #     },
    #     {
    #         "id": 4799,
    #         "distance": 0.7143410444259644,
    #         "entity": {
    #             "title": "Sorry, Online Courses Won\u2019t Make you a Data Scientist",
    #             "claps": 5000,
    #             "responses": 45
    #         }
    #     }
    # ]
    ```

    </TabItem>
    </Tabs>
    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    async function main() {
    
        // (Continued)
        
        res = await client.search({
            collection_name: collectionName,
            vector: client_data[0].vector,
            // highlight-start
            filter: 'claps > 1500 and responses > 15',
            output_fields: ['title', 'claps', 'responses'],       
            // highlight-end
            limit: 5,
        })
        
        console.log(res)
    
        // Output
        // 
        // {
        //   status: { error_code: 'Success', reason: '', code: 0 },
        //   results: [
        //     {
        //       score: 0.8116300106048584,
        //       id: '5641',
        //       responses: 47,
        //       title: 'Why The Coronavirus Mortality Rate is Misleading',
        //       claps: 2900
        //     },
        //     {
        //       score: 0.6613576412200928,
        //       id: '1394',
        //       responses: 212,
        //       title: 'Remote Work Is Not Here to Stay',
        //       claps: 2600
        //     },
        //     {
        //       score: 0.6581544280052185,
        //       id: '4573',
        //       responses: 40,
        //       title: 'Apple May Lose the Developer Crowd',
        //       claps: 1800
        //     },
        //     {
        //       score: 0.6399664878845215,
        //       id: '1810',
        //       responses: 155,
        //       title: 'Facebook’s New Remote Salary Policy is “Barbaric”',
        //       claps: 10700
        //     },
        //     {
        //       score: 0.6333904266357422,
        //       id: '5682',
        //       responses: 29,
        //       title: 'Neumorphism — the zombie trend',
        //       claps: 2800
        //     }
        //   ]
        // }
        // 
    
    }
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
    
    public class UseCustomizedSchemaDemo 
    {
        public static void main( String[] args )
        {
            // (Continued)
            queryVectors.clear();
            queryVectors.add(queryVector1);
    
            outputFields.clear();
            outputFields.add("title");
            outputFields.add("claps");
            outputFields.add("responses");
    
            SearchParam searchParam4 = SearchParam.newBuilder()
                .withCollectionName(collectionName)
                .withVectorFieldName("title_vector")
                .withVectors(queryVectors)
                .withTopK(5)   
                .withMetricType(MetricType.L2)  
                .withParams("{\"nprobe\":1024}")
                .withConsistencyLevel(ConsistencyLevelEnum.BOUNDED)
                .withOutFields(outputFields)
                .withExpr("claps > 1500 and responses > 15")
                .build();
    
            R<SearchResults> response4 = client.search(searchParam4);
    
            SearchResultsWrapper wrapper4 = new SearchResultsWrapper(response4.getData().getResults());
    
            List<List<JSONObject>> results4 = new ArrayList<>();
    
            for (int i = 0; i < queryVectors.size(); ++i) {
                List<SearchResultsWrapper.IDScore> scores = wrapper4.getIDScore(i);
                List<String> titles = (List<String>) wrapper4.getFieldData("title", i);
                List<Long> claps_ = (List<Long>) wrapper4.getFieldData("claps", i);
                List<Long> responses_ = (List<Long>) wrapper4.getFieldData("responses", i); 
                List<JSONObject> entities = new ArrayList<>();
                for (int j = 0; j < scores.size(); ++j) {
                    SearchResultsWrapper.IDScore score = scores.get(j);
                    JSONObject entity = new JSONObject();
                    entity.put("id", score.getLongID());
                    entity.put("distance", score.getScore());
                    entity.put("title", titles.get(j));
                    entity.put("claps", claps_.get(j));
                    entity.put("responses", responses_.get(j));
                    entities.add(entity);
                }
    
                results4.add(entities);
            } 
    
            System.out.println(results4);
    
            // Output:
            // [[
            //     {
            //         "distance": 0.37674016,
            //         "responses": 47,
            //         "id": 445297206350474990,
            //         "title": "Why The Coronavirus Mortality Rate is Misleading",
            //         "claps": 2900
            //     },
            //     {
            //         "distance": 0.6518569,
            //         "responses": 95,
            //         "id": 445297206350474050,
            //         "title": "The Discovery of Aliens Would Be Terrible",
            //         "claps": 4300
            //     },
            //     {
            //         "distance": 0.6772847,
            //         "responses": 212,
            //         "id": 445297206350470743,
            //         "title": "Remote Work Is Not Here to Stay",
            //         "claps": 2600
            //     },
            //     {
            //         "distance": 0.683691,
            //         "responses": 40,
            //         "id": 445297206350473922,
            //         "title": "Apple May Lose the Developer Crowd",
            //         "claps": 1800
            //     },
            //     {
            //         "distance": 0.71434104,
            //         "responses": 45,
            //         "id": 445297206350474148,
            //         "title": "Sorry, Online Courses Won\u2019t Make you a Data Scientist",
            //         "claps": 5000
            //     }
            // ]]
        }
    }
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    func main() {
            // (Continued)
            
            vectors = []entity.Vector{}
    
            for _, row := range data.Rows[:1] {
                    vector := make(entity.FloatVector, 0, 768)
                    vector = append(vector, row.TitleVector...)
                    vectors = append(vectors, vector)
            }
    
            sp, _ = entity.NewIndexAUTOINDEXSearchParam(1)
    
            limit = client.WithLimit(10)
            offset = client.WithOffset(0)
            topK = 5
            outputFields = []string{"title", "claps", "responses"}
            expr = "claps > 1500 and responses > 15"
    
            res, err = conn.Search(
                    context.Background(),    // context
                    COLLNAME,                // collectionName
                    []string{},              // partitionNames
                    expr,                    // expr
                    outputFields,            // outputfields
                    vectors,                 // vectors
                    "title_vector",          // vectorField
                    entity.MetricType("L2"), // metricType
                    topK,                    // topK
                    sp,                      // sp
                    limit,                   // opts
                    offset,                  // opts
            )
    
            if err != nil {
                    log.Fatal("Failed to insert rows:", err.Error())
            }
    
            fmt.Println(resultsToJSON(res))
    
            // Output: 
            // [
            //         {
            //                 "counts": 5,
            //                 "distances": [
            //                         0.37674016,
            //                         0.6518569,
            //                         0.6772847,
            //                         0.683691,
            //                         0.71434104
            //                 ],
            //                 "rows": [
            //                         {
            //                                 "claps": 2900,
            //                                 "responses": 47,
            //                                 "title": "Why The Coronavirus Mortality Rate is Misleading"
            //                         },
            //                         {
            //                                 "claps": 4300,
            //                                 "responses": 95,
            //                                 "title": "The Discovery of Aliens Would Be Terrible"
            //                         },
            //                         {
            //                                 "claps": 2600,
            //                                 "responses": 212,
            //                                 "title": "Remote Work Is Not Here to Stay"
            //                         },
            //                         {
            //                                 "claps": 1800,
            //                                 "responses": 40,
            //                                 "title": "Apple May Lose the Developer Crowd"
            //                         },
            //                         {
            //                                 "claps": 5000,
            //                                 "responses": 45,
            //                                 "title": "Sorry, Online Courses Won’t Make you a Data Scientist"
            //                         }
            //                 ]
            //         }
            // ]
        
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

    <Tabs groupId="python" defaultValue='python' values={[{"label":"Starter API","value":"python"},{"label":"Advanced API","value":"python_1"}]}>
    <TabItem value='python'>

    ```python
    # Search using a MilvusClient object
    
    res = client.search(
        collection_name=COLLECTION_NAME,
        data=[data["rows"][0]["title_vector"]],
        # highlight-start
        filter='publication == "Towards Data Science"',
        output_fields=["title", "publication"],
        # highlight-end
        limit=5
    )
    
    print(res)
    
    # Output
    #
    # [
    #     [
    #         {
    #             "id": 70,
    #             "distance": 0.7525784969329834,
    #             "entity": {
    #                 "title": "How bad will the Coronavirus Outbreak get? \u2014 Predicting the outbreak figures",
    #                 "publication": "Towards Data Science"
    #             }
    #         },
    #         {
    #             "id": 111,
    #             "distance": 0.688888430595398,
    #             "entity": {
    #                 "title": "The role of AI in web-based ADA and WCAG compliance",
    #                 "publication": "Towards Data Science"
    #             }
    #         },
    #         {
    #             "id": 103,
    #             "distance": 0.6340133547782898,
    #             "entity": {
    #                 "title": "A Primer on Domain Adaptation",
    #                 "publication": "Towards Data Science"
    #             }
    #         },
    #         {
    #             "id": 94,
    #             "distance": 0.6249956488609314,
    #             "entity": {
    #                 "title": "Why Machine Learning Validation Sets Grow Stale",
    #                 "publication": "Towards Data Science"
    #             }
    #         },
    #         {
    #             "id": 90,
    #             "distance": 0.6230067610740662,
    #             "entity": {
    #                 "title": "SVM: An optimization problem",
    #                 "publication": "Towards Data Science"
    #             }
    #         }
    #     ]
    # ]
    
    ```

    </TabItem>
    <TabItem value='python_1'>

    ```python
    # Search using a Collection object
    from pymilvus import Collection
    
    collection = Collection(COLLECTION_NAME)
    
    results = collection.search(
        data=[data["rows"][0]['title_vector']],
        anns_field="title_vector",
        param=search_params,
        # highlight-start
        expr='publication == "Towards Data Science"',
        output_fields=["title", "publication"],
        # highlight-end
        limit=5
    )
    
    entities = [ x.entity.to_dict() for x in results[0] ]
    
    print(entities)
    
    # Output
    #
    # [
    #     {
    #         "id": 3177,
    #         "distance": 0.29999837279319763,
    #         "entity": {
    #             "title": "Following the Spread of Coronavirus",
    #             "publication": "Towards Data Science"
    #         }
    #     },
    #     {
    #         "id": 5641,
    #         "distance": 0.37674015760421753,
    #         "entity": {
    #             "title": "Why The Coronavirus Mortality Rate is Misleading",
    #             "publication": "Towards Data Science"
    #         }
    #     },
    #     {
    #         "id": 938,
    #         "distance": 0.436093807220459,
    #         "entity": {
    #             "title": "Mortality Rate As an Indicator of an Epidemic Outbreak",
    #             "publication": "Towards Data Science"
    #         }
    #     },
    #     {
    #         "id": 5780,
    #         "distance": 0.4586222767829895,
    #         "entity": {
    #             "title": "Heart Disease Risk Assessment Using Machine Learning",
    #             "publication": "Towards Data Science"
    #         }
    #     },
    #     {
    #         "id": 3072,
    #         "distance": 0.46275582909584045,
    #         "entity": {
    #             "title": "Can we learn anything from the progression of influenza to analyze the COVID-19 pandemic better?",
    #             "publication": "Towards Data Science"
    #         }
    #     }
    # ]
    ```

    </TabItem>
    </Tabs>
    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    async function main() {
    
        // (Continued)
    
        res = await client.search({
            collection_name: collectionName,
            vector: client_data[0].vector,
            // highlight-start
            filter: 'publication == "Towards Data Science"',
            output_fields: ["title", "publication"],      
            // highlight-end
            limit: 5,
        })
        
        console.log(res)
    
        // Output
        // 
        // {
        //   status: { error_code: 'Success', reason: '', code: 0 },
        //   results: [
        //     {
        //       score: 0.8500008583068848,
        //       id: '3177',
        //       title: 'Following the Spread of Coronavirus',
        //       publication: 'Towards Data Science'
        //     },
        //     {
        //       score: 0.8116300106048584,
        //       id: '5641',
        //       title: 'Why The Coronavirus Mortality Rate is Misleading',
        //       publication: 'Towards Data Science'
        //     },
        //     {
        //       score: 0.7819530963897705,
        //       id: '938',
        //       title: 'Mortality Rate As an Indicator of an Epidemic Outbreak',
        //       publication: 'Towards Data Science'
        //     },
        //     {
        //       score: 0.7706888914108276,
        //       id: '5780',
        //       title: 'Heart Disease Risk Assessment Using Machine Learning',
        //       publication: 'Towards Data Science'
        //     },
        //     {
        //       score: 0.7686221599578857,
        //       id: '3072',
        //       title: 'Can we learn anything from the progression of influenza to analyze the COVID-19 pandemic better?',
        //       publication: 'Towards Data Science'
        //     }
        //   ]
        // }
        // 
    }
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
    
    public class UseCustomizedSchemaDemo 
    {
        public static void main( String[] args )
        {
            // (Continued)
            queryVectors.clear();
            queryVectors.add(queryVector1);
    
            outputFields.clear();
            outputFields.add("title");
            outputFields.add("publication");
    
            SearchParam searchParam5 = SearchParam.newBuilder()
                .withCollectionName(collectionName)
                .withVectorFieldName("title_vector")
                .withVectors(queryVectors)
                .withTopK(5)   
                .withMetricType(MetricType.L2)  
                .withParams("{\"nprobe\":1024}")
                .withConsistencyLevel(ConsistencyLevelEnum.BOUNDED)
                .withOutFields(outputFields)
                .withExpr("publication == \"Towards Data Science\"")
                .build();
    
            R<SearchResults> response5 = client.search(searchParam5);
    
            SearchResultsWrapper wrapper5 = new SearchResultsWrapper(response5.getData().getResults());
    
            List<List<JSONObject>> results5 = new ArrayList<>();
    
            for (int i = 0; i < queryVectors.size(); ++i) {
                List<SearchResultsWrapper.IDScore> scores = wrapper5.getIDScore(i);
                List<String> titles = (List<String>) wrapper5.getFieldData("title", i);
                List<String> publications = (List<String>) wrapper5.getFieldData("publication", i); 
                List<JSONObject> entities = new ArrayList<>();
                for (int j = 0; j < scores.size(); ++j) {
                    SearchResultsWrapper.IDScore score = scores.get(j);
                    JSONObject entity = new JSONObject();
                    entity.put("id", score.getLongID());
                    entity.put("distance", score.getScore());
                    entity.put("title", titles.get(j));
                    entity.put("publication", publications.get(j));
                    entities.add(entity);
                }
    
                results5.add(entities);
            } 
    
            System.out.println(results5);
    
            // Output:
            // [[
            //     {
            //         "distance": 0.29999837,
            //         "publication": "Towards Data Science",
            //         "id": 445297206350472526,
            //         "title": "Following the Spread of Coronavirus"
            //     },
            //     {
            //         "distance": 0.37674016,
            //         "publication": "Towards Data Science",
            //         "id": 445297206350474990,
            //         "title": "Why The Coronavirus Mortality Rate is Misleading"
            //     },
            //     {
            //         "distance": 0.4360938,
            //         "publication": "Towards Data Science",
            //         "id": 445297206350470287,
            //         "title": "Mortality Rate As an Indicator of an Epidemic Outbreak"
            //     },
            //     {
            //         "distance": 0.45862228,
            //         "publication": "Towards Data Science",
            //         "id": 445297206350475129,
            //         "title": "Heart Disease Risk Assessment Using Machine Learning"
            //     },
            //     {
            //         "distance": 0.46275583,
            //         "publication": "Towards Data Science",
            //         "id": 445297206350472421,
            //         "title": "Can we learn anything from the progression of influenza to analyze the COVID-19 pandemic better?"
            //     }
            // ]]
        }
    }
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    func main() {
            // (Continued)
            vectors = []entity.Vector{}
    
            for _, row := range data.Rows[:1] {
                    vector := make(entity.FloatVector, 0, 768)
                    vector = append(vector, row.TitleVector...)
                    vectors = append(vectors, vector)
            }
    
            sp, _ = entity.NewIndexAUTOINDEXSearchParam(1)
    
            limit = client.WithLimit(10)
            offset = client.WithOffset(0)
            topK = 5
            outputFields = []string{"title", "publication"}
            expr = "publication == \"Towards Data Science\""
    
            res, err = conn.Search(
                    context.Background(),    // context
                    COLLNAME,                // collectionName
                    []string{},              // partitionNames
                    expr,                    // expr
                    outputFields,            // outputfields
                    vectors,                 // vectors
                    "title_vector",          // vectorField
                    entity.MetricType("L2"), // metricType
                    topK,                    // topK
                    sp,                      // sp
                    limit,                   // opts
                    offset,                  // opts
            )
    
            if err != nil {
                    log.Fatal("Failed to insert rows:", err.Error())
            }
    
            fmt.Println(resultsToJSON(res))
    
            // Output: 
            // [
            //         {
            //                 "counts": 5,
            //                 "distances": [
            //                         0.29999837,
            //                         0.37674016,
            //                         0.4360938,
            //                         0.45862228,
            //                         0.46275583
            //                 ],
            //                 "rows": [
            //                         {
            //                                 "publication": "Towards Data Science",
            //                                 "title": "Following the Spread of Coronavirus"
            //                         },
            //                         {
            //                                 "publication": "Towards Data Science",
            //                                 "title": "Why The Coronavirus Mortality Rate is Misleading"
            //                         },
            //                         {
            //                                 "publication": "Towards Data Science",
            //                                 "title": "Mortality Rate As an Indicator of an Epidemic Outbreak"
            //                         },
            //                         {
            //                                 "publication": "Towards Data Science",
            //                                 "title": "Heart Disease Risk Assessment Using Machine Learning"
            //                         },
            //                         {
            //                                 "publication": "Towards Data Science",
            //                                 "title": "Can we learn anything from the progression of influenza to analyze the COVID-19 pandemic better?"
            //                         }
            //                 ]
            //         }
            // ]    
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

    <Tabs groupId="python" defaultValue='python' values={[{"label":"Starter API","value":"python"},{"label":"Advanced API","value":"python_1"}]}>
    <TabItem value='python'>

    ```python
    # Search using a MilvusClient object
    
    res = client.search(
        collection_name=COLLECTION_NAME,
        data=[data["rows"][0]["title_vector"]],
        # highlight-start
        filter='publication not in ["Towards Data Science", "Personal Growth"]',
        output_fields=["title", "publication"],
        # highlight-end
        limit=5
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
    #                 "title": "The Reported Mortality Rate of Coronavirus Is Not Important",
    #                 "publication": "The Startup"
    #             }
    #         },
    #         {
    #             "id": 160,
    #             "distance": 0.7132074236869812,
    #             "entity": {
    #                 "title": "The Funeral Industry is a Killer",
    #                 "publication": "The Startup"
    #             }
    #         },
    #         {
    #             "id": 196,
    #             "distance": 0.6882869601249695,
    #             "entity": {
    #                 "title": "The Question We Should Be Asking About the Cost of Youth Sports",
    #                 "publication": "The Startup"
    #             }
    #         },
    #         {
    #             "id": 51,
    #             "distance": 0.6719912886619568,
    #             "entity": {
    #                 "title": "What if Facebook had to pay you for the profit they are making?",
    #                 "publication": "The Startup"
    #             }
    #         }
    #     ]
    # ]
    
    ```

    </TabItem>
    <TabItem value='python_1'>

    ```python
    # Search using a Collection object
    from pymilvus import Collection
    
    collection = Collection(COLLECTION_NAME)
    
    results = collection.search(
        data=[data["rows"][0]['title_vector']],
        anns_field="title_vector",
        param=search_params,
        # highlight-start
        expr='publication not in ["Towards Data Science", "Personal Growth"]',
        output_fields=["title", "publication"],
        # highlight-end
        limit=5
    )
    
    entities = [ x.entity.to_dict() for x in results[0] ]
    
    print(entities)
    
    # Output
    #
    # [
    #     {
    #         "id": 0,
    #         "distance": 0.0,
    #         "entity": {
    #             "title": "The Reported Mortality Rate of Coronavirus Is Not Important",
    #             "publication": "The Startup"
    #         }
    #     },
    #     {
    #         "id": 5607,
    #         "distance": 0.36103835701942444,
    #         "entity": {
    #             "title": "The Hidden Side Effect of the Coronavirus",
    #             "publication": "The Startup"
    #         }
    #     },
    #     {
    #         "id": 3441,
    #         "distance": 0.4162980318069458,
    #         "entity": {
    #             "title": "Coronavirus shows what ethical Amazon could look like",
    #             "publication": "The Startup"
    #         }
    #     },
    #     {
    #         "id": 4275,
    #         "distance": 0.48886314034461975,
    #         "entity": {
    #             "title": "How Can AI Help Fight Coronavirus?",
    #             "publication": "The Startup"
    #         }
    #     },
    #     {
    #         "id": 4145,
    #         "distance": 0.4928317666053772,
    #         "entity": {
    #             "title": "Will Coronavirus Impact Freelancers\u2019 Ability to Rent?",
    #             "publication": "The Startup"
    #         }
    #     }
    # ]
    ```

    </TabItem>
    </Tabs>
    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    async function main() {
    
        // (Continued)
        
        res = await client.search({
            collection_name: collectionName,
            vector: client_data[0].vector,
            // highlight-start
            filter: 'publication not in ["Towards Data Science", "Personal Growth"]',
            output_fields: ["title", "publication"],    
            // highlight-end
            limit: 5,
        })
        
        console.log(res)
    
        // Output
        // 
        // {
        //   status: { error_code: 'Success', reason: '', code: 0 },
        //   results: [
        //     {
        //       score: 1,
        //       id: '0',
        //       title: 'The Reported Mortality Rate of Coronavirus Is Not Important',
        //       publication: 'The Startup'
        //     },
        //     {
        //       score: 0.8194807767868042,
        //       id: '5607',
        //       title: 'The Hidden Side Effect of the Coronavirus',
        //       publication: 'The Startup'
        //     },
        //     {
        //       score: 0.7918509244918823,
        //       id: '3441',
        //       title: 'Coronavirus shows what ethical Amazon could look like',
        //       publication: 'The Startup'
        //     },
        //     {
        //       score: 0.7555683851242065,
        //       id: '4275',
        //       title: 'How Can AI Help Fight Coronavirus?',
        //       publication: 'The Startup'
        //     }
        //   ]
        // }
        // 
    }
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
            // (Continued)
            queryVectors.clear();
            queryVectors.add(queryVector1);
    
            outputFields.clear();
            outputFields.add("title");
            outputFields.add("publication");
    
            SearchParam searchParam6 = SearchParam.newBuilder()
                .withCollectionName(collectionName)
                .withVectorFieldName("title_vector")
                .withVectors(queryVectors)
                .withTopK(5)   
                .withMetricType(MetricType.L2)  
                .withParams("{\"nprobe\":1024}")
                .withConsistencyLevel(ConsistencyLevelEnum.BOUNDED)
                .withOutFields(outputFields)
                .withExpr("publication not in [\"Towards Data Science\", \"Personal Growth\"]")
                .build();
    
            R<SearchResults> response6 = client.search(searchParam6);
    
            SearchResultsWrapper wrapper6 = new SearchResultsWrapper(response6.getData().getResults());
    
            List<List<JSONObject>> results6 = new ArrayList<>();
    
            for (int i = 0; i < queryVectors.size(); ++i) {
                List<SearchResultsWrapper.IDScore> scores = wrapper6.getIDScore(i);
                List<String> titles = (List<String>) wrapper6.getFieldData("title", i);
                List<String> publications = (List<String>) wrapper6.getFieldData("publication", i);
                List<JSONObject> entities = new ArrayList<>();
                for (int j = 0; j < scores.size(); ++j) {
                    SearchResultsWrapper.IDScore score = scores.get(j);
                    JSONObject entity = new JSONObject();
                    entity.put("id", score.getLongID());
                    entity.put("distance", score.getScore());
                    entity.put("title", titles.get(j));
                    entity.put("publication", publications.get(j));
                    entities.add(entity);
                }
    
                results6.add(entities);
            } 
    
            System.out.println(results6);
    
            // Output:
            // [[
            //     {
            //         "distance": 0,
            //         "publication": "The Startup",
            //         "id": 445297206350469349,
            //         "title": "The Reported Mortality Rate of Coronavirus Is Not Important"
            //     },
            //     {
            //         "distance": 0.36103836,
            //         "publication": "The Startup",
            //         "id": 445297206350474956,
            //         "title": "The Hidden Side Effect of the Coronavirus"
            //     },
            //     {
            //         "distance": 0.41629803,
            //         "publication": "The Startup",
            //         "id": 445297206350472790,
            //         "title": "Coronavirus shows what ethical Amazon could look like"
            //     },
            //     {
            //         "distance": 0.48886314,
            //         "publication": "The Startup",
            //         "id": 445297206350473624,
            //         "title": "How Can AI Help Fight Coronavirus?"
            //     },
            //     {
            //         "distance": 0.49283177,
            //         "publication": "The Startup",
            //         "id": 445297206350473494,
            //         "title": "Will Coronavirus Impact Freelancers\u2019 Ability to Rent?"
            //     }
            // ]]
    }
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    func main() {
            // (Continued)
            vectors = []entity.Vector{}
    
            for _, row := range data.Rows[:1] {
                    vector := make(entity.FloatVector, 0, 768)
                    vector = append(vector, row.TitleVector...)
                    vectors = append(vectors, vector)
            }
    
            sp, _ = entity.NewIndexAUTOINDEXSearchParam(1)
    
            limit = client.WithLimit(10)
            offset = client.WithOffset(0)
            topK = 5
            outputFields = []string{"title", "publication"}
            expr = "publication not in [\"Towards Data Science\", \"Personal Growth\"]"
    
            res, err = conn.Search(
                    context.Background(),    // context
                    COLLNAME,                // collectionName
                    []string{},              // partitionNames
                    expr,                    // expr
                    outputFields,            // outputfields
                    vectors,                 // vectors
                    "title_vector",          // vectorField
                    entity.MetricType("L2"), // metricType
                    topK,                    // topK
                    sp,                      // sp
                    limit,                   // opts
                    offset,                  // opts
            )
    
            if err != nil {
                    log.Fatal("Failed to insert rows:", err.Error())
            }
    
            fmt.Println(resultsToJSON(res))
    
            // Output: 
            // [
            //         {
            //                 "counts": 5,
            //                 "distances": [
            //                         0,
            //                         0.36103836,
            //                         0.41629803,
            //                         0.48886314,
            //                         0.49283177
            //                 ],
            //                 "rows": [
            //                         {
            //                                 "publication": "The Startup",
            //                                 "title": "The Reported Mortality Rate of Coronavirus Is Not Important"
            //                         },
            //                         {
            //                                 "publication": "The Startup",
            //                                 "title": "The Hidden Side Effect of the Coronavirus"
            //                         },
            //                         {
            //                                 "publication": "The Startup",
            //                                 "title": "Coronavirus shows what ethical Amazon could look like"
            //                         },
            //                         {
            //                                 "publication": "The Startup",
            //                                 "title": "How Can AI Help Fight Coronavirus?"
            //                         },
            //                         {
            //                                 "publication": "The Startup",
            //                                 "title": "Will Coronavirus Impact Freelancers’ Ability to Rent?"
            //                         }
            //                 ]
            //         }
            // ]
       
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

    <Tabs groupId="python" defaultValue='python' values={[{"label":"Starter API","value":"python"},{"label":"Advanced API","value":"python_1"}]}>
    <TabItem value='python'>

    ```python
    # Search using a MilvusClient object
    
    res = client.search(
        collection_name=COLLECTION_NAME,
        data=[data["rows"][0]["title_vector"]],
        # highlight-start
        filter='title like "Top%"',
        output_fields=["title", "link"],
        # highlight-end
        limit=5
    )
    
    print(res)
    
    # Output
    #
    # [
    #     [
    #         {
    #             "id": 75,
    #             "distance": 0.5751269459724426,
    #             "entity": {
    #                 "title": "Top Trends of Graph Machine Learning in 2020",
    #                 "link": "https://towardsdatascience.com/top-trends-of-graph-machine-learning-in-2020-1194175351a3"
    #             }
    #         },
    #         {
    #             "id": 76,
    #             "distance": 0.5366824865341187,
    #             "entity": {
    #                 "title": "Top 20 Data Science Discord servers to join in 2020",
    #                 "link": "https://towardsdatascience.com/top-20-data-science-discord-servers-to-join-in-2020-567b45738e9d"
    #             }
    #         },
    #         {
    #             "id": 74,
    #             "distance": 0.5235060453414917,
    #             "entity": {
    #                 "title": "Top 10 Artificial Intelligence Trends for 2020",
    #                 "link": "https://towardsdatascience.com/top-10-ai-trends-for-2020-d6294cfee2bd"
    #             }
    #         },
    #         {
    #             "id": 97,
    #             "distance": 0.5228530168533325,
    #             "entity": {
    #                 "title": "Top 5 AI Conferences To Visit in Europe in 2020",
    #                 "link": "https://towardsdatascience.com/top-5-ai-conferences-to-visit-in-europe-in-2020-7a6f068aff34"
    #             }
    #         },
    #         {
    #             "id": 69,
    #             "distance": 0.4541875422000885,
    #             "entity": {
    #                 "title": "Top 10 In-Demand programming languages to learn in 2020",
    #                 "link": "https://towardsdatascience.com/top-10-in-demand-programming-languages-to-learn-in-2020-4462eb7d8d3e"
    #             }
    #         }
    #     ]
    # ]
    
    ```

    </TabItem>
    <TabItem value='python_1'>

    ```python
    # Search using a Collection object
    from pymilvus import Collection
    
    collection = Collection(COLLECTION_NAME)
    
    results = collection.search(
        data=[data["rows"][0]['title_vector']],
        anns_field="title_vector",
        param=search_params,
        # highlight-start
        expr='title like "Top%"',
        output_fields=["title", "link"],
        # highlight-end
        limit=5
    )
    
    entities = [ x.entity.to_dict() for x in results[0] ]
    
    print(entities)
    
    # Output
    #
    # [
    #     {
    #         "id": 3630,
    #         "distance": 0.749665379524231,
    #         "entity": {
    #             "title": "Topic Modeling in Power BI using PyCaret",
    #             "link": "https://towardsdatascience.com/topic-modeling-in-power-bi-using-pycaret-54422b4e36d6"
    #         }
    #     },
    #     {
    #         "id": 3666,
    #         "distance": 0.7691308259963989,
    #         "entity": {
    #             "title": "Topic Modeling the comment section from a New York Times article",
    #             "link": "https://towardsdatascience.com/topic-modeling-the-comment-section-from-a-new-york-times-article-e4775261530e"
    #         }
    #     },
    #     {
    #         "id": 3288,
    #         "distance": 0.812682032585144,
    #         "entity": {
    #             "title": "Top 4 Myths About App Store Conversion Rate Optimization (CRO)",
    #             "link": "https://medium.com/swlh/top-4-myths-about-app-store-conversion-rate-optimization-cro-c62476901c90"
    #         }
    #     },
    #     {
    #         "id": 1626,
    #         "distance": 0.8307195901870728,
    #         "entity": {
    #             "title": "Top VS Code extensions for Web Developers",
    #             "link": "https://medium.com/swlh/top-vs-code-extensions-for-web-developers-1e038201a8fc"
    #         }
    #     },
    #     {
    #         "id": 3398,
    #         "distance": 0.8489705324172974,
    #         "entity": {
    #             "title": "Top ten mistakes found while performing code reviews",
    #             "link": "https://medium.com/swlh/top-ten-mistakes-found-while-doing-code-reviews-b935ef44e797"
    #         }
    #     }
    # ]
    ```

    </TabItem>
    </Tabs>
    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    async function main() {
    
        // (Continued)
        
        res = await client.search({
            collection_name: collectionName,
            vector: client_data[0].vector,
            // highlight-start
            filter: 'title like "Top%"',
            output_fields: ["title", "link"],  
            // highlight-end
            limit: 5,
        })
        
        console.log(res)
    
        // Output
        // 
        // { status: { error_code: 'Success', reason: '', code: 0 }, results: [] }
        //     
    
    }
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
    
    public class UseCustomizedSchemaDemo 
    {
        public static void main( String[] args )
        {
            // (Continued)
            queryVectors.clear();
            queryVectors.add(queryVector1);
    
            outputFields.clear();
            outputFields.add("title");
            outputFields.add("link");
    
            SearchParam searchParam7 = SearchParam.newBuilder()
                .withCollectionName(collectionName)
                .withVectorFieldName("title_vector")
                .withVectors(queryVectors)
                .withTopK(5)   
                .withMetricType(MetricType.L2)  
                .withParams("{\"nprobe\":1024}")
                .withConsistencyLevel(ConsistencyLevelEnum.BOUNDED)
                .withOutFields(outputFields)
                .withExpr("title like \"Top%\"")
                .build();
    
            R<SearchResults> response7 = client.search(searchParam7);
    
            SearchResultsWrapper wrapper7 = new SearchResultsWrapper(response7.getData().getResults());
    
            List<List<JSONObject>> results7 = new ArrayList<>();
    
            for (int i = 0; i < queryVectors.size(); ++i) {
                List<SearchResultsWrapper.IDScore> scores = wrapper7.getIDScore(i);
                List<String> titles = (List<String>) wrapper7.getFieldData("title", i);
                List<String> links = (List<String>) wrapper7.getFieldData("link", i);
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
    
                results7.add(entities);
            } 
    
            System.out.println(results7);
    
            // Output:
            // [[
            //     {
            //         "distance": 0.7496654,
            //         "link": "https://towardsdatascience.com/topic-modeling-in-power-bi-using-pycaret-54422b4e36d6",
            //         "id": 445297206350472979,
            //         "title": "Topic Modeling in Power BI using PyCaret"
            //     },
            //     {
            //         "distance": 0.7691308,
            //         "link": "https://towardsdatascience.com/topic-modeling-the-comment-section-from-a-new-york-times-article-e4775261530e",
            //         "id": 445297206350473015,
            //         "title": "Topic Modeling the comment section from a New York Times article"
            //     },
            //     {
            //         "distance": 0.81268203,
            //         "link": "https://medium.com/swlh/top-4-myths-about-app-store-conversion-rate-optimization-cro-c62476901c90",
            //         "id": 445297206350472637,
            //         "title": "Top 4 Myths About App Store Conversion Rate Optimization (CRO)"
            //     },
            //     {
            //         "distance": 0.8307196,
            //         "link": "https://medium.com/swlh/top-vs-code-extensions-for-web-developers-1e038201a8fc",
            //         "id": 445297206350470975,
            //         "title": "Top VS Code extensions for Web Developers"
            //     },
            //     {
            //         "distance": 0.84897053,
            //         "link": "https://medium.com/swlh/top-ten-mistakes-found-while-doing-code-reviews-b935ef44e797",
            //         "id": 445297206350472747,
            //         "title": "Top ten mistakes found while performing code reviews"
            //     }
            // ]]
        }
    }
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    func main() {
            // (Continued)
    
            vectors = []entity.Vector{}
    
            for _, row := range data.Rows[:1] {
                    vector := make(entity.FloatVector, 0, 768)
                    vector = append(vector, row.TitleVector...)
                    vectors = append(vectors, vector)
            }
    
            sp, _ = entity.NewIndexAUTOINDEXSearchParam(1)
    
            limit = client.WithLimit(10)
            offset = client.WithOffset(0)
            topK = 5
            outputFields = []string{"title", "link"}
            expr = "title like \"Top%\""
    
            res, err = conn.Search(
                    context.Background(),    // context
                    COLLNAME,                // collectionName
                    []string{},              // partitionNames
                    expr,                    // expr
                    outputFields,            // outputfields
                    vectors,                 // vectors
                    "title_vector",          // vectorField
                    entity.MetricType("L2"), // metricType
                    topK,                    // topK
                    sp,                      // sp
                    limit,                   // opts
                    offset,                  // opts
            )
    
            if err != nil {
                    log.Fatal("Failed to insert rows:", err.Error())
            }
    
            fmt.Println(resultsToJSON(res))
    
            // Output: 
            // [
            //         {
            //                 "counts": 5,
            //                 "distances": [
            //                         0.7496654,
            //                         0.7691308,
            //                         0.81268203,
            //                         0.8307196,
            //                         0.84897053
            //                 ],
            //                 "rows": [
            //                         {
            //                                 "link": "https://towardsdatascience.com/topic-modeling-in-power-bi-using-pycaret-54422b4e36d6",
            //                                 "title": "Topic Modeling in Power BI using PyCaret"
            //                         },
            //                         {
            //                                 "link": "https://towardsdatascience.com/topic-modeling-the-comment-section-from-a-new-york-times-article-e4775261530e",
            //                                 "title": "Topic Modeling the comment section from a New York Times article"
            //                         },
            //                         {
            //                                 "link": "https://medium.com/swlh/top-4-myths-about-app-store-conversion-rate-optimization-cro-c62476901c90",
            //                                 "title": "Top 4 Myths About App Store Conversion Rate Optimization (CRO)"
            //                         },
            //                         {
            //                                 "link": "https://medium.com/swlh/top-vs-code-extensions-for-web-developers-1e038201a8fc",
            //                                 "title": "Top VS Code extensions for Web Developers"
            //                         },
            //                         {
            //                                 "link": "https://medium.com/swlh/top-ten-mistakes-found-while-doing-code-reviews-b935ef44e797",
            //                                 "title": "Top ten mistakes found while performing code reviews"
            //                         }
            //                 ]
            //         }
            // ]  
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

    <Tabs groupId="python" defaultValue='python' values={[{"label":"Starter API","value":"python"},{"label":"Advanced API","value":"python_1"}]}>
    <TabItem value='python'>

    ```python
    # Search using a MilvusClient object
    
    res = client.search(
        collection_name=COLLECTION_NAME,
        data=[data["rows"][0]["title_vector"]],
        # highlight-start
        filter='(publication == "Towards Data Science") and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))',
        output_fields=["title", "publication", "claps", "responses", "reading_time"],
        # highlight-end
        limit=5
    )
    
    print(res)
    
    # Output
    #
    # [
    #     [
    #         {
    #             "id": 103,
    #             "distance": 0.6340133547782898,
    #             "entity": {
    #                 "title": "A Primer on Domain Adaptation",
    #                 "reading_time": 12,
    #                 "publication": "Towards Data Science",
    #                 "claps": 74,
    #                 "responses": 0
    #             }
    #         },
    #         {
    #             "id": 90,
    #             "distance": 0.6230067610740662,
    #             "entity": {
    #                 "title": "SVM: An optimization problem",
    #                 "reading_time": 11,
    #                 "publication": "Towards Data Science",
    #                 "claps": 44,
    #                 "responses": 0
    #             }
    #         },
    #         {
    #             "id": 75,
    #             "distance": 0.5751269459724426,
    #             "entity": {
    #                 "title": "Top Trends of Graph Machine Learning in 2020",
    #                 "reading_time": 11,
    #                 "publication": "Towards Data Science",
    #                 "claps": 1100,
    #                 "responses": 0
    #             }
    #         },
    #         {
    #             "id": 99,
    #             "distance": 0.5726118087768555,
    #             "entity": {
    #                 "title": "Finding optimal NBA physiques using data visualization with Python",
    #                 "reading_time": 13,
    #                 "publication": "Towards Data Science",
    #                 "claps": 89,
    #                 "responses": 0
    #             }
    #         },
    #         {
    #             "id": 80,
    #             "distance": 0.564883828163147,
    #             "entity": {
    #                 "title": "Understanding Natural Language Processing: how AI understands our languages",
    #                 "reading_time": 13,
    #                 "publication": "Towards Data Science",
    #                 "claps": 109,
    #                 "responses": 0
    #             }
    #         }
    #     ]
    # ]
    
    ```

    </TabItem>
    <TabItem value='python_1'>

    ```python
    # Search using a Collection object
    from pymilvus import Collection
    
    collection = Collection(COLLECTION_NAME)
    
    results = collection.search(
        data=[data["rows"][0]['title_vector']],
        anns_field="title_vector",
        param=search_params,
        # highlight-start
        expr='(publication == "Towards Data Science") and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))',
        output_fields=["title", "publication", "claps", "responses", "reading_time"],
        # highlight-end
        limit=5
    )
    
    entities = [ x.entity.to_dict() for x in results[0] ]
    
    print(entities)
    
    # Output
    #
    # [
    #     {
    #         "id": 5641,
    #         "distance": 0.37674015760421753,
    #         "entity": {
    #             "title": "Why The Coronavirus Mortality Rate is Misleading",
    #             "publication": "Towards Data Science",
    #             "claps": 2900,
    #             "responses": 47,
    #             "reading_time": 9
    #         }
    #     },
    #     {
    #         "id": 5780,
    #         "distance": 0.4586222767829895,
    #         "entity": {
    #             "title": "Heart Disease Risk Assessment Using Machine Learning",
    #             "publication": "Towards Data Science",
    #             "claps": 15,
    #             "responses": 0,
    #             "reading_time": 12
    #         }
    #     },
    #     {
    #         "id": 5503,
    #         "distance": 0.5037478804588318,
    #         "entity": {
    #             "title": "New Data Shows a Lower Covid-19 Fatality Rate",
    #             "publication": "Towards Data Science",
    #             "claps": 161,
    #             "responses": 3,
    #             "reading_time": 13
    #         }
    #     },
    #     {
    #         "id": 4331,
    #         "distance": 0.5255616307258606,
    #         "entity": {
    #             "title": "Common Pipenv Errors",
    #             "publication": "Towards Data Science",
    #             "claps": 20,
    #             "responses": 1,
    #             "reading_time": 11
    #         }
    #     },
    #     {
    #         "id": 2587,
    #         "distance": 0.5877483487129211,
    #         "entity": {
    #             "title": "Data quality impact on the dataset",
    #             "publication": "Towards Data Science",
    #             "claps": 61,
    #             "responses": 0,
    #             "reading_time": 12
    #         }
    #     }
    # ]
    ```

    </TabItem>
    </Tabs>
    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    async function main() {
    
        // (Continued)
        
        res = await client.search({
            collection_name: collectionName,
            vector: client_data[0].vector,
            // highlight-start
            filter: '(publication == "Towards Data Science") and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))',
            output_fields: ["title", "publication", "claps", "responses", "reading_time"],     
            // highlight-end
            limit: 5,
        })
        
        console.log(res)
    
        // Output
        // 
        // {
        //   status: { error_code: 'Success', reason: '', code: 0 },
        //   results: [
        //     {
        //       score: 0.8116300106048584,
        //       id: '5641',
        //       publication: 'Towards Data Science',
        //       claps: 2900,
        //       responses: 47,
        //       reading_time: 9,
        //       title: 'Why The Coronavirus Mortality Rate is Misleading'
        //     },
        //     {
        //       score: 0.7706888914108276,
        //       id: '5780',
        //       publication: 'Towards Data Science',
        //       claps: 15,
        //       responses: 0,
        //       reading_time: 12,
        //       title: 'Heart Disease Risk Assessment Using Machine Learning'
        //     },
        //     {
        //       score: 0.7372192144393921,
        //       id: '4331',
        //       publication: 'Towards Data Science',
        //       claps: 20,
        //       responses: 1,
        //       reading_time: 11,
        //       title: 'Common Pipenv Errors'
        //     },
        //     {
        //       score: 0.7061258554458618,
        //       id: '2587',
        //       publication: 'Towards Data Science',
        //       claps: 61,
        //       responses: 0,
        //       reading_time: 12,
        //       title: 'Data quality impact on the dataset'
        //     },
        //     {
        //       score: 0.6995357275009155,
        //       id: '1965',
        //       publication: 'Towards Data Science',
        //       claps: 47,
        //       responses: 0,
        //       reading_time: 11,
        //       title: 'Domestic Violence — The Shadow Pandemic of Covid19'
        //     }
        //   ]
        // }
        // 
    
    }
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
    
    public class UseCustomizedSchemaDemo 
    {
        public static void main( String[] args )
        {
            // (Continued)
        
            queryVectors.clear();
            queryVectors.add(queryVector1);
    
            outputFields.clear();
            outputFields.add("title");
            outputFields.add("publication");
            outputFields.add("claps");
            outputFields.add("responses");
            outputFields.add("reading_time");
    
    
            SearchParam searchParam8 = SearchParam.newBuilder()
                .withCollectionName(collectionName)
                .withVectorFieldName("title_vector")
                .withVectors(queryVectors)
                .withTopK(5)   
                .withMetricType(MetricType.L2)  
                .withParams("{\"nprobe\":1024}")
                .withConsistencyLevel(ConsistencyLevelEnum.BOUNDED)
                .withOutFields(outputFields)
                .withExpr("(publication == \"Towards Data Science\") and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))")
                .build();
    
            R<SearchResults> response8 = client.search(searchParam8);
    
            SearchResultsWrapper wrapper8 = new SearchResultsWrapper(response8.getData().getResults());
    
            List<List<JSONObject>> results8 = new ArrayList<>();
    
            for (int i = 0; i < queryVectors.size(); ++i) {
                List<SearchResultsWrapper.IDScore> scores = wrapper8.getIDScore(i);
                List<String> titles = (List<String>) wrapper8.getFieldData("title", i);
                List<String> publications = (List<String>) wrapper8.getFieldData("publication", i);
                List<Long> readingTimes = (List<Long>) wrapper8.getFieldData("reading_time", i);
                List<Long> claps_ = (List<Long>) wrapper8.getFieldData("claps", i);
                List<Long> responses_ = (List<Long>) wrapper8.getFieldData("responses", i);
                List<JSONObject> entities = new ArrayList<>();
                for (int j = 0; j < scores.size(); ++j) {
                    SearchResultsWrapper.IDScore score = scores.get(j);
                    JSONObject entity = new JSONObject();
                    entity.put("id", score.getLongID());
                    entity.put("distance", score.getScore());
                    entity.put("title", titles.get(j));
                    entity.put("publication", publications.get(j));
                    entity.put("reading_time", readingTimes.get(j));
                    entity.put("claps", claps_.get(j));
                    entity.put("responses", responses_.get(j));
                    entities.add(entity);
                }
    
                results8.add(entities);
            } 
    
            System.out.println(results8);
    
            // Output:
            // [[
            //     {
            //         "reading_time": 9,
            //         "distance": 0.37674016,
            //         "publication": "Towards Data Science",
            //         "responses": 47,
            //         "id": 445297206350474990,
            //         "title": "Why The Coronavirus Mortality Rate is Misleading",
            //         "claps": 2900
            //     },
            //     {
            //         "reading_time": 12,
            //         "distance": 0.45862228,
            //         "publication": "Towards Data Science",
            //         "responses": 0,
            //         "id": 445297206350475129,
            //         "title": "Heart Disease Risk Assessment Using Machine Learning",
            //         "claps": 15
            //     },
            //     {
            //         "reading_time": 13,
            //         "distance": 0.5037479,
            //         "publication": "Towards Data Science",
            //         "responses": 3,
            //         "id": 445297206350474852,
            //         "title": "New Data Shows a Lower Covid-19 Fatality Rate",
            //         "claps": 161
            //     },
            //     {
            //         "reading_time": 11,
            //         "distance": 0.52556163,
            //         "publication": "Towards Data Science",
            //         "responses": 1,
            //         "id": 445297206350473680,
            //         "title": "Common Pipenv Errors",
            //         "claps": 20
            //     },
            //     {
            //         "reading_time": 12,
            //         "distance": 0.58774835,
            //         "publication": "Towards Data Science",
            //         "responses": 0,
            //         "id": 445297206350471936,
            //         "title": "Data quality impact on the dataset",
            //         "claps": 61
            //     }
            // ]]
        }
    }
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    func main() {
            // (Continued)
    
            vectors = []entity.Vector{}
    
            for _, row := range data.Rows[:1] {
                    vector := make(entity.FloatVector, 0, 768)
                    vector = append(vector, row.TitleVector...)
                    vectors = append(vectors, vector)
            }
    
            sp, _ = entity.NewIndexAUTOINDEXSearchParam(1)
    
            limit = client.WithLimit(10)
            offset = client.WithOffset(0)
            topK = 5
            outputFields = []string{"title", "publication", "claps", "responses", "reading_time"}
            expr = "(publication == \"Towards Data Science\") and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))"
    
            res, err = conn.Search(
                    context.Background(),    // context
                    COLLNAME,                // collectionName
                    []string{},              // partitionNames
                    expr,                    // expr
                    outputFields,            // outputfields
                    vectors,                 // vectors
                    "title_vector",          // vectorField
                    entity.MetricType("L2"), // metricType
                    topK,                    // topK
                    sp,                      // sp
                    limit,                   // opts
                    offset,                  // opts
            )
    
            if err != nil {
                    log.Fatal("Failed to insert rows:", err.Error())
            }
    
            fmt.Println(resultsToJSON(res))
    
            // Output: 
            // [
            //         {
            //                 "counts": 5,
            //                 "distances": [
            //                         0.37674016,
            //                         0.45862228,
            //                         0.5037479,
            //                         0.52556163,
            //                         0.58774835
            //                 ],
            //                 "rows": [
            //                         {
            //                                 "claps": 2900,
            //                                 "publication": "Towards Data Science",
            //                                 "reading_time": 9,
            //                                 "responses": 47,
            //                                 "title": "Why The Coronavirus Mortality Rate is Misleading"
            //                         },
            //                         {
            //                                 "claps": 15,
            //                                 "publication": "Towards Data Science",
            //                                 "reading_time": 12,
            //                                 "responses": 0,
            //                                 "title": "Heart Disease Risk Assessment Using Machine Learning"
            //                         },
            //                         {
            //                                 "claps": 161,
            //                                 "publication": "Towards Data Science",
            //                                 "reading_time": 13,
            //                                 "responses": 3,
            //                                 "title": "New Data Shows a Lower Covid-19 Fatality Rate"
            //                         },
            //                         {
            //                                 "claps": 20,
            //                                 "publication": "Towards Data Science",
            //                                 "reading_time": 11,
            //                                 "responses": 1,
            //                                 "title": "Common Pipenv Errors"
            //                         },
            //                         {
            //                                 "claps": 61,
            //                                 "publication": "Towards Data Science",
            //                                 "reading_time": 12,
            //                                 "responses": 0,
            //                                 "title": "Data quality impact on the dataset"
            //                         }
            //                 ]
            //         }
            // ]   
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

<Tabs groupId="python" defaultValue='python' values={[{"label":"Starter API","value":"python"},{"label":"Advanced API","value":"python_1"}]}>
<TabItem value='python'>

```python
# Search using a MilvusClient object

# Perform a query
res = client.query(
    collection_name=COLLECTION_NAME,
    filter='(publication == "Towards Data Science") and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))',
    output_fields=["title", "publication", "claps", "responses", "reading_time"],
    limit=3,
)

print(res)

# Output
#
# [
#     {
#         "title": "Top 10 In-Demand programming languages to learn in 2020",
#         "reading_time": 21,
#         "publication": "Towards Data Science",
#         "claps": 3000,
#         "responses": 18,
#         "id": 69
#     },
#     {
#         "title": "Data Cleaning in Python: the Ultimate Guide (2020)",
#         "reading_time": 12,
#         "publication": "Towards Data Science",
#         "claps": 1500,
#         "responses": 7,
#         "id": 73
#     },
#     {
#         "title": "Top Trends of Graph Machine Learning in 2020",
#         "reading_time": 11,
#         "publication": "Towards Data Science",
#         "claps": 1100,
#         "responses": 0,
#         "id": 75
#     }
# ]

```

</TabItem>
<TabItem value='python_1'>

```python
# Search using a Collection object
from pymilvus import Collection

collection = Collection(COLLECTION_NAME)

# query

results = collection.query(
    expr='(publication == "Towards Data Science") and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))',
    output_fields=["title", "publication", "claps", "responses", "reading_time"],
    limit=5
)

print(results)

# Output
#
# [
#     {
#         "reading_time": 21,
#         "id": 69,
#         "title": "Top 10 In-Demand programming languages to learn in 2020",
#         "publication": "Towards Data Science",
#         "claps": 3000,
#         "responses": 18
#     },
#     {
#         "reading_time": 12,
#         "id": 73,
#         "title": "Data Cleaning in Python: the Ultimate Guide (2020)",
#         "publication": "Towards Data Science",
#         "claps": 1500,
#         "responses": 7
#     },
#     {
#         "reading_time": 11,
#         "id": 75,
#         "title": "Top Trends of Graph Machine Learning in 2020",
#         "publication": "Towards Data Science",
#         "claps": 1100,
#         "responses": 0
#     },
#     {
#         "reading_time": 12,
#         "id": 79,
#         "title": "Rage Quitting Cancer Research",
#         "publication": "Towards Data Science",
#         "claps": 331,
#         "responses": 3
#     },
#     {
#         "reading_time": 13,
#         "id": 80,
#         "title": "Understanding Natural Language Processing: how AI understands our languages",
#         "publication": "Towards Data Science",
#         "claps": 109,
#         "responses": 0
#     }
# ]
```

</TabItem>
</Tabs>
</TabItem>

<TabItem value='javascript'>

```javascript
async function main() {

    // (Continued)
    
    // Perform a query
    res = await client.query({
        collection_name: collectionName,
        filter: '(publication == "Towards Data Science") and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))',
        output_fields: ["title", "publication", "claps", "responses", "reading_time"],
        limit: 5,
    })
    
    console.log(res)

    // Output
    // 
    // {
    //   status: { error_code: 'Success', reason: '', code: 0 },
    //   data: [
    //     { '$meta': [Object], id: '69' },
    //     { '$meta': [Object], id: '73' },
    //     { '$meta': [Object], id: '75' },
    //     { '$meta': [Object], id: '79' },
    //     { '$meta': [Object], id: '80' }
    //   ]
    // }
    // 

}
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

public class UseCustomizedSchemaDemo 
{
    public static void main( String[] args )
    {
        // (Continued)
        
        outputFields.clear();
        outputFields.add("title");
        outputFields.add("publication");
        outputFields.add("claps");
        outputFields.add("responses");
        outputFields.add("reading_time");

        QueryParam queryParam = QueryParam.newBuilder()
            .withCollectionName(collectionName)
            .withExpr("(publication == \"Towards Data Science\") and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))")
            .withOutFields(outputFields)
            .withLimit(5L)
            .build();
        
        R<QueryResults> queryResponse = client.query(queryParam);

        QueryResultsWrapper queryResultsWrapper = new QueryResultsWrapper(queryResponse.getData());

        List<List<JSONObject>> queryResults = new ArrayList<>();

        List<Long> ids = (List<Long>) queryResultsWrapper.getFieldWrapper("id").getFieldData();
        List<String> titles = (List<String>) queryResultsWrapper.getFieldWrapper("title").getFieldData();
        List<String> publications = (List<String>) queryResultsWrapper.getFieldWrapper("publication").getFieldData();
        List<Long> readingTimes = (List<Long>) queryResultsWrapper.getFieldWrapper("reading_time").getFieldData();
        List<Long> claps_ = (List<Long>) queryResultsWrapper.getFieldWrapper("claps").getFieldData();
        List<Long> responses_ = (List<Long>) queryResultsWrapper.getFieldWrapper("responses").getFieldData();
        List<JSONObject> entities = new ArrayList<>();
        for (int j = 0; j < ids.size(); ++j) {
            JSONObject entity = new JSONObject();
            entity.put("id", ids.get(j));
            entity.put("title", titles.get(j));
            entity.put("publication", publications.get(j));
            entity.put("reading_time", readingTimes.get(j));
            entity.put("claps", claps_.get(j));
            entity.put("responses", responses_.get(j));
            entities.add(entity);
        }

        queryResults.add(entities);

        System.out.println(queryResults);

        // Output:
        // [[
        //     {
        //         "reading_time": 21,
        //         "publication": "Towards Data Science",
        //         "responses": 18,
        //         "id": 445297206350829274,
        //         "title": "Top 10 In-Demand programming languages to learn in 2020",
        //         "claps": 3000
        //     },
        //     {
        //         "reading_time": 12,
        //         "publication": "Towards Data Science",
        //         "responses": 7,
        //         "id": 445297206350829278,
        //         "title": "Data Cleaning in Python: the Ultimate Guide (2020)",
        //         "claps": 1500
        //     },
        //     {
        //         "reading_time": 11,
        //         "publication": "Towards Data Science",
        //         "responses": 0,
        //         "id": 445297206350829280,
        //         "title": "Top Trends of Graph Machine Learning in 2020",
        //         "claps": 1100
        //     },
        //     {
        //         "reading_time": 12,
        //         "publication": "Towards Data Science",
        //         "responses": 3,
        //         "id": 445297206350829284,
        //         "title": "Rage Quitting Cancer Research",
        //         "claps": 331
        //     },
        //     {
        //         "reading_time": 13,
        //         "publication": "Towards Data Science",
        //         "responses": 0,
        //         "id": 445297206350829285,
        //         "title": "Understanding Natural Language Processing: how AI understands our languages",
        //         "claps": 109
        //     }
        // ]]
    }
}
```

</TabItem>

<TabItem value='go'>

```go
func main() {
        // (Continued)
        limit := client.WithLimit(10)
        offset := client.WithOffset(0)

        resq, err := conn.Query(
                context.Background(),
                COLLNAME,
                []string{},
                expr,
                outputFields,
                limit,
                offset,
        )

        if err != nil {
                log.Fatal("Failed to query rows:", err.Error())
        }

        fmt.Println(resultSetToJSON(resq, false))

        // Output: 
        // [
        //         {
        //                 "claps": 3000,
        //                 "id": 69,
        //                 "publication": "Towards Data Science",
        //                 "reading_time": 21,
        //                 "responses": 18,
        //                 "title": "Top 10 In-Demand programming languages to learn in 2020"
        //         },
        //         {
        //                 "claps": 1500,
        //                 "id": 73,
        //                 "publication": "Towards Data Science",
        //                 "reading_time": 12,
        //                 "responses": 7,
        //                 "title": "Data Cleaning in Python: the Ultimate Guide (2020)"
        //         },
        //         {
        //                 "claps": 1100,
        //                 "id": 75,
        //                 "publication": "Towards Data Science",
        //                 "reading_time": 11,
        //                 "responses": 0,
        //                 "title": "Top Trends of Graph Machine Learning in 2020"
        //         },
        //         {
        //                 "claps": 331,
        //                 "id": 79,
        //                 "publication": "Towards Data Science",
        //                 "reading_time": 12,
        //                 "responses": 3,
        //                 "title": "Rage Quitting Cancer Research"
        //         },
        //         {
        //                 "claps": 109,
        //                 "id": 80,
        //                 "publication": "Towards Data Science",
        //                 "reading_time": 13,
        //                 "responses": 0,
        //                 "title": "Understanding Natural Language Processing: how AI understands our languages"
        //         },
        //         {
        //                 "claps": 44,
        //                 "id": 90,
        //                 "publication": "Towards Data Science",
        //                 "reading_time": 11,
        //                 "responses": 0,
        //                 "title": "SVM: An optimization problem"
        //         },
        //         {
        //                 "claps": 89,
        //                 "id": 99,
        //                 "publication": "Towards Data Science",
        //                 "reading_time": 13,
        //                 "responses": 0,
        //                 "title": "Finding optimal NBA physiques using data visualization with Python"
        //         },
        //         {
        //                 "claps": 74,
        //                 "id": 103,
        //                 "publication": "Towards Data Science",
        //                 "reading_time": 12,
        //                 "responses": 0,
        //                 "title": "A Primer on Domain Adaptation"
        //         },
        //         {
        //                 "claps": 103,
        //                 "id": 212,
        //                 "publication": "Towards Data Science",
        //                 "reading_time": 11,
        //                 "responses": 0,
        //                 "title": "How does the Bellman equation work in Deep RL?"
        //         },
        //         {
        //                 "claps": 14,
        //                 "id": 222,
        //                 "publication": "Towards Data Science",
        //                 "reading_time": 13,
        //                 "responses": 0,
        //                 "title": "Machine learning techniques for investigative reporting"
        //         }
        // ]

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

A get request is a quick query against a collection to fetch entities by their primary keys. 

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# Retrieve a set of entities by their IDs
res = client.get(
    collection_name=COLLECTION_NAME,
    ids=[1, 2, 3]
)

print(res)

# Output
#
# [
#     {
#         "id": 1,
#         "title": "Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else",
#         "link": "https://medium.com/swlh/dashboards-in-python-3-advanced-examples-for-dash-beginners-and-everyone-else-b1daf4e2ec0a",
#         "reading_time": 14,
#         "publication": "The Startup",
#         "claps": 726,
#         "responses": 3,
#         "vector": [
#             0.0039737443,
#             0.003020432,
#             -0.0006188639,
#             0.03913546,
#             -0.00089768134,
#             0.021238148,
#             0.014454661,
#             0.025742851,
#             0.0022063442,
#             -0.051130578,
#             -0.0010897011,
#             0.038453076,
#             0.011593861,
#             -0.046852026,
#             0.0064208573,
#             0.010120634,
#             -0.023668954,
#             0.041229635,
#             0.008146385,
#             -0.023367394,
#             "(748 more items hidden)"
#         ]
#     },
#     {
#         "id": 2,
#         "title": "How Can We Best Switch in Python?",
#         "link": "https://medium.com/swlh/how-can-we-best-switch-in-python-458fb33f7835",
#         "reading_time": 6,
#         "publication": "The Startup",
#         "claps": 500,
#         "responses": 7,
#         "vector": [
#             0.031961977,
#             0.00047043373,
#             -0.018263113,
#             0.027324716,
#             -0.0054595284,
#             -0.014779159,
#             0.017511465,
#             0.030381083,
#             -0.018930407,
#             -0.03372473,
#             -0.009049301,
#             0.05401713,
#             -0.030117748,
#             -0.05029242,
#             -0.004565209,
#             -0.013697411,
#             0.0091306195,
#             0.020263411,
#             0.022377398,
#             -0.013710004,
#             "(748 more items hidden)"
#         ]
#     },
#     {
#         "id": 3,
#         "title": "Maternity leave shouldn\u2019t set women back",
#         "link": "https://medium.com/swlh/maternity-leave-shouldnt-set-women-back-5019dd3129d8",
#         "reading_time": 9,
#         "publication": "The Startup",
#         "claps": 460,
#         "responses": 1,
#         "vector": [
#             0.032572296,
#             -0.011148319,
#             -0.01688577,
#             -0.0026665623,
#             -0.011911687,
#             -0.00067226397,
#             0.00549793,
#             0.024287743,
#             -0.006913468,
#             0.0077994824,
#             0.013071344,
#             0.006062147,
#             -0.00041493092,
#             0.01481426,
#             -0.030682443,
#             0.013120984,
#             0.025862636,
#             0.041487154,
#             -0.014245749,
#             -0.058048885,
#             "(748 more items hidden)"
#         ]
#     }
# ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
async function main() {

    // (Continued)

    // Get a set of entities by their IDs
    res = await client.get({
        collection_name: collectionName,
        ids: [1, 2, 3],
    });
    
    console.log(res)

    // Output
    // 
    // {
    //   status: { error_code: 'Success', reason: '', code: 0 },
    //   data: [ { id: '1' }, { id: '2' }, { id: '3' } ]
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
        
        List<Long> gids = new ArrayList<Long>();
        gids.add((Long) queryResultsWrapper.getFieldWrapper("id").getFieldData().get(0));
        gids.add((Long) queryResultsWrapper.getFieldWrapper("id").getFieldData().get(1));

        GetIdsParam getIdsParam = GetIdsParam.newBuilder()
            .withCollectionName(collectionName)
            .withPrimaryIds(gids)
            .withOutputFields(outputFields)
            .build();
        
        R<GetResponse> getResponse = client.get(getIdsParam);

        if (getResponse.getException() != null) {
            System.err.println("Failed to get: " + getResponse.getException().getMessage());
            return;
        }

        List<JSONObject> getResults = new ArrayList<>();

        for (QueryResultsWrapper.RowRecord rowRecord: getResponse.getData().getRowRecords()) {
            JSONObject object = new JSONObject();
            object.put("id", rowRecord.getFieldValues().get("id"));
            object.put("title", rowRecord.getFieldValues().get("title"));
            object.put("publication", rowRecord.getFieldValues().get("publication"));
            object.put("reading_time", rowRecord.getFieldValues().get("reading_time"));
            object.put("claps", rowRecord.getFieldValues().get("claps"));
            object.put("responses", rowRecord.getFieldValues().get("responses"));
            getResults.add(object);
        }

        System.out.println(getResults);

        // Output:
        // [
        //     {
        //         "reading_time": 21,
        //         "publication": "Towards Data Science",
        //         "responses": 18,
        //         "id": 445297206350829274,
        //         "title": "Top 10 In-Demand programming languages to learn in 2020",
        //         "claps": 3000
        //     },
        //     {
        //         "reading_time": 12,
        //         "publication": "Towards Data Science",
        //         "responses": 7,
        //         "id": 445297206350829278,
        //         "title": "Data Cleaning in Python: the Ultimate Guide (2020)",
        //         "claps": 1500
        //     }
        // ]
    }
}
```

</TabItem>

<TabItem value='go'>

```go
func main() {

        // (Continued)
        
        // get

        ids := resq.GetColumn("id")

        resg, err := conn.Get(
                context.Background(),
                COLLNAME,
                ids,
        )

        if err != nil {
                log.Fatal("Failed to get rows:", err.Error())
        }

        fmt.Println(resultSetToJSON(resg, false))

        // Output: 
        // [
        //         {
        //                 "claps": 3000,
        //                 "id": 69,
        //                 "link": "https://towardsdatascience.com/top-10-in-demand-programming-languages-to-learn-in-2020-4462eb7d8d3e",
        //                 "publication": "Towards Data Science",
        //                 "reading_time": 21,
        //                 "responses": 18,
        //                 "title": "Top 10 In-Demand programming languages to learn in 2020"
        //         },
        //         {
        //                 "claps": 1500,
        //                 "id": 73,
        //                 "link": "https://towardsdatascience.com/data-cleaning-in-python-the-ultimate-guide-2020-c63b88bf0a0d",
        //                 "publication": "Towards Data Science",
        //                 "reading_time": 12,
        //                 "responses": 7,
        //                 "title": "Data Cleaning in Python: the Ultimate Guide (2020)"
        //         },
        //         {
        //                 "claps": 1100,
        //                 "id": 75,
        //                 "link": "https://towardsdatascience.com/top-trends-of-graph-machine-learning-in-2020-1194175351a3",
        //                 "publication": "Towards Data Science",
        //                 "reading_time": 11,
        //                 "responses": 0,
        //                 "title": "Top Trends of Graph Machine Learning in 2020"
        //         },
        //         {
        //                 "claps": 331,
        //                 "id": 79,
        //                 "link": "https://towardsdatascience.com/rage-quitting-cancer-research-5e79cb04801",
        //                 "publication": "Towards Data Science",
        //                 "reading_time": 12,
        //                 "responses": 3,
        //                 "title": "Rage Quitting Cancer Research"
        //         },
        //         {
        //                 "claps": 109,
        //                 "id": 80,
        //                 "link": "https://towardsdatascience.com/understanding-nlp-how-ai-understands-our-languages-77601002cffc",
        //                 "publication": "Towards Data Science",
        //                 "reading_time": 13,
        //                 "responses": 0,
        //                 "title": "Understanding Natural Language Processing: how AI understands our languages"
        //         },
        //         {
        //                 "claps": 44,
        //                 "id": 90,
        //                 "link": "https://towardsdatascience.com/svm-an-optimization-problem-242cbb8d96a8",
        //                 "publication": "Towards Data Science",
        //                 "reading_time": 11,
        //                 "responses": 0,
        //                 "title": "SVM: An optimization problem"
        //         },
        //         {
        //                 "claps": 89,
        //                 "id": 99,
        //                 "link": "https://towardsdatascience.com/finding-optimal-nba-physiques-using-data-visualization-with-python-6ce27ac5b68f",
        //                 "publication": "Towards Data Science",
        //                 "reading_time": 13,
        //                 "responses": 0,
        //                 "title": "Finding optimal NBA physiques using data visualization with Python"
        //         },
        //         {
        //                 "claps": 74,
        //                 "id": 103,
        //                 "link": "https://towardsdatascience.com/a-primer-on-domain-adaptation-cf6abf7087a3",
        //                 "publication": "Towards Data Science",
        //                 "reading_time": 12,
        //                 "responses": 0,
        //                 "title": "A Primer on Domain Adaptation"
        //         },
        //         {
        //                 "claps": 103,
        //                 "id": 212,
        //                 "link": "https://towardsdatascience.com/how-the-bellman-equation-works-in-deep-reinforcement-learning-5301fe41b25a",
        //                 "publication": "Towards Data Science",
        //                 "reading_time": 11,
        //                 "responses": 0,
        //                 "title": "How does the Bellman equation work in Deep RL?"
        //         },
        //         {
        //                 "claps": 14,
        //                 "id": 222,
        //                 "link": "https://towardsdatascience.com/machine-learning-techniques-for-investigative-reporting-344d74f69f84",
        //                 "publication": "Towards Data Science",
        //                 "reading_time": 13,
        //                 "responses": 0,
        //                 "title": "Machine learning techniques for investigative reporting"
        //         }
        // ]
}
```

</TabItem>
</Tabs>

## Related topics{#related-topics}

- [Create Collection](./create-collection) 

- [Drop Collection](./drop-collection) 

- [Enable Dynamic Schema](./enable-dynamic-schema) 

- [JavaScript Object Notation (JSON)](./javascript-object-notation-json) 
