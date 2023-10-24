---
slug: /quick-start-1
beta: FALSE
notebook: 00_quick_start.ipynb
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Quick Start

This tutorial guides you through the following tasks in a serverless cluster:

- Creating a collection

- Viewing collections

- Inserting data

- Performing search, query, and get operations

- Deleting entities

- Dropping the collection

## Before you start{#before-you-start}

Throughout this guide, we will use Zilliz Cloud's SDKs ([Starter API]([object Promise])) and RESTful API. Before you begin, ensure that:

- You have registered an account with Zilliz Cloud at [https://cloud.zilliz.com/signup]([object Promise]). For details, see [Register with Zilliz Cloud]([object Promise]).

- You have subscribed to the **Starter** plan and created a serverless cluster in a project. For details, see [Free Trials]([object Promise]) and [Create Cluster]([object Promise]).

- You have installed the preferred SDKs. Currently, there are four SDKs available, and they are [Python]([object Promise]), [Java]([object Promise]), [Go]([object Promise]), or [Node.js]([object Promise]). For details, see [Install SDKs]([object Promise]).

- You have downloaded the example dataset. For details, see [Example Dataset]([object Promise]).

:::info Notes

You can find the executable demos of this guide in [00_quick_start.ipynb]([object Promise]) and [00_quickstart_restful.ipynb]([object Promise]).

:::

## Create a collection{#create-a-collection}

When you create a serverless cluster in the Zilliz Cloud console, Zilliz Cloud automatically creates a collection for you.

If you want to create a collection in your cluster using the starter API, simply follow the code provided below.

It's worth noting that the starter API has dynamic schema enabled by default. When you create a collection, it will only have two predefined fields: **id** and **vector.** These fields act as the primary and vector keys, respectively. Additionally, the **autoID** attribute is enabled by default for the primary key, which means that its value will automatically increase.

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# Initialize a MilvusClient instance
# Replace uri and token with your own
client = MilvusClient(
    uri="<CLUSTER-ENDPOINT>", # Cluster endpoint obtained from the console
    token="<TOKEN>" # token="username:password" or token="your-api-key"
)

# Create a collection
client.create_collection(
    collection_name="medium_articles_2020",
    dimension=768
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

const address = "<CLUSTER-ENDPOINT>"
// - For a serverless cluster, use an API key as the token. 
// - For a dedicated cluster, use the cluster credentials as the token in the format of 'user:password'.
const token = "<TOKEN>"

// Include the following in an async function declaration
async function main () {

        // Connect to the cluster
        const client = new MilvusClient({address, token})
        
        // Create a collection
        let res = await client.createCollection({
            collection_name: "medium_articles_2020",
            dimension: 768,
        });

  console.log(res)

}

main()
        
// Output
// { error_code: 'Success', reason: '' }
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

import io.milvus.client.MilvusServiceClient;
import io.milvus.grpc.DescribeCollectionResponse;
import io.milvus.grpc.FlushAllResponse;
import io.milvus.grpc.FlushResponse;
import io.milvus.param.ConnectParam;
import io.milvus.param.R;
import io.milvus.param.RpcStatus;
import io.milvus.param.collection.DescribeCollectionParam;
import io.milvus.param.collection.DropCollectionParam;
import io.milvus.param.collection.FlushParam;
import io.milvus.param.highlevel.collection.CreateSimpleCollectionParam;
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
        // 1. Connect to Zilliz Cloud
        // - For a serverless cluster, use an API key as the token.                                 
        // - For a dedicated cluster, use the cluster credentials as the token in the format of 'user:password'.
        ConnectParam connectParam = ConnectParam.newBuilder()
            .withUri(CLUSTER-ENDPOINT)
            .withToken(API-KEY)
            .build();

        MilvusServiceClient client = new MilvusServiceClient(connectParam);

        System.out.println("Connected to Zilliz Cloud!");

        // 2. Create collection

        CreateSimpleCollectionParam createCollectionParam = CreateSimpleCollectionParam.newBuilder()
            .withCollectionName("medium_articles_2020")
            .withDimension(768)
            .build();

        R<RpcStatus> createCollection = client.createCollection(createCollectionParam);

        if (createCollection.getException() != null) {
            System.out.println("Failed to create collection: " + createCollection.getException().getMessage());
            return;            
        }

     }
}
```

</TabItem>

<TabItem value='bash'>

```bash
# Replace PUBLIC_ENDPOINT and TOKEN with your own 
# - For a serverless cluster, use an API key as the token. 
# - For a dedicated cluster, use the cluster credentials as the token in the format of 'user:password'.
curl --location --request POST "${PUBLIC_ENDPOINT}/v1/vector/collections/create" \\
    --header "Authorization: Bearer ${TOKEN}" \\
    --header "Content-Type: application/json" \\
    --header "Accept: */*" \\
    --data '{
        "collectionName": "medium_articles_2020",
        "dimension": 768
    }'

# Output
# { "code": 200, "data": {} }
```

</TabItem>
</Tabs>

If you need full control of your collection, such as schema definition and manual enabling of dynamic schema, refer to [Use Customized Schema]([object Promise]) and [Enable Dynamic Schema]([object Promise]).

:::info Notes

Each serverless cluster contains a maximum of two collections with basic settings. If you encounter an error while creating a collection, please check the number of collections on the Zilliz Cloud console.

:::

## View collections{#view-collections}

To view information about a collection, you can make **DescribeCollection** API calls. The **DescribeCollection** operation returns the details of a specific collection.

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.describe_collection(
    collection_name='medium_articles_2020'
)

print(res)

# Output
# {
#     'auto_id': False, 
#     'description': '', 
#     'fields': [
#         {
#             'name': 'id', 
#             'description': '', 
#             'type': <DataType.INT64: 5>, 
#             'is_primary': True, 
#             'auto_id': False
#         }, {
#             'name': 'vector', 
#             'description': '', 
#             'type': <DataType.FLOAT_VECTOR: 101>, 
#             'params': {'dim': 768}
#         }
#     ], 
#     'enable_dynamic_field': True
# }
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Include the following in the above async function declaration
res = await client.describeCollection({
    collection_name: "medium_articles_2020"
});

console.log(res);

// Output
//
// {
//   virtual_channel_names: [ 'in01-*-rootcoord-dml_3_442169042773616536v0' ],
//   physical_channel_names: [ 'in01-*-rootcoord-dml_3' ],
//   aliases: [],
//   start_positions: [],
//   properties: [],
//   status: { error_code: 'Success', reason: '' },
//   schema: {
//     fields: [ [Object], [Object] ],
//     name: 'medium_articles_2020',
//     description: '',
//     autoID: false,
//     enable_dynamic_field: true
//   },
//   collectionID: '442169042773616536',
//   created_timestamp: '442193106291654660',
//   created_utc_timestamp: '1686832833449',
//   shards_num: 1,
//   consistency_level: 'Bounded',
//   collection_name: 'medium_articles_2020',
//   db_name: 'db_afa0537cbd247e',
//   num_partitions: '1'
// }
```

</TabItem>

<TabItem value='java'>

```java
// Include the following in the above main function.

// 3. Describe collection
String collectionName = "medium_articles_2020";

DescribeCollectionParam describeCollectionParam = DescribeCollectionParam.newBuilder()
    .withCollectionName(collectionName)
    .build();

R<DescribeCollectionResponse> collectionInfo = client.describeCollection(describeCollectionParam);

System.out.println("Collection info: " + collectionInfo.toString());

// Output
// Collection info: R{status=0, data=status {
// }
// schema {
//   name: "medium_articles_2020"
//   fields {
//     fieldID: 100
//     name: "id"
//     is_primary_key: true
//     data_type: Int64
//   }
//   fields {
//     fieldID: 101
//     name: "vector"
//     data_type: FloatVector
//     type_params {
//       key: "dim"
//       value: "768"
//     }
//   }
//   enable_dynamic_field: true
// }
// collectionID: 442169042778847381
// virtual_channel_names: "in01-cd27c2fd94b8f0e-rootcoord-dml_3_442169042778847381v0"
// virtual_channel_names: "in01-cd27c2fd94b8f0e-rootcoord-dml_6_442169042778847381v1"
// physical_channel_names: "in01-cd27c2fd94b8f0e-rootcoord-dml_3"
// physical_channel_names: "in01-cd27c2fd94b8f0e-rootcoord-dml_6"
// created_timestamp: 442438408942387203
// created_utc_timestamp: 1687768588800
// shards_num: 2
// consistency_level: Bounded
// collection_name: "medium_articles_2020"
// db_name: "db_afa0537cbd247e"
// num_partitions: 1
// }
```

</TabItem>

<TabItem value='bash'>

```bash
# Replace PUBLIC_ENDPOINT and TOKEN with your own 
# - For a serverless cluster, use an API key as the token. 
# - For a dedicated cluster, use the cluster credentials as the token in the format of 'user:password'.
curl --request GET \\
    --url "${PUBLIC_ENDPOINT}/v1/vector/collections/describe?collectionName=medium_articles_2020" \\
    --header "Authorization: Bearer ${TOKEN}" \\
    --header 'accept: application/json' \\
    --header 'content-type: application/json'

# Response
#
# {
#      "code": 200,
#      "data": {
#           "collectionName": "medium_articles_2020",
#           "shardsNum": 2,
#           "description": "",
#           "load": "loaded",
#           "enableDynamicField": true,
#           "fields": [
#                {
#                     "name": "id",
#                     "type": "int64",
#                     "primaryKey": true,
#                     "autoId": true,
#                     "description": ""
#                },
#                {
#                     "name": "vector",
#                     "type": "floatVector(768)",
#                     "primaryKey": false,
#                     "autoId": false,
#                     "description": ""
#                },
#                {
#                     "name": "$meta",
#                     "type": "JSON",
#                     "primaryKey": false,
#                     "autoId": false,
#                     "description": "dynamic schema"
#                }
#           ],
#           "indexes": [
#                {
#                     "indexName": "vector_idx",
#                     "fieldName": "vector",
#                     "metricType": "L2"
#                }
#           ]
#      }
# }
```

</TabItem>
</Tabs>

## Insert data{#insert-data}

In this example, we have prepared a dataset containing over 5,000 articles from [Medium.com]([object Promise]) published from January through August in 2020. You can download the prepared dataset from [here]([object Promise]). To know more about the dataset, read [the introduction page on Kaggle]([object Promise]).

Here are some examples of inserting one or multiple entities from the dataset into the collection. You can view the inserted entities on the Zilliz Cloud console.

- Insert a single entity

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
import json

# Insert a single entity
res = client.insert(
        collection_name="medium_articles_2020",
        data={
        'id': 0, 
        'title': 'The Reported Mortality Rate of Coronavirus Is Not Important', 
        'link': '<https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912>', 
        'reading_time': 13, 
        'publication': 'The Startup', 
        'claps': 1100, 
        'responses': 18, 
        'vector': [0.041732933, 0.013779674, -0.027564144, -0.013061441, 0.009748648, 0.00082446384, -0.00071647146, 0.048612226, -0.04836573, -0.04567751, 0.018008126, 0.0063936645, -0.011913628, 0.030776596, -0.018274948, 0.019929802, 0.020547243, 0.032735646, -0.031652678, -0.033816382, -0.051087562, -0.033748355, 0.0039493158, 0.009246126, -0.060236514, -0.017136049, 0.028754413, -0.008433934, 0.011168004, -0.012391256, -0.011225835, 0.031775184, 0.002929508, -0.007448661, -0.005337719, -0.010999258, -0.01515909, -0.005130484, 0.0060212007, 0.0034560722, -0.022935811, -0.04970116, -0.0155887455, 0.06627353, -0.006052789, -0.051570725, -0.109865054, 0.033205193, 0.00041118253, 0.0029823708, 0.036160238, -0.011256539, 0.00023560718, 0.058322437, 0.022275906, 0.015206677, -0.02884609, 0.0016338055, 0.0049200393, 0.014388571, -0.0049061654, -0.04664761, -0.027454877, 0.017526226, -0.005100602, 0.018090058, 0.02700998, 0.04031944, -0.0097965, -0.03674761, -0.0043163053, -0.023320708, 0.012654851, -0.014262311, -0.008081833, -0.018334744, 0.0014025003, -0.003053399, -0.002636383, -0.022398386, -0.004725274, 0.00036367847, -0.012368711, 0.0014739085, 0.03450414, 0.009684024, 0.017912658, 0.06594397, 0.021381201, 0.029343689, -0.0069561847, 0.026152428, 0.04635037, 0.014746184, -0.002119602, 0.034359712, -0.013705124, 0.010691518, 0.04060854, 0.013679299, -0.018990282, 0.035340093, 0.007353945, -0.035990074, 0.013126987, -0.032933377, -0.001756877, -0.0049658176, -0.03380879, -0.07024137, -0.0130426735, 0.010533265, -0.023091802, -0.004645729, -0.03344451, 0.04759929, 0.025985204, -0.040710885, -0.016681142, -0.024664842, -0.025170377, 0.08839205, -0.023733815, 0.019494494, 0.0055427826, 0.045460507, 0.07066554, 0.022181382, 0.018302314, 0.026806992, -0.006066003, 0.046525814, -0.04066389, 0.019001767, 0.021242762, -0.020784091, -0.031635042, 0.04573943, 0.02515421, -0.050663553, -0.05183343, -0.046468202, -0.07910535, 0.017036669, 0.021445233, 0.04277428, -0.020235524, -0.055314954, 0.00904601, -0.01104365, 0.03069203, -0.00821997, -0.035594665, 0.024322856, -0.0068963314, 0.009003657, 0.00398102, -0.008596356, 0.014772055, 0.02740991, 0.025503553, 0.0038213644, -0.0047855405, -0.034888722, 0.030553816, -0.008325959, 0.030010607, 0.023729775, 0.016138833, -0.022967983, -0.08616877, -0.02460819, -0.008210168, -0.06444098, 0.018750126, -0.03335763, 0.022024624, 0.032374356, 0.023870794, 0.021288997, -0.026617877, 0.020435361, -0.003692393, -0.024113296, 0.044870164, -0.030451361, 0.013022849, 0.002278627, -0.027616743, -0.012087787, -0.033232547, -0.022974484, 0.02801226, -0.029057292, 0.060317725, -0.02312559, 0.015558754, 0.073630534, 0.02490823, -0.0140531305, -0.043771528, 0.040756326, 0.01667925, -0.0046050115, -0.08938058, 0.10560781, 0.015044094, 0.003613817, 0.013523503, -0.011039813, 0.06396795, 0.013428416, -0.025031878, -0.014972648, -0.015970055, 0.037022553, -0.013759925, 0.013363354, 0.0039748577, -0.0040822625, 0.018209668, -0.057496265, 0.034993384, 0.07075411, 0.023498386, 0.085871644, 0.028646072, 0.007590898, 0.07037031, -0.05005178, 0.010477505, -0.014106617, 0.013402172, 0.007472563, -0.03131418, 0.020552127, -0.031878896, -0.04170217, -0.03153583, 0.03458349, 0.03366634, 0.021306382, -0.037176874, 0.029069472, 0.014662372, 0.0024123765, -0.025403008, -0.0372993, -0.049923114, -0.014209514, -0.015524425, 0.036377322, 0.04259327, -0.029715618, 0.02657093, -0.0062432447, -0.0024253451, -0.021287171, 0.010478781, -0.029322306, -0.021203341, 0.047209084, 0.025337176, 0.018471811, -0.008709492, -0.047414266, -0.06227469, -0.05713435, 0.02141101, 0.024481304, 0.07176469, 0.0211379, -0.049316987, -0.124073654, 0.0049275495, -0.02461509, -0.02738388, 0.04825289, -0.05069646, 0.012640115, -0.0061352802, 0.034599125, 0.02799496, -0.01511028, -0.046418104, 0.011309801, 0.016673129, -0.033531003, -0.049203333, -0.027218347, -0.03528408, 0.008881575, 0.010736325, 0.034232814, 0.012807507, -0.0100207105, 0.0067757815, 0.009538357, 0.026212366, -0.036120333, -0.019764563, 0.006527411, -0.016437015, -0.009759148, -0.042246807, 0.012492151, 0.0066206953, 0.010672299, -0.44499892, -0.036189068, -0.015703931, -0.031111298, -0.020329623, 0.0047888453, 0.090396516, -0.041484866, 0.033830352, -0.0033847596, 0.06065415, 0.030880837, 0.05558494, 0.022805553, 0.009607596, 0.006682602, 0.036806617, 0.02406229, 0.034229457, -0.0105605405, 0.034754273, 0.02436426, -0.03849325, 0.021132406, -0.01251386, 0.022090863, -0.029137045, 0.0064384523, -0.03175176, -0.0070441505, 0.016025176, -0.023172623, 0.00076795724, -0.024106828, -0.045440633, -0.0074440194, 0.00035374766, 0.024374487, 0.0058897804, -0.012461025, -0.029086761, 0.0029477053, -0.022914894, -0.032369837, 0.020743662, 0.024116345, 0.0020526652, 0.0008596536, -0.000583463, 0.061080184, 0.020812698, -0.0235381, 0.08112197, 0.05689626, -0.003070104, -0.010714772, -0.004864459, 0.027089117, -0.030910335, 0.0017404438, -0.014978656, 0.0127020255, 0.01878998, -0.051732827, -0.0037475713, 0.013033434, -0.023682894, -0.03219574, 0.03736345, 0.0058930484, -0.054040316, 0.047637977, 0.012636436, -0.05820182, 0.013828813, -0.057893142, -0.012405234, 0.030266648, -0.0029184038, -0.021839319, -0.045179468, -0.013123978, -0.021320488, 0.0015718226, 0.020244086, -0.014414709, 0.009535103, -0.004497577, -0.02577227, -0.0085017495, 0.029090486, 0.009356506, 0.0055838437, 0.021151636, 0.039531752, 0.07814674, 0.043186333, -0.0077368533, 0.028967595, 0.025058193, 0.05432941, -0.04383656, -0.027070394, -0.080263995, -0.03616516, -0.026129462, -0.0033627374, 0.035040155, 0.015231506, -0.06372076, 0.046391208, 0.0049725454, 0.003783345, -0.057800908, 0.061461, -0.017880175, 0.022820404, 0.048944063, 0.04725843, -0.013392871, 0.05023065, 0.0069421427, -0.019561166, 0.012953843, 0.06227977, -0.02114757, -0.003334329, 0.023241237, -0.061053444, -0.023145229, 0.016086273, 0.0774039, 0.008069459, -0.0013532874, -0.016790181, -0.027246375, -0.03254919, 0.033754334, 0.00037142826, -0.02387325, 0.0057056695, 0.0084914565, -0.051856343, 0.029254, 0.005583839, 0.011591886, -0.033027634, -0.004170374, 0.018334484, -0.0030969654, 0.0024489106, 0.0030196267, 0.023012564, 0.020529047, 0.00010772953, 0.0017700809, 0.029260442, -0.018829526, -0.024797931, -0.039499596, 0.008108761, -0.013099816, -0.11726566, -0.005652353, -0.008117937, -0.012961832, 0.0152542135, -0.06429504, 0.0184562, 0.058997117, -0.027178442, -0.019294549, -0.01587592, 0.0048053437, 0.043830805, 0.011232237, -0.026841154, -0.0007282251, -0.00862919, -0.008405325, 0.019370917, -0.008112641, -0.014931766, 0.065622255, 0.0149185015, 0.013089685, -0.0028022556, -0.028629888, -0.048105706, 0.009296162, 0.010251239, 0.030800395, 0.028263845, -0.011021621, -0.034127586, 0.014709971, -0.0075270324, 0.010737263, 0.020517904, -0.012932179, 0.007153817, 0.03736311, -0.03391106, 0.03028614, 0.012531187, -0.046059456, -0.0043963846, 0.028799629, -0.06663413, -0.009447025, -0.019833198, -0.036111858, -0.01901045, 0.040701825, 0.0060573653, 0.027482377, -0.019782187, -0.020186251, 0.028398912, 0.027108852, 0.026535714, -0.000995191, -0.020599326, -0.005658084, -0.017271476, 0.026300041, -0.006992451, -0.08593853, 0.03675959, 0.0029454317, -0.040927384, -0.035480253, 0.016498009, -0.03406521, -0.026182177, -0.0007024827, 0.019500641, 0.0047998386, -0.02416359, 0.0019833131, 0.0033488963, 0.037788488, -0.009154958, -0.043469638, -0.024896, -0.017234193, 0.044996973, -0.06303135, -0.051730774, 0.04041444, 0.0075959326, -0.03901764, -0.019851806, -0.008242245, 0.06107143, 0.030118924, -0.016167669, -0.028161867, -0.0025679746, -0.021713274, 0.025275888, -0.012819265, -0.036431268, 0.017991759, 0.040626206, -0.0036572467, -0.0005935883, -0.0037468506, 0.034460746, -0.0182785, -0.00431203, -0.044755403, 0.016463224, 0.041199315, -0.0093387, 0.03919184, -0.01151653, -0.016965209, 0.006347649, 0.021104146, 0.060276803, -0.026659148, 0.026461488, -0.032700688, 0.0012274865, -0.024675943, -0.003006079, -0.009607032, 0.010597691, 0.0043017124, -0.01908524, 0.006748306, -0.03049305, -0.017481703, 0.036747415, 0.036634356, 0.0007106319, 0.045647435, -0.020883067, -0.0593661, -0.03929885, 0.042825453, 0.016104022, -0.03222858, 0.031112716, 0.020407677, -0.013276762, 0.03657825, -0.033871554, 0.004176301, 0.009538976, -0.009995692, 0.0042660628, 0.050545394, -0.018142857, 0.005219403, 0.0006711967, -0.014264284, 0.031044828, -0.01827481, 0.012488852, 0.031393733, 0.050390214, -0.014484084, -0.054758117, 0.055042055, -0.005506624, -0.0066648237, 0.010891078, 0.012446279, 0.061687976, 0.018091502, 0.0026527622, 0.0321537, -0.02469515, 0.01772019, 0.006846163, -0.07471038, -0.024433741, 0.02483875, 0.0497063, 0.0043456135, 0.056550737, 0.035752796, -0.02430349, 0.036570627, -0.027576203, -0.012418993, 0.023442797, -0.03433812, 0.01953399, -0.028003592, -0.021168072, 0.019414881, -0.014712576, -0.0003938545, 0.021453558, -0.023197332, -0.004455581, -0.08799191, 0.0010808896, 0.009281116, -0.0051161298, 0.031497046, 0.034916095, -0.023042161, 0.030799815, 0.017298799, 0.0015253434, 0.013728047, 0.0035838438, 0.016767647, -0.022243451, 0.013371096, 0.053564783, -0.008776885, -0.013133307, 0.015577713, -0.027008705, 0.009490815, -0.04103532, -0.012426461, -0.0050485474, -0.04323231, -0.013291623, -0.01660157, -0.055480026, 0.017622838, 0.017476618, -0.009798125, 0.038226977, -0.03127579, 0.019329516, 0.033461004, -0.0039813113, -0.039526325, 0.03884973, -0.011381027, -0.023257744, 0.03033401, 0.0029607012, -0.0006490531, -0.0347344, 0.029701462, -0.04153701, 0.028073426, -0.025427297, 0.009756264, -0.048082624, 0.021743972, 0.057197016, 0.024082556, -0.013968224, 0.044379756, -0.029081704, 0.003487999, 0.042621125, -0.04339743, -0.027005397, -0.02944044, -0.024172144, -0.07388652, 0.05952364, 0.02561452, -0.010255158, -0.015288555, 0.045012463, 0.012403602, -0.021197597, 0.025847573, -0.016983166, 0.03021369, -0.02920852, 0.035140667, -0.010627725, -0.020431923, 0.03191218, 0.0046844087, 0.056356475, -0.00012615003, -0.0052536936, -0.058609407, 0.009710908, 0.00041168949, -0.22300485, -0.0077232462, 0.0029359192, -0.028645728, -0.021156758, 0.029606635, -0.026473567, -0.0019432966, 0.023867624, 0.021946864, -0.00082128344, 0.01897284, -0.017976845, -0.015677344, -0.0026336901, 0.030096486]
        }
)

print(res)

# Output:
# [0]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Include the following in the above async function declaration
res = await client.insert({
    collection_name: "medium_articles_2020",
    data: [{
        'id': 0, 
        'title': 'The Reported Mortality Rate of Coronavirus Is Not Important', 
        'link': '<https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912>', 
        'reading_time': 13, 
        'publication': 'The Startup', 
        'claps': 1100, 
        'responses': 18, 
        'vector': [0.041732933, 0.013779674, -0.027564144, -0.013061441, 0.009748648, 0.00082446384, -0.00071647146, 0.048612226, -0.04836573, -0.04567751, 0.018008126, 0.0063936645, -0.011913628, 0.030776596, -0.018274948, 0.019929802, 0.020547243, 0.032735646, -0.031652678, -0.033816382, -0.051087562, -0.033748355, 0.0039493158, 0.009246126, -0.060236514, -0.017136049, 0.028754413, -0.008433934, 0.011168004, -0.012391256, -0.011225835, 0.031775184, 0.002929508, -0.007448661, -0.005337719, -0.010999258, -0.01515909, -0.005130484, 0.0060212007, 0.0034560722, -0.022935811, -0.04970116, -0.0155887455, 0.06627353, -0.006052789, -0.051570725, -0.109865054, 0.033205193, 0.00041118253, 0.0029823708, 0.036160238, -0.011256539, 0.00023560718, 0.058322437, 0.022275906, 0.015206677, -0.02884609, 0.0016338055, 0.0049200393, 0.014388571, -0.0049061654, -0.04664761, -0.027454877, 0.017526226, -0.005100602, 0.018090058, 0.02700998, 0.04031944, -0.0097965, -0.03674761, -0.0043163053, -0.023320708, 0.012654851, -0.014262311, -0.008081833, -0.018334744, 0.0014025003, -0.003053399, -0.002636383, -0.022398386, -0.004725274, 0.00036367847, -0.012368711, 0.0014739085, 0.03450414, 0.009684024, 0.017912658, 0.06594397, 0.021381201, 0.029343689, -0.0069561847, 0.026152428, 0.04635037, 0.014746184, -0.002119602, 0.034359712, -0.013705124, 0.010691518, 0.04060854, 0.013679299, -0.018990282, 0.035340093, 0.007353945, -0.035990074, 0.013126987, -0.032933377, -0.001756877, -0.0049658176, -0.03380879, -0.07024137, -0.0130426735, 0.010533265, -0.023091802, -0.004645729, -0.03344451, 0.04759929, 0.025985204, -0.040710885, -0.016681142, -0.024664842, -0.025170377, 0.08839205, -0.023733815, 0.019494494, 0.0055427826, 0.045460507, 0.07066554, 0.022181382, 0.018302314, 0.026806992, -0.006066003, 0.046525814, -0.04066389, 0.019001767, 0.021242762, -0.020784091, -0.031635042, 0.04573943, 0.02515421, -0.050663553, -0.05183343, -0.046468202, -0.07910535, 0.017036669, 0.021445233, 0.04277428, -0.020235524, -0.055314954, 0.00904601, -0.01104365, 0.03069203, -0.00821997, -0.035594665, 0.024322856, -0.0068963314, 0.009003657, 0.00398102, -0.008596356, 0.014772055, 0.02740991, 0.025503553, 0.0038213644, -0.0047855405, -0.034888722, 0.030553816, -0.008325959, 0.030010607, 0.023729775, 0.016138833, -0.022967983, -0.08616877, -0.02460819, -0.008210168, -0.06444098, 0.018750126, -0.03335763, 0.022024624, 0.032374356, 0.023870794, 0.021288997, -0.026617877, 0.020435361, -0.003692393, -0.024113296, 0.044870164, -0.030451361, 0.013022849, 0.002278627, -0.027616743, -0.012087787, -0.033232547, -0.022974484, 0.02801226, -0.029057292, 0.060317725, -0.02312559, 0.015558754, 0.073630534, 0.02490823, -0.0140531305, -0.043771528, 0.040756326, 0.01667925, -0.0046050115, -0.08938058, 0.10560781, 0.015044094, 0.003613817, 0.013523503, -0.011039813, 0.06396795, 0.013428416, -0.025031878, -0.014972648, -0.015970055, 0.037022553, -0.013759925, 0.013363354, 0.0039748577, -0.0040822625, 0.018209668, -0.057496265, 0.034993384, 0.07075411, 0.023498386, 0.085871644, 0.028646072, 0.007590898, 0.07037031, -0.05005178, 0.010477505, -0.014106617, 0.013402172, 0.007472563, -0.03131418, 0.020552127, -0.031878896, -0.04170217, -0.03153583, 0.03458349, 0.03366634, 0.021306382, -0.037176874, 0.029069472, 0.014662372, 0.0024123765, -0.025403008, -0.0372993, -0.049923114, -0.014209514, -0.015524425, 0.036377322, 0.04259327, -0.029715618, 0.02657093, -0.0062432447, -0.0024253451, -0.021287171, 0.010478781, -0.029322306, -0.021203341, 0.047209084, 0.025337176, 0.018471811, -0.008709492, -0.047414266, -0.06227469, -0.05713435, 0.02141101, 0.024481304, 0.07176469, 0.0211379, -0.049316987, -0.124073654, 0.0049275495, -0.02461509, -0.02738388, 0.04825289, -0.05069646, 0.012640115, -0.0061352802, 0.034599125, 0.02799496, -0.01511028, -0.046418104, 0.011309801, 0.016673129, -0.033531003, -0.049203333, -0.027218347, -0.03528408, 0.008881575, 0.010736325, 0.034232814, 0.012807507, -0.0100207105, 0.0067757815, 0.009538357, 0.026212366, -0.036120333, -0.019764563, 0.006527411, -0.016437015, -0.009759148, -0.042246807, 0.012492151, 0.0066206953, 0.010672299, -0.44499892, -0.036189068, -0.015703931, -0.031111298, -0.020329623, 0.0047888453, 0.090396516, -0.041484866, 0.033830352, -0.0033847596, 0.06065415, 0.030880837, 0.05558494, 0.022805553, 0.009607596, 0.006682602, 0.036806617, 0.02406229, 0.034229457, -0.0105605405, 0.034754273, 0.02436426, -0.03849325, 0.021132406, -0.01251386, 0.022090863, -0.029137045, 0.0064384523, -0.03175176, -0.0070441505, 0.016025176, -0.023172623, 0.00076795724, -0.024106828, -0.045440633, -0.0074440194, 0.00035374766, 0.024374487, 0.0058897804, -0.012461025, -0.029086761, 0.0029477053, -0.022914894, -0.032369837, 0.020743662, 0.024116345, 0.0020526652, 0.0008596536, -0.000583463, 0.061080184, 0.020812698, -0.0235381, 0.08112197, 0.05689626, -0.003070104, -0.010714772, -0.004864459, 0.027089117, -0.030910335, 0.0017404438, -0.014978656, 0.0127020255, 0.01878998, -0.051732827, -0.0037475713, 0.013033434, -0.023682894, -0.03219574, 0.03736345, 0.0058930484, -0.054040316, 0.047637977, 0.012636436, -0.05820182, 0.013828813, -0.057893142, -0.012405234, 0.030266648, -0.0029184038, -0.021839319, -0.045179468, -0.013123978, -0.021320488, 0.0015718226, 0.020244086, -0.014414709, 0.009535103, -0.004497577, -0.02577227, -0.0085017495, 0.029090486, 0.009356506, 0.0055838437, 0.021151636, 0.039531752, 0.07814674, 0.043186333, -0.0077368533, 0.028967595, 0.025058193, 0.05432941, -0.04383656, -0.027070394, -0.080263995, -0.03616516, -0.026129462, -0.0033627374, 0.035040155, 0.015231506, -0.06372076, 0.046391208, 0.0049725454, 0.003783345, -0.057800908, 0.061461, -0.017880175, 0.022820404, 0.048944063, 0.04725843, -0.013392871, 0.05023065, 0.0069421427, -0.019561166, 0.012953843, 0.06227977, -0.02114757, -0.003334329, 0.023241237, -0.061053444, -0.023145229, 0.016086273, 0.0774039, 0.008069459, -0.0013532874, -0.016790181, -0.027246375, -0.03254919, 0.033754334, 0.00037142826, -0.02387325, 0.0057056695, 0.0084914565, -0.051856343, 0.029254, 0.005583839, 0.011591886, -0.033027634, -0.004170374, 0.018334484, -0.0030969654, 0.0024489106, 0.0030196267, 0.023012564, 0.020529047, 0.00010772953, 0.0017700809, 0.029260442, -0.018829526, -0.024797931, -0.039499596, 0.008108761, -0.013099816, -0.11726566, -0.005652353, -0.008117937, -0.012961832, 0.0152542135, -0.06429504, 0.0184562, 0.058997117, -0.027178442, -0.019294549, -0.01587592, 0.0048053437, 0.043830805, 0.011232237, -0.026841154, -0.0007282251, -0.00862919, -0.008405325, 0.019370917, -0.008112641, -0.014931766, 0.065622255, 0.0149185015, 0.013089685, -0.0028022556, -0.028629888, -0.048105706, 0.009296162, 0.010251239, 0.030800395, 0.028263845, -0.011021621, -0.034127586, 0.014709971, -0.0075270324, 0.010737263, 0.020517904, -0.012932179, 0.007153817, 0.03736311, -0.03391106, 0.03028614, 0.012531187, -0.046059456, -0.0043963846, 0.028799629, -0.06663413, -0.009447025, -0.019833198, -0.036111858, -0.01901045, 0.040701825, 0.0060573653, 0.027482377, -0.019782187, -0.020186251, 0.028398912, 0.027108852, 0.026535714, -0.000995191, -0.020599326, -0.005658084, -0.017271476, 0.026300041, -0.006992451, -0.08593853, 0.03675959, 0.0029454317, -0.040927384, -0.035480253, 0.016498009, -0.03406521, -0.026182177, -0.0007024827, 0.019500641, 0.0047998386, -0.02416359, 0.0019833131, 0.0033488963, 0.037788488, -0.009154958, -0.043469638, -0.024896, -0.017234193, 0.044996973, -0.06303135, -0.051730774, 0.04041444, 0.0075959326, -0.03901764, -0.019851806, -0.008242245, 0.06107143, 0.030118924, -0.016167669, -0.028161867, -0.0025679746, -0.021713274, 0.025275888, -0.012819265, -0.036431268, 0.017991759, 0.040626206, -0.0036572467, -0.0005935883, -0.0037468506, 0.034460746, -0.0182785, -0.00431203, -0.044755403, 0.016463224, 0.041199315, -0.0093387, 0.03919184, -0.01151653, -0.016965209, 0.006347649, 0.021104146, 0.060276803, -0.026659148, 0.026461488, -0.032700688, 0.0012274865, -0.024675943, -0.003006079, -0.009607032, 0.010597691, 0.0043017124, -0.01908524, 0.006748306, -0.03049305, -0.017481703, 0.036747415, 0.036634356, 0.0007106319, 0.045647435, -0.020883067, -0.0593661, -0.03929885, 0.042825453, 0.016104022, -0.03222858, 0.031112716, 0.020407677, -0.013276762, 0.03657825, -0.033871554, 0.004176301, 0.009538976, -0.009995692, 0.0042660628, 0.050545394, -0.018142857, 0.005219403, 0.0006711967, -0.014264284, 0.031044828, -0.01827481, 0.012488852, 0.031393733, 0.050390214, -0.014484084, -0.054758117, 0.055042055, -0.005506624, -0.0066648237, 0.010891078, 0.012446279, 0.061687976, 0.018091502, 0.0026527622, 0.0321537, -0.02469515, 0.01772019, 0.006846163, -0.07471038, -0.024433741, 0.02483875, 0.0497063, 0.0043456135, 0.056550737, 0.035752796, -0.02430349, 0.036570627, -0.027576203, -0.012418993, 0.023442797, -0.03433812, 0.01953399, -0.028003592, -0.021168072, 0.019414881, -0.014712576, -0.0003938545, 0.021453558, -0.023197332, -0.004455581, -0.08799191, 0.0010808896, 0.009281116, -0.0051161298, 0.031497046, 0.034916095, -0.023042161, 0.030799815, 0.017298799, 0.0015253434, 0.013728047, 0.0035838438, 0.016767647, -0.022243451, 0.013371096, 0.053564783, -0.008776885, -0.013133307, 0.015577713, -0.027008705, 0.009490815, -0.04103532, -0.012426461, -0.0050485474, -0.04323231, -0.013291623, -0.01660157, -0.055480026, 0.017622838, 0.017476618, -0.009798125, 0.038226977, -0.03127579, 0.019329516, 0.033461004, -0.0039813113, -0.039526325, 0.03884973, -0.011381027, -0.023257744, 0.03033401, 0.0029607012, -0.0006490531, -0.0347344, 0.029701462, -0.04153701, 0.028073426, -0.025427297, 0.009756264, -0.048082624, 0.021743972, 0.057197016, 0.024082556, -0.013968224, 0.044379756, -0.029081704, 0.003487999, 0.042621125, -0.04339743, -0.027005397, -0.02944044, -0.024172144, -0.07388652, 0.05952364, 0.02561452, -0.010255158, -0.015288555, 0.045012463, 0.012403602, -0.021197597, 0.025847573, -0.016983166, 0.03021369, -0.02920852, 0.035140667, -0.010627725, -0.020431923, 0.03191218, 0.0046844087, 0.056356475, -0.00012615003, -0.0052536936, -0.058609407, 0.009710908, 0.00041168949, -0.22300485, -0.0077232462, 0.0029359192, -0.028645728, -0.021156758, 0.029606635, -0.026473567, -0.0019432966, 0.023867624, 0.021946864, -0.00082128344, 0.01897284, -0.017976845, -0.015677344, -0.0026336901, 0.030096486]
        }]
});

console.log(res)

// Output:
// {
//   succ_index: [ 0 ],
//   err_index: [],
//   status: { error_code: 'Success', reason: '' },
//   IDs: { int_id: { data: [Array] }, id_field: 'int_id' },
//   acknowledged: false,
//   insert_cnt: '1',
//   delete_cnt: '0',
//   upsert_cnt: '0',
//   timestamp: '442193107156992003'
// }
```

</TabItem>

<TabItem value='java'>

```java
// Include the following in the above main function.

// 4. Insert a single entity
String content;

Path file = Path.of("medium_articles_2020_dpr.json");
try {
    content = Files.readString(file);
} catch (Exception e) {
    System.out.println("Failed to read file: " + e.getMessage());
    return;
}

System.out.println("Successfully read file");

// Load dataset
JSONObject dataset = JSON.parseObject(content);

// Change the second argument of the `getRows` function 
// to limit the number of rows obtained from the dataset.
List<JSONObject> rows = getRows(dataset.getJSONArray("rows"), 1);

System.out.println(rows.get(0).toString());

InsertRowsParam insertRowsParam = InsertRowsParam.newBuilder()
    .withCollectionName(collectionName)
    .withRows(rows)
    .build();

R<InsertResponse> res = client.insert(insertRowsParam);

if (res.getException() != null) {
    System.out.println("Failed to insert: " + res.getException().getMessage());
    return;
}

System.out.println("Successfully inserted " + res.getData().getInsertCount() + " records");

// Output
// Successfully inserted 1 records

//=========================
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
```

</TabItem>

<TabItem value='bash'>

```bash
# Read the first record from the dataset
data="$(cat path/to/medium_articles_2020_dpr.json \\
    | jq '.rows' \\
    | jq '.[0]' \\
    | jq -c '. + {"vector": .title_vector} | del(.title_vector) | del(.id)' )"

echo $data

# Insert a single entity
# Replace uri and API key with your own
curl --request POST \\
     --url "${PUBLIC_ENDPOINT}/v1/vector/insert" \\
     --header "Authorization: Bearer ${TOKEN}" \\
     --header 'accept: application/json' \\
     --header 'content-type: application/json' \\
     --data "{
        \\"collectionName\\": \\"medium_articles_2020\\",
        \\"data\\": ${data}
    }"

# Output:
#
# {
#      "code": 200,
#      "data": {
#           "insertCount": 1,
#           "insertIds": [
#                "442147653350115745"
#           ]
#      }
# }
```

</TabItem>
</Tabs>

- Insert multiple entities

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
import json

# Read the first 200 records
with open("path/to/downloaded/medium_articles_2020_dpr.json") as f:
  data = json.load(f)
  data = data["rows"][:200]
  for x in data:
    x["vector"] = x.pop("title_vector") 

# Insert multiple entities
res = client.insert(
  collection_name="medium_articles_2020",
  data=data
)

print(res)

# Output
# [0, 1, ..., 199]

# You can view the following on Zilliz Cloud
#
#   [
#                         {
#                                 "id": 0,
#                                 "vector": [0.041732933, 0.013779674, ...., -0.013061441], 
#                                 "title": "The Reported Mortality Rate of Coronavirus Is Not Important", 
#                                 "link": "<https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912>",
#                                 "reading_time": 13,
#                                 "publication": "The Startup",
#                                 "claps": 1100,
#                                 "responses": 18
#             },
#                         {
#                           "id": 1,
#                                 "vector": [0.0039737443, 0.003020432, ...., 0.03913546], 
#                           "title": "Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else", 
#                           "link": "<https://medium.com/swlh/dashboards-in-python-3-advanced-examples-for-dash-beginners-and-everyone-else>",
#                           "reading_time": 14,
#                           "publication": " The Startup",
#                           "claps": 726,
#                           "responses": 3  
#                         },
#       ...
#          ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
const fs = require("fs")

// Include the following in the above async function declaration
const data = JSON.parse(fs.readFileSync('path/to/medium_articles_2020_dpr.json', 'utf8'));
const client_data = data.rows.slice(1, 200).map((row) => {
    return {
        'id': row.id,
        'title': row.title,
        'link': row.link,
        'reading_time': row.reading_time,
        'publication': row.publication,
        'claps': row.claps,
        'responses': row.responses,
        'vector': row.title_vector
    }
});

console.log(client_data);

res = await client.insert({
    collection_name: "medium_articles_2020",
    data: client_data
})

console.log(res);

// Output:
// {
//  succ_index: [
//     0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11,
//    12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
//    24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
//    36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
//    48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
//    60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71,
//    72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83,
//    84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95,
//    96, 97, 98, 99,
//    ... 100 more items
//  ],
//  err_index: [],
//  status: { error_code: 'Success', reason: '' },
//  IDs: { int_id: { data: [Array] }, id_field: 'int_id' },
//  acknowledged: false,
//  insert_cnt: '200',
//  delete_cnt: '0',
//  upsert_cnt: '0',
//  timestamp: '442193109135917059'
// }
```

</TabItem>

<TabItem value='java'>

```java
// Include the following in the above main function.

// 4. Insert a single entity
String content;

Path file = Path.of("medium_articles_2020_dpr.json");
try {
    content = Files.readString(file);
} catch (Exception e) {
    System.out.println("Failed to read file: " + e.getMessage());
    return;
}

System.out.println("Successfully read file");

// Load dataset
JSONObject dataset = JSON.parseObject(content);

// Change the second argument of the `getRows` function 
// to limit the number of rows obtained from the dataset.
List<JSONObject> rows = getRows(dataset.getJSONArray("rows"), 5979);

System.out.println(rows.get(0).toString());

InsertRowsParam insertRowsParam = InsertRowsParam.newBuilder()
    .withCollectionName(collectionName)
    .withRows(rows)
    .build();

R<InsertResponse> res = client.insert(insertRowsParam);

if (res.getException() != null) {
    System.out.println("Failed to insert: " + res.getException().getMessage());
    return;
}

System.out.println("Successfully inserted " + res.getData().getInsertCount() + " records");

// Output
// Successfully inserted 5979 records

//=========================
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
```

</TabItem>

<TabItem value='bash'>

```bash
# read the first 200 records from the dataset
data="$(cat path/to/medium_articles_2020_dpr.json \\
                | jq '.rows' \\
                | jq '.[1:200]' \\
                | jq -r '.[] | . + {"vector": .title_vector} | del(.title_vector) | del(.id)' \\
                | jq -s -c '.')"

echo $data

# Insert multiple entities
# Replace uri and API key with your own
curl --request POST \\
     --url "${PUBLIC_ENDPOINT}/v1/vector/insert" \\
     --header "Authorization: Bearer ${TOKEN}" \\
     --header 'accept: application/json' \\
     --header 'content-type: application/json' \\
     --data "{
        \\"collectionName\\": \\"medium_articles_2020\\",
        \\"data\\": ${data}
    }"

# Response
#
# {
#      "code": 200,
#      "data": {
#           "insertCount": 200,
#           "insertIds": [
#                "442147653350115755",
#                "442147653350115756",
#                ...
#           ]
#      }
# }
```

</TabItem>
</Tabs>

## Search, query, and get operations{#search-query-and-get-operations}

The search, query, and get API operations are three different operations for data retrieving:

- A search operation performs an approximate nearest neighbor (ANN) search.

- A query operation matches entities based on specific conditions.

- A get operation fetches specific entities by their IDs.

### Perform an ANN search{#perform-an-ann-search}

In the dataset, the **vector** field contains vector embeddings of each article’s title. This example illustrates how to conduct an ANN search among these vectors (finding the closest titles with a query vector `data`).

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
with open("path/to/downloaded/medium_articles_2020_dpr.json") as f:
  data = json.load(f)

res = client.search(
    collection_name="medium_articles_2020",
          data=[data["rows"][0]["title_vector"]],
    output_fields=["title"]
)

print(res)

# Output:
# [
#   [
#     {
#       'id': 1, 
#       'distance': -0.9999998807907104, 
#       'entity': {'title': 'Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else'}
#     }, 
#     {
#       'id': 4, 
#       'distance': -0.7625510692596436, 
#       'entity': {'title': 'Python NLP Tutorial: Information Extraction and Knowledge Graphs'}
#     }, 
#     {
#       'id': 17, 
#       'distance': -0.7366295456886292, 
#       'entity': {'title': 'Blockchain, IoT and AI — A Perfect Fit'}}, 
#     {
#       'id': 98, 
#       'distance': -0.7285258769989014, 
#       'entity': {'title': 'How To Write Movie Reviews with AI'}}, 
#     {
#       'id': 96, 'distance': -0.712313711643219, 
#       'entity': {'title': 'Feature Selection Techniques in Python: Predicting Hotel Cancellations'}
#     }
#   ]
# ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Include the following in the above async function declaration
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
//     },
//     ...
//   ]
// }
```

</TabItem>

<TabItem value='java'>

```java
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
     --header "Authorization: Bearer ${TOKEN}" \\
     --header 'accept: application/json' \\
     --header 'content-type: application/json' \\
     --data "{
        \\"collectionName\\": \\"medium_articles_2020\\",
        \\"limit\\": 3,
        \\"vector\\": $vector
      }"

# Response
#
# {
#      "code": 200,
#      "data": [
#           {
#                "distance": 0,
#                "id": 442147653350115900
#           },
#           {
#                "distance": 0.494843,
#                "id": 442147653350116000
#           },
#           {
#                "distance": 0.65601754,
#                "id": 442147653350116000
#           }
#      ]
# }
```

</TabItem>
</Tabs>

You can also conduct an ANN search in a limited scope by applying a filter condition.

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="medium_articles_2020",
    data=[data["rows"][0]["title_vector"]],
    filter='claps > 100 and publication in ["The Startup", "Towards Data Science"]',
    output_fields=["title", "claps", "publication"]
)

print(res)

# Output:
# [
#   [
#     {'id': 1, 'distance': -0.9999998807907104, 'entity': {'title': 'Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else', 'publication': 'The Startup', 'claps': 726}}, 
#     {'id': 4, 'distance': -0.7625510692596436, 'entity': {'title': 'Python NLP Tutorial: Information Extraction and Knowledge Graphs', 'publication': 'The Startup', 'claps': 163}}, 
#     {'id': 98, 'distance': -0.7285258769989014, 'entity': {'title': 'How To Write Movie Reviews with AI', 'publication': 'Towards Data Science', 'claps': 105}}, 
#     {'id': 5, 'distance': -0.7105905413627625, 'entity': {'title': 'Guide to Nest JS-RabbitMQ Microservices', 'publication': 'The Startup', 'claps': 184}}, 
#     {'id': 81, 'distance': -0.6982884407043457, 'entity': {'title': 'February Edition: Effective Programming For Data Science', 'publication': 'Towards Data Science', 'claps': 205}}, 
#     {'id': 73, 'distance': -0.6892906427383423, 'entity': {'title': 'Data Cleaning in Python: the Ultimate Guide (2020)', 'publication': 'Towards Data Science', 'claps': 1500}}, 
#     {'id': 80, 'distance': -0.6876587867736816, 'entity': {'title': 'Understanding Natural Language Processing: how AI understands our languages', 'publication': 'Towards Data Science', 'claps': 109}}, 
#     {'id': 72, 'distance': -0.6874254941940308, 'entity': {'title': '4 Hidden Python Features that Beginners should Know', 'publication': 'Towards Data Science', 'claps': 1500}}, 
#     {'id': 82, 'distance': -0.6818177700042725, 'entity': {'title': 'What’s New in Pandas 1.0 and TensorFlow 2.0', 'publication': 'Towards Data Science', 'claps': 117}}, 
#     {'id': 92, 'distance': -0.6773325204849243, 'entity': {'title': 'Understanding Reinforcement Learning Math, for Developers', 'publication': 'Towards Data Science', 'claps': 102}}
#   ]
# ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Include the following in the above async function declaration
res = await client.search({
    collection_name: "medium_articles_2020",
    vector: data.rows[0].title_vector,
    output_fields: ["title", "claps", "publication"],
    filter: 'claps > 100 and publication in ["The Startup", "Towards Data Science"]'
})

console.log(res)

// Output
// {
//   status: { error_code: 'Success', reason: '' },
//   results: [
//     {
//       score: -1,
//       id: '0',
//       publication: 'The Startup',
//       title: 'The Reported Mortality Rate of Coronavirus Is Not Important',
//       claps: 1100
//     },
//     {
//       score: -0.7525784969329834,
//       id: '70',
//       publication: 'Towards Data Science',
//       title: 'How bad will the Coronavirus Outbreak get? — Predicting the outbreak figures',
//       claps: 1100
//     },
//     {
//       score: -0.7132074236869812,
//       id: '160',
//       publication: 'The Startup',
//       title: 'The Funeral Industry is a Killer',
//       claps: 407
//     },
//     {
//       score: -0.6888885498046875,
//       id: '111',
//       publication: 'Towards Data Science',
//       title: 'The role of AI in web-based ADA and WCAG compliance',
//       claps: 935
//     },
//     {
//       score: -0.6680259704589844,
//       id: '47',
//       publication: 'The Startup',
//       title: 'What Happens When the Google Cookie Crumbles?',
//       claps: 203
//     },
//     ...
//   ]
// }
```

</TabItem>

<TabItem value='java'>

```java
// 6. search with filters

outputFields.add("claps");
outputFields.add("publication");

SearchSimpleParam searchSimpleParamWithFilter = SearchSimpleParam.newBuilder()
    .withCollectionName(collectionName)
    .withVectors(queryVectors)
    .withOutputFields(outputFields)
    .withFilter("claps > 100 and publication in [\\"The Startup\\", \\"Towards Data Science\\"]")
    .withOffset(0L)
    .withLimit(3L)
    .build();

R<SearchResponse> searchResWithFilter = client.search(searchSimpleParamWithFilter);

if (searchResWithFilter.getException() != null) {
    System.out.println("Failed to search: " + searchResWithFilter.getException().getMessage());
    return;
}

for (QueryResultsWrapper.RowRecord rowRecord: searchResWithFilter.getData().getRowRecords()) {
    System.out.println(rowRecord);
}

// Output
// [distance:0.0, publication:The Startup, id:0, title:The Reported Mortality Rate of Coronavirus Is Not Important, claps:1100]
// [distance:0.29999837, publication:Towards Data Science, id:3177, title:Following the Spread of Coronavirus, claps:215]
// [distance:0.37674016, publication:Towards Data Science, id:5641, title:Why The Coronavirus Mortality Rate is Misleading, claps:2900]
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
        \\"vector\\": $vector,
        \\"filter\\": \\"claps > 5\\",
        \\"outputFields\\": [\\"title\\", \\"claps\\"]
      }"

# Output
#
# {
#      "code": 200,
#      "data": [
#           {
#                "claps": 1100,
#                "distance": 0,
#                "title": "The Reported Mortality Rate of Coronavirus Is Not Important"
#           },
#           {
#                "claps": 1100,
#                "distance": 0.494843,
#                "title": "How bad will the Coronavirus Outbreak get? — Predicting the outbreak figures"
#           },
#           {
#                "claps": 54,
#                "distance": 0.65601754,
#                "title": "What if Facebook had to pay you for the profit they are making?"
#           }
#      ]
# }
```

</TabItem>
</Tabs>

### Perform a query{#perform-a-query}

All fields, except for the **vector** field, are scalar fields. You can define a filter condition against scalar fields to fetch the necessary entities.

Here is an example of a query.

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.query(
        collection_name="medium_articles_2020",
        filter='claps > 100 and publication in [\\"The Startup\\", \\"Towards Data Science\\"]',
        limit=3,
  outputField=["title", "claps", "publication"]
)

print(res)
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Include the following in the above async function declaration
res = await client.query({
    collection_name: "medium_articles_2020",
    filter: 'claps > 100 and publication in ["The Startup", "Towards Data Science"]',
    limit: 3,
    output_fields: ["title", "claps", "publication"],
})

console.log(res)

// Output:
// {
//  status: { error_code: 'Success', reason: '' },
//  data: [
//    {
//      publication: 'The Startup',
//      id: '0',
//      title: 'The Reported Mortality Rate of Coronavirus Is Not Important',
//      claps: 1100
//    },
//    {
//      publication: 'The Startup',
//      id: '1',
//      title: 'Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else',
//      claps: 726
//    },
//    {
//       publication: "The Startup",
//       id: 98,
//       title: "How Can We Best Switch in Python?"
//       claps: 500,
//    }
//  ]
// }
```

</TabItem>

<TabItem value='java'>

```java
QuerySimpleParam querySimpleParam = QuerySimpleParam.newBuilder()
    .withCollectionName(collectionName)
    .withFilter("claps > 100 and publication in [\\"The Startup\\", \\"Towards Data Science\\"]")
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

// Output
// [publication:The Startup, id:0, title:The Reported Mortality Rate of Coronavirus Is Not Important, claps:1100]
// [publication:The Startup, id:1, title:Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else, claps:726]
// [publication:The Startup, id:3, title:Maternity leave shouldn’t set women back, claps:460]
```

</TabItem>

<TabItem value='bash'>

```bash
# Replace uri and API key with your own
curl --request POST \\
     --url "${PUBLIC_ENDPOINT}/v1/vector/query" \\
     --header "Authorization: Bearer ${TOKEN}" \\
     --header 'accept: application/json' \\
     --header 'content-type: application/json' \\
     --data "{
        \\"collectionName\\": \\"medium_articles_2020\\",
        \\"limit\\": 3,
        \\"filter\\": \\"claps > 100 and publication in ['The Startup', 'Towards Data Science']\\",
        \\"outputFields\\": [\\"title\\", \\"claps\\", \\"publication\\"]
      }"

# Output
#
# {
#      "code": 200,
#      "data": [
#           {
#                "claps": 1100,
#                "id": 442147653350117440,
#                "publication": "The Startup",
#                "title": "The Reported Mortality Rate of Coronavirus Is Not Important"
#           },
#           {
#                "claps": 726,
#                "id": 442147653350117440,
#                "publication": "The Startup",
#                "title": "Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else"
#           },
#           {
#                "claps": 500,
#                "id": 442147653350117440,
#                "publication": "The Startup",
#                "title": "How Can We Best Switch in Python?"
#           }
#      ]
# }
```

</TabItem>
</Tabs>

### Get entities by IDs{#get-entities-by-ids}

In some cases, you may want to get specific entities based on their IDs. This is where the get operation comes into play.

Here are some examples of getting entities by IDs.

- Get a single entity by its ID

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
# Retrieve a single entity by ID
res = client.get(
        collection_name="medium_articles_2020",
        ids=1
)

print(res)

# Output
# [{'vector': [0.0039737443, 0.003020432, -0.0006188639, ... 0.035851076],
#   'link': '<https://medium.com/swlh/dashboards-in-python-3-advanced-examples-for-dash-beginners-and-everyone-else>',
#   'reading_time': 14,
#   'publication': ' The Startup',
#   'claps': 726,
#   'responses': 3}]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Include the following in the above async function declaration
res = await client.get({
    collection_name: "medium_articles_2020",
    ids: [0],
    output_fields: ['id', 'title']
});

console.log(res)

// Output:
// {
//   status: { error_code: 'Success', reason: '' },
//   data: [
//     {
//       id: '0',
//       title: 'The Reported Mortality Rate of Coronavirus Is Not Important'
//     },
//         ]
// }
```

</TabItem>

<TabItem value='java'>

```java
List<String> ids = Lists.newArrayList("1");

GetIdsParam getParam = GetIdsParam.newBuilder()
        .withCollectionName(collectionName)
        .withPrimaryIds(ids)
        .withOutputFields(Lists.newArrayList("*"))
        .build();

R<GetResponse> getRes = client.get(getParam);

if (getRes.getException() != null) {
    System.out.println("Failed to get: " + getRes.getException().getMessage());
    return;
}

for (QueryResultsWrapper.RowRecord rowRecord: getRes.getData().getRowRecords()) {
    System.out.println(rowRecord);
}

// Output
// [reading_time:14, publication:The Startup, link:<https://medium.com/swlh/dashboards-in-python-3-advanced-examples-for-dash-beginners-and-everyone-else-b1daf4e2ec0a>, responses:3, id:1, title:Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else, claps:726]
```

</TabItem>

<TabItem value='bash'>

```bash
# Retrieve a single entity by ID
# Go to Zilliz Cloud console, and look for the ID of an entity
# Fill the ID in the request body
curl --request POST \\
     --url "${PUBLIC_ENDPOINT}/v1/vector/get" \\
     --header "Authorization: Bearer ${TOKEN}" \\
     --header 'accept: application/json' \\
     --header 'content-type: application/json' \\
     --data "{
        \\"collectionName\\": \\"medium_articles_2020\\",
        \\"id\\": 442169042773492589,
        \\"outputFields\\": [\\"id\\", \\"title\\"]
      }"

# Output
#
# {
#      "code": 200,
#      "data": [
#           {
#                "id": 442147653350117440,
#                "title": "The Reported Mortality Rate of Coronavirus Is Not Important"
#           }
#      ]
# }
```

</TabItem>
</Tabs>

- Get multiple entities in a batch by their IDs

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
# Retrieve a set of entities by their IDs
res = client.get(
        collection_name="medium_articles_2020",
        ids=[1, 2, 3]
)

print(res)

# Output
# [{'id': 1,
#  'title': 'Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else',
#  'link': '<https://medium.com/swlh/dashboards-in-python-3-advanced-examples-for-dash-beginners-and-everyone-else>',
#  'reading_time': 14,
#  'publication': ' The Startup',
#  'claps': 726,
#  'responses': 3,
#  'vector': [0.0039737443,0.003020432,-0.0006188639,...,0.021713957]},
#        {'id': 2,
#  'title': 'How Can We Best Switch in Python?',
#  'link': '<https://medium.com/swlh/how-can-we-best-switch-in-python-458fb33f7835>',
#  'reading_time': 6,
#  'publication': 'The Startup',
#  'claps': 500,
#  'responses': 7,
#  'vector': [0.031961977,0.00047043373,-0.018263113,...,0.034458436]},
#        {'id': 3,
#  'title': 'Maternity leave shouldn’t set women back',
#  'link': '<https://medium.com/swlh/maternity-leave-shouldnt-set-women-back-5019dd3129d8>',
#  'reading_time': 9,
#  'publication': 'The Startup',
#  'claps': 460,
#  'responses': 1,
#  'vector': [0.032572296,-0.011148319,-0.01688577,...,0.004943279]}]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Include the following in the above async function declaration
res = await client.get({
    collection_name: "medium_articles_2020",
    ids: [0, 1, 2],
    output_fields: ['id', 'title']
});

console.log(res)

// Output:
// {
//   status: { error_code: 'Success', reason: '' },
//   data: [
//     {
//       id: '0',
//       title: 'The Reported Mortality Rate of Coronavirus Is Not Important'
//     },
//     {
//       id: '1',
//       title: 'Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else'
//     },
//     {
//       id: '2',
//       title: 'How Can We Best Switch in Python?'
//     },
//         ]
// }
```

</TabItem>

<TabItem value='java'>

```java
List<String> ids = Lists.newArrayList("1", "2", "3");

GetIdsParam getParam = GetIdsParam.newBuilder()
        .withCollectionName(collectionName)
        .withPrimaryIds(ids)
        .withOutputFields(Lists.newArrayList("*"))
        .build();

R<GetResponse> getRes = client.get(getParam);

if (getRes.getException() != null) {
    System.out.println("Failed to get: " + getRes.getException().getMessage());
    return;
}

for (QueryResultsWrapper.RowRecord rowRecord: getRes.getData().getRowRecords()) {
    System.out.println(rowRecord);
}

// Output
// [reading_time:14, publication:The Startup, link:<https://medium.com/swlh/dashboards-in-python-3-advanced-examples-for-dash-beginners-and-everyone-else-b1daf4e2ec0a>, responses:3, id:1, title:Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else, claps:726]
// [reading_time:6, publication:The Startup, link:<https://medium.com/swlh/how-can-we-best-switch-in-python-458fb33f7835>, responses:7, id:2, title:How Can We Best Switch in Python?, claps:500]
// [reading_time:9, publication:The Startup, link:<https://medium.com/swlh/maternity-leave-shouldnt-set-women-back-5019dd3129d8>, responses:1, id:3, title:Maternity leave shouldn’t set women back, claps:460]
```

</TabItem>

<TabItem value='bash'>

```bash
# Retrieve a set of entities by their IDs
# Go to Zilliz Cloud console, and look for the ID of some entities
# Fill the IDs in the request body
curl --request POST \\
     --url "${PUBLIC_ENDPOINT}/v1/vector/get" \\
     --header "Authorization: Bearer ${TOKEN}" \\
     --header 'accept: application/json' \\
     --header 'content-type: application/json' \\
     --data "{
        \\"collectionName\\": \\"medium_articles_2020\\",
        \\"id\\": [442169042773492591, 442169042773492593, 442169042773492595],
        \\"outputFields\\": [\\"id\\", \\"title\\"]
      }"

# Output
#
# {
#      "code": 200,
#      "data": [
#           {
#                "id": 442147653350117570,
#                "title": "Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else"
#           },
#           {
#                "id": 442147653350117570,
#                "title": "How Can We Best Switch in Python?"
#           },
#           {
#                "id": 442147653350117570,
#                "title": "Maternity leave shouldn’t set women back"
#           }
#      ]
# }
```

</TabItem>
</Tabs>

## Delete entities{#delete-entities}

If entities are outdated or no longer needed, you can delete them from a collection by their IDs. You can delete one or more entities at a time.

Here are some examples of deleting entities.

- Delete a single entity by its ID

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
# Delete a single entity
res = client.delete(
        collection_name="medium_articles_2020",
        pks=0
)

print(res)

# Output
# [0]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Include the following in the above async function declaration
res = await client.delete({
    collection_name: "medium_articles_2020",
    ids: [0]
});

console.log(res);

// Output:
// {
//   succ_index: [],
//   err_index: [],
//   status: { error_code: 'Success', reason: '' },
//   IDs: { int_id: { data: [Array] }, id_field: 'int_id' },
//   acknowledged: false,
//   insert_cnt: '0',
//   delete_cnt: '1',
//   upsert_cnt: '0',
//   timestamp: '442193588309196801'
// }
```

</TabItem>

<TabItem value='java'>

```java
// List<String> ids = Lists.newArrayList("1");

DeleteIdsParam deleteParam = DeleteIdsParam.newBuilder()
        .withCollectionName(collectionName)
        .withPrimaryIds(ids)
        .build();

R<DeleteResponse> deleteRes = client.delete(deleteParam);

if (deleteRes.getException() != null) {
    System.out.println("Failed to delete: " + deleteRes.getException().getMessage());
    return;
}

System.out.println("Successfully deleted " + deleteRes.getData().getDeleteIds() + " records");

// Output
// Successfully deleted [1] records
```

</TabItem>

<TabItem value='bash'>

```bash
# Deletes an entity
# Go to Zilliz Cloud console, and look for the ID of an entity
# Fill the ID in the request body
curl --request POST \\
     --url "${PUBLIC_ENDPOINT}/v1/vector/delete" \\
     --header "Authorization: Bearer ${API_KEY}" \\
     --header 'accept: application/json' \\
     --header 'content-type: application/json' \\
     --data "{
        \\"collectionName\\": \\"medium_articles_2020\\",
        \\"id\\": 442169042773492589
      }"

# Output
#
# {
#         "code": 200,
#         "data": {}
# }
```

</TabItem>
</Tabs>

- Delete multiple entities in a batch by their IDs

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
# Delete a set of entities in a batch
res = client.delete(
        collection_name="medium_articles_2020",
        pks=[1, 2, 3]
)

print(res)

# Output
# [1, 2, 3]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Include the following in the above async function declaration
res = await client.delete({
    collection_name: "medium_articles_2020",
    ids: [1, 2, 3]
});

console.log(res);

// Output:
// {
//   succ_index: [],
//   err_index: [],
//   status: { error_code: 'Success', reason: '' },
//   IDs: { int_id: { data: [Array] }, id_field: 'int_id' },
//   acknowledged: false,
//   insert_cnt: '0',
//   delete_cnt: '3',
//   upsert_cnt: '0',
//   timestamp: '442193588309196801'
// }
```

</TabItem>

<TabItem value='java'>

```java
// List<String> ids = Lists.newArrayList("1", "2", "3");

DeleteIdsParam deleteParam = DeleteIdsParam.newBuilder()
        .withCollectionName(collectionName)
        .withPrimaryIds(ids)
        .build();

R<DeleteResponse> deleteRes = client.delete(deleteParam);

if (deleteRes.getException() != null) {
    System.out.println("Failed to delete: " + deleteRes.getException().getMessage());
    return;
}

System.out.println("Successfully deleted " + deleteRes.getData().getDeleteIds() + " records");

// Output
// Successfully deleted [1, 2, 3] records
```

</TabItem>

<TabItem value='bash'>

```bash
# Delete a set of entities in a batch
# Go to Zilliz Cloud console, and look for the ID of some entities
# Fill the IDs in the request body
curl --request POST \\
     --url "${PUBLIC_ENDPOINT}/v1/vector/delete" \\
     --header "Authorization: Bearer ${TOKEN}" \\
     --header 'accept: application/json' \\
     --header 'content-type: application/json' \\
     --data "{
        \\"collectionName\\": \\"medium_articles_2020\\",
        \\"id\\": [442169042773492591, 442169042773492593, 442169042773492595]
      }"

# Output
#
# {
#         "code": 200,
#         "data": {}
# }
```

</TabItem>
</Tabs>

## Drop a collection{#drop-a-collection}

If a collection is no longer used, you can drop it from a cluster by collection name.

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
# Drop a collection
res = client.drop_collection(
        collection_name="medium_articles_2020"
)

print(res)

# Output
# None
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Include the following in the above async function declaration
res = await client.dropCollection({
    collection_name: "medium_articles_2020"
});

console.log(res);

// Output:
// { error_code: 'Success', reason: '' }
```

</TabItem>

<TabItem value='java'>

```java
DropCollectionParam dropCollectionParam = DropCollectionParam.newBuilder()
    .withCollectionName(collectionName)
    .build();

R<RpcStatus> dropCollection = client.dropCollection(dropCollectionParam);

if (dropCollection.getException() != null) {
    System.out.println("Failed to drop collection: " + dropCollection.getException().getMessage());
    return;            
}

// Output
// 2023-07-04 16:56:23 io.milvus.client.AbstractMilvusGrpcClient logInfo 
// INFO: DropCollectionParam{collectionName='medium_articles_2020'}
```

</TabItem>

<TabItem value='bash'>

```bash
# Drop a collection
# Replace uri and API key with your own
curl --request POST \\
     --url "${PUBLIC_ENDPOINT}/v1/vector/collections/drop" \\
     --header "Authorization: Bearer ${TOKEN}" \\
     --header 'accept: application/json' \\
     --header 'content-type: application/json' \\
     --data "{
        \\"collectionName\\": \\"medium_articles_2020\\"
      }"

# Output
#
# {
#         "code": 200,
#         "data": {}
# }
```

</TabItem>
</Tabs>

## Related topics{#related-topics}

- [Register with Zilliz Cloud]([object Promise])

- [Example Dataset]([object Promise])

- [Connect to Cluster]([object Promise])

- [Drop Collection]([object Promise])

- [Search and Query]([object Promise])

- [ANN Search Explained]([object Promise])
