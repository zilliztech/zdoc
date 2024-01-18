---
slug: /conduct-a-range-search
beta: TRUE
notebook: 11_conduct_a_range_search.ipynb
token: PXk1wQm7GiMgqDkUWJAcdgpGny0
sidebar_position: 17
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

#  Conduct a Range Search

Understanding how to filter your search results by the proximity of entities is crucial in vector operations. A range search serves this exact purpose by narrowing down results according to the distance between a query vector and vectors. This guide will walk you through the process of conducting a range search in Zilliz Cloud, which consists of a vector similarity search followed by distance-based filtering.

<Admonition type="info" icon="📘" title="Notes">

The support for range search is available as a Beta feature. The feature and the documentation may change anytime during the Beta stage.

</Admonition>

## Before you start{#before-you-start}

Before conducting a range search, make sure the following conditions are met:

- You have upgraded your cluster to the Beta version.

- You have downloaded the example dataset. For details, see [Example Dataset](./example-dataset).

- You have created a collection with a schema matching the example dataset and inserted data into the collection. For details, see [Create Collection](./create-collection).

## Quick steps for a range search{#quick-steps-for-a-range-search}

1. [Load collection and insert data](./conduct-a-range-search#step-1-load-collection-and-insert-data): Initiate by ensuring your dataset is loaded and ready for search.

1. [Configure range filtering](./conduct-a-range-search#step-2-configure-range-filtering): Define `radius` and `range_filter` parameters to control your search precision. Zilliz Cloud provides **L2 (Euclidean)** and **IP (Inner Product)** metric types for distance measuring. The configuration of `radius` and `range_filter` is affected by the metric type used for distance measuring.

1. [Execute the search](./conduct-a-range-search#step-3-execute-the-range-search): Perform the range search using the parameters set in step 2. The vectors returned will be within the range you specified, tailored to the distance metrics you have chosen.

<Admonition type="info" icon="📘" title="Notes">

The code snippets on this page assume that you have created a collection and inserted data based on the steps on [Create Collection](./create-collection).

</Admonition>

## Step 1: Load collection and insert data{#step-1-load-collection-and-insert-data}

Before anything else, make sure the collection is loaded into memory as Zilliz Cloud operates in memory for search and query functions.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus import Collection

DATASET_PATH="{}/../medium_articles_2020_dpr.json".format(os.path.dirname(__file__)) # Set your dataset path

# (Continued)

collection = Collection(COLLECTION_NAME)

# Load collection
collection.load()

# Get loading progress
progress = utility.loading_progress(COLLECTION_NAME)

print(progress)

# Output
#
# {
#     "loading_progress": "100%"
# }

# Prepare a list of rows
with open(DATASET_PATH) as f:
    data = json.load(f)
    rows = data['rows']

print(rows[:3])

# Output
#
# [
#     {
#         "id": 0,
#         "title": "The Reported Mortality Rate of Coronavirus Is Not Important",
#         "title_vector": [
#             0.041732933,
#             0.013779674,
#             -0.027564144,
#             -0.013061441,
#             0.009748648,
#             0.00082446384,
#             -0.00071647146,
#             0.048612226,
#             -0.04836573,
#             -0.04567751,
#             "(758 more items hidden)"
#         ],
#         "link": "https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912",
#         "reading_time": 13,
#         "publication": "The Startup",
#         "claps": 1100,
#         "responses": 18
#     },
#     {
#         "id": 1,
#         "title": "Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else",
#         "title_vector": [
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
#             "(758 more items hidden)"
#         ],
#         "link": "https://medium.com/swlh/dashboards-in-python-3-advanced-examples-for-dash-beginners-and-everyone-else-b1daf4e2ec0a",
#         "reading_time": 14,
#         "publication": "The Startup",
#         "claps": 726,
#         "responses": 3
#     },
#     {
#         "id": 2,
#         "title": "How Can We Best Switch in Python?",
#         "title_vector": [
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
#             "(758 more items hidden)"
#         ],
#         "link": "https://medium.com/swlh/how-can-we-best-switch-in-python-458fb33f7835",
#         "reading_time": 6,
#         "publication": "The Startup",
#         "claps": 500,
#         "responses": 7
#     }
# ]

# Insert data
results = collection.insert(rows)

print(f"Data inserted successfully! inserted rows: {results.insert_count}")

# Output
#
# Data inserted successfully! inserted rows: 5979

time.sleep(10)
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";
const data_file = `./medium_articles_2020_dpr.json`
const collectionName = "medium_articles_2020"

async function main() {
    // (Continued)
    
    res = await client.loadCollection({
        collection_name: collectionName
    });
    
    console.log(res);
    
    // Output
    // { error_code: 'Success', reason: '' }
    
    res = await client.getLoadingProgress({
        collection_name: collectionName
    });
    
    console.log(res);
    
    // Output:
    // { status: { error_code: 'Success', reason: '' }, progress: '100' }
}

// 5. Insert vectors
const data = JSON.parse(fs.readFileSync(data_file, "utf8"))

// read rows
const rows = data["rows"]
const row = rows[0]

console.log(Object.keys(row))

// Output
// 
// [
//   'id',
//   'title',
//   'title_vector',
//   'link',
//   'reading_time',
//   'publication',
//   'claps',
//   'responses'
// ]
// 

//insert vectors
res = await client.insert({
    collection_name: collectionName,
    data: rows
})

console.log(res)

// Output
// 
// {
//   succ_index: [
//      0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11,
//     12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
//     24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
//     36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
//     48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
//     60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71,
//     72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83,
//     84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95,
//     96, 97, 98, 99,
//     ... 5879 more items
//   ],
//   err_index: [],
//   status: { error_code: 'Success', reason: '', code: 0 },
//   IDs: { int_id: { data: [Array] }, id_field: 'int_id' },
//   acknowledged: false,
//   insert_cnt: '5979',
//   delete_cnt: '0',
//   upsert_cnt: '0',
//   timestamp: '445332879628304386'
// }
// 

await sleep(5000)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.param.LoadCollectionParam;

// (Continued)

// Load collection

LoadCollectionParam loadCollectionParam = LoadCollectionParam.newBuilder()
.withCollectionName(collectionName)
.build();

R<RpcStatus> loadCollectionRes = client.loadCollection(loadCollectionParam);

if (loadCollectionRes.getException() != null) {
System.err.println("Failed to load collection: " + loadCollectionRes.getException().getMessage());
return;
}

System.out.println("Collection loaded!");

// Output:
// Collection loaded!

// 6. Insert vectors

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
List<JSONObject> rows = getRows(dataset.getJSONArray("rows"), 5979);
List<Field> fields = getFields(dataset.getJSONArray("rows"), 5979);

InsertParam insertParam = InsertParam.newBuilder()
    .withCollectionName(collectionName)
    .withFields(fields)
    .build();

R<MutationResult> insertResponse = client.insert(insertParam);

if (insertResponse.getStatus() != R.Status.Success.getCode()) {
    System.err.println(insertResponse.getMessage());
}

MutationResultWrapper mutationResultWrapper = new MutationResultWrapper(insertResponse.getData());

System.out.println("Successfully insert entities: " + mutationResultWrapper.getInsertCount());   

// Output:
// Successfully insert entities: 5979

// wait for a while
try {
    // pause execution for 5 seconds
    Thread.sleep(5000);
} catch (InterruptedException e) {
    // handle the exception
    Thread.currentThread().interrupt();
}  
```

</TabItem>
</Tabs>

## Step 2: Configure range filtering{#step-2-configure-range-filtering}

With Zilliz Cloud, a range search is differentiated from a standard [vector search](./search-query-and-get#single-vector-search) by two key parameters:

- `radius`: Determines the threshold of least similarity.

- `range_filter`: Optionally refines the search to vectors within a specific similarity range.

These parameters are of the `FLOAT` type and are pivotal in balancing accuracy and search efficiency.

### Distance metrics influence{#distance-metrics-influence}

- **L2** distance: Filters vectors less distant than `radius`, since smaller L2 distances indicate higher similarity. To exclude the closest vectors from results, set `range_filter` less than `radius`.

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"}]}>
    <TabItem value='python'>

    ```python
    # Define search parameters
    search_params = {
        "metric_type": "L2",
        "params": {
            "nprobe": 10,
            "radius": 1.0,
            "range_filter": 0.8
        }
    }
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    const params = {
        nprobe: 10,
        radius: 1.0,
        range_filter: 0.8
    }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    params = "{\"nprobe\": 10, \"radius\": 1.0, \"range_filter\": 0.8}"
    ```

    </TabItem>
    </Tabs>

- **IP** distance: Filters vectors more distant than `radius`, since larger IP distances indicate higher similarity. Here, `range_filter` should be greater than `radius` to exclude the most similar vectors.

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"}]}>
    <TabItem value='python'>

    ```python
    # Define search parameters
    # When metric_type is set to IP,
    # `radius` and `range_filter` are reversed compared to `L2` metric
    
    search_params = {
        "metric_type": "IP",
        "params": {
            "nprobe": 10,
            "radius": 0.8,
            "range_filter": 1.0
        }
    }
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // Define search parameters
    // When metric_type is set to IP,
    // `radius` and `range_filter` are reversed compared to `L2` metric
    
    const params = {
        nprobe: 10,
        radius: 0.8,
        range_filter: 1.0
    }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    params = "{\"nprobe\": 10, \"radius\": 0.8, \"range_filter\": 1.0}"
    ```

    </TabItem>
    </Tabs>

## Step 3: Execute the range search{#step-3-execute-the-range-search}

Once parameters are all set, get vectors whose distance falls into a specified range:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
# conduct a range search
query_vector = rows[0]['title_vector']

res = collection.search(
    data=[query_vector],
    anns_field="title_vector",
    param=search_params,
    output_fields=["title", "link"],
    limit=100,
)

ids = [ hits.ids for hits in res ]

print(ids)

# Output
#
# [
#     [
#         1846,
#         2906,
#         4411,
#         3503,
#         4397,
#         4969,
#         2705,
#         3185,
#         5532,
#         1969,
#         "(90 more items hidden)"
#     ]
# ]

distances = [ hits.distances for hits in res ]

print(distances)

# Output
#
# [
#     [
#         0.8001112341880798,
#         0.8001610040664673,
#         0.8003642559051514,
#         0.8004330992698669,
#         0.8004655838012695,
#         0.8004793524742126,
#         0.8005216121673584,
#         0.8005879521369934,
#         0.8005922436714172,
#         0.8007100224494934,
#         "(90 more items hidden)"
#     ]
# ]

results = [ {
    "id": hit.id,
    "distance": hit.distance,
    "entity": {
        "title": hit.entity.get("title"),
        "link": hit.entity.get("link"),
    }
} for hits in res for hit in hits ]

print(results)

# Output
#
# [
#     {
#         "id": 1846,
#         "distance": 0.8001112341880798,
#         "entity": {
#             "title": "Simple VSCode Setup To Develop C++",
#             "link": "https://medium.com/swlh/simple-vscode-setup-to-develop-c-7830182ee4d8"
#         }
#     },
#     {
#         "id": 2906,
#         "distance": 0.8001610040664673,
#         "entity": {
#             "title": "Binary cross-entropy and logistic regression",
#             "link": "https://towardsdatascience.com/binary-cross-entropy-and-logistic-regression-bf7098e75559"
#         }
#     },
#     {
#         "id": 4411,
#         "distance": 0.8003642559051514,
#         "entity": {
#             "title": "Why Passion Is Not Enough in the Working World \u2014 Learn Professionalism Instead",
#             "link": "https://medium.com/swlh/why-passion-is-not-enough-in-the-working-world-learn-professionalism-instead-d1bdb0acd750"
#         }
#     },
#     {
#         "id": 3503,
#         "distance": 0.8004330992698669,
#         "entity": {
#             "title": "Figma to video prototyping \u2014 easy way in 3 steps",
#             "link": "https://uxdesign.cc/figma-to-video-prototyping-easy-way-in-3-steps-d7ac3770d253"
#         }
#     },
#     {
#         "id": 4397,
#         "distance": 0.8004655838012695,
#         "entity": {
#             "title": "An Introduction to Survey Research",
#             "link": "https://medium.com/swlh/an-introduction-to-survey-research-ba9e9fb9ca57"
#         }
#     },
#     {
#         "id": 4969,
#         "distance": 0.8004793524742126,
#         "entity": {
#             "title": "Warning: Your campaign (process) is broken",
#             "link": "https://medium.com/swlh/warning-your-campaign-process-is-broken-97f3c603f8aa"
#         }
#     },
#     {
#         "id": 2705,
#         "distance": 0.8005216121673584,
#         "entity": {
#             "title": "Exploratory Data Analysis: DataPrep.eda vs Pandas-Profiling",
#             "link": "https://towardsdatascience.com/exploratory-data-analysis-dataprep-eda-vs-pandas-profiling-7137683fe47f"
#         }
#     },
#     {
#         "id": 3185,
#         "distance": 0.8005879521369934,
#         "entity": {
#             "title": "Modelling Volatile Time Series with LSTM Networks",
#             "link": "https://towardsdatascience.com/modelling-volatile-time-series-with-lstm-networks-51250fb7cfa3"
#         }
#     },
#     {
#         "id": 5532,
#         "distance": 0.8005922436714172,
#         "entity": {
#             "title": "Removing \u2018The Wall\u2019 in ML Ops",
#             "link": "https://towardsdatascience.com/removing-the-wall-in-ml-ops-44dac377b4c6"
#         }
#     },
#     {
#         "id": 1969,
#         "distance": 0.8007100224494934,
#         "entity": {
#             "title": "Base Plotting in R",
#             "link": "https://towardsdatascience.com/base-plotting-in-r-eb365da06b22"
#         }
#     },
#     "(90 more items hidden)"
# ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 6. Conduct a range search

res = await client.search({
    collection_name: collectionName,
    vector: rows[0].title_vector,
    limit: 100,
    filter: "claps > 30 and reading_time < 10",
    output_fields: ["title", "link"],
    params: {
        nprobe: 10,
        radius: 1.0,
        range_filter: 0.8
    }
});

// Count the results

console.log(res.results.length);

// Output
// 
// 100
// 

// List first few results

console.log(res.results.slice(0, 5));

// Output
// 
// [
//   {
//     score: 0.8003642559051514,
//     id: '4411',
//     title: 'Why Passion Is Not Enough in the Working World — Learn Professionalism Instead',
//     link: 'https://medium.com/swlh/why-passion-is-not-enough-in-the-working-world-learn-professionalism-instead-d1bdb0acd750'
//   },
//   {
//     score: 0.8004330992698669,
//     id: '3503',
//     title: 'Figma to video prototyping — easy way in 3 steps',
//     link: 'https://uxdesign.cc/figma-to-video-prototyping-easy-way-in-3-steps-d7ac3770d253'
//   },
//   {
//     score: 0.8004655838012695,
//     id: '4397',
//     title: 'An Introduction to Survey Research',
//     link: 'https://medium.com/swlh/an-introduction-to-survey-research-ba9e9fb9ca57'
//   },
//   {
//     score: 0.8005216121673584,
//     id: '2705',
//     title: 'Exploratory Data Analysis: DataPrep.eda vs Pandas-Profiling',
//     link: 'https://towardsdatascience.com/exploratory-data-analysis-dataprep-eda-vs-pandas-profiling-7137683fe47f'
//   },
//   {
//     score: 0.8005879521369934,
//     id: '3185',
//     title: 'Modelling Volatile Time Series with LSTM Networks',
//     link: 'https://towardsdatascience.com/modelling-volatile-time-series-with-lstm-networks-51250fb7cfa3'
//   }
// ]
// 
```

</TabItem>

<TabItem value='java'>

```java
// 7. Search vectors

List<List<Float>> queryVectors = new ArrayList<>();
List<Float> queryVector1 = rows.get(0).getJSONArray("title_vector").toJavaList(Float.class);
queryVectors.add(queryVector1);

List<String> outputFields = new ArrayList<>();
outputFields.add("title");
outputFields.add("link");

// Search vectors in a collection

SearchParam searchParam = SearchParam.newBuilder()
    .withCollectionName(collectionName)
    .withVectorFieldName("title_vector")
    .withVectors(queryVectors)
    .withTopK(5)   
    .withMetricType(MetricType.L2) 
    // Set the 'radius' and 'range_filter' here! 
    .withParams("{\"nprobe\":10,\"radius\":1.0, \"range_filter\":0.8}")
    .withConsistencyLevel(ConsistencyLevelEnum.BOUNDED)
    .withOutFields(outputFields)
    .withExpr("(publication == \"Towards Data Science\") and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))")
    .build();

R<SearchResults> response = client.search(searchParam);

SearchResultsWrapper wrapper = new SearchResultsWrapper(response.getData().getResults());

List<List<JSONObject>> results = new ArrayList<>();

for (int i = 0; i < queryVectors.size(); ++i) {
    List<SearchResultsWrapper.IDScore> scores = wrapper.getIDScore(i);
    List<JSONObject> entities = new ArrayList<>();
    for (int j = 0; j < scores.size(); ++j) {
        SearchResultsWrapper.IDScore score = scores.get(j);
        JSONObject entity = new JSONObject(1, true);
        entity.put("id", score.getLongID());
        entity.put("distance", score.getScore());
        entity.put("title", scores.get(j).get("title"));
        entity.put("link", scores.get(j).get("link"));
        entities.add(entity);
    }
    
    results.add(entities);
} 

System.out.println(results);

// Output:
// [[
//     {
//         "distance": 0.800161,
//         "link": "https://towardsdatascience.com/binary-cross-entropy-and-logistic-regression-bf7098e75559",
//         "id": 445494450042705136,
//         "title": "Binary cross-entropy and logistic regression"
//     },
//     {
//         "distance": 0.80130583,
//         "link": "https://towardsdatascience.com/what-i-learnt-from-taking-a-masters-in-computer-vision-and-machine-learning-69f0c6dfe9df",
//         "id": 445494450042703937,
//         "title": "What I Learnt From Taking A Masters In Computer Vision And Machine Learning"
//     },
//     {
//         "distance": 0.8042611,
//         "link": "https://towardsdatascience.com/do-not-use-to-join-strings-in-python-f89908307273",
//         "id": 445494450042703425,
//         "title": "Do Not Use \u201c+\u201d to Join Strings in Python"
//     },
//     {
//         "distance": 0.8053469,
//         "link": "https://towardsdatascience.com/using-data-science-to-study-economic-inequality-in-the-united-states-1101e9350c3d",
//         "id": 445494450042703983,
//         "title": "Using Data Science to Study Economic Inequality in the United States"
//     },
//     {
//         "distance": 0.80535966,
//         "link": "https://towardsdatascience.com/learn-ai-today-01-getting-started-with-pytorch-2e3ba25a518",
//         "id": 445494450042703567,
//         "title": "Learn AI Today: 01 \u2014 Getting started with Pytorch"
//     }
// ]]
```

</TabItem>
</Tabs>

## Takeaways{#takeaways}

Zilliz Cloud returns vectors that fit within the specified range based on your `radius` and `range_filter` settings. Below is a quick reference table summarizing how different distance metrics affect these settings:

|  Metric Type |  Configuration                         |
| ------------ | -------------------------------------- |
|  **L2**      |  `range_filter` <= distance < `radius` |
|  **IP**      |  `radius` < distance <= `range_filter` |

## Related topics{#related-topics}

- [Search, Query, and Get](./search-query-and-get)

- [Search and Query with Iterators](./search-and-query-iterators)

- [Search and Query with Advanced Expressions](./search-and-query-advanced-expressions) 

