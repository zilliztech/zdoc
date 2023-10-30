---
slug: /create-collection-2
beta: FALSE
notebook: 00_quick_start.ipynb
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create Collection

This tutorial will guide you through the steps to set up a collection for your cluster.

## Procedure{#procedure}

If the idea of jumping right into the creation process without pre-defining every field sounds appealing, then the starter API is tailor-made for you. It offers a streamlined approach, demanding only the collection's name and the count of dimensions for the vector field.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# Initialize a MilvusClient instance
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    # token="username:password" or token="your-api-key" 
    token=TOKEN

res = client.create_collection(
    collection_name="medium_articles_2020",
    dimension=768
)

print(res)

# Output:
# None
```

</TabItem>

<TabItem value='javascript'>

```javascript
// create a collection
res = await client.createCollection({
    collection_name: "medium_articles_2020",
    dimension: 768
});

console.log(res)

// Output:
// { error_code: 'Success', reason: '' }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.param.R;
import io.milvus.param.RpcStatus;
import io.milvus.param.highlevel.collection.CreateSimpleCollectionParam;

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
```

</TabItem>

<TabItem value='bash'>

```bash
# token="username:password" or token="your-api-key"
curl --location --request POST "${PUBLIC_ENDPOINT}/v1/vector/collections/create" \\
    --header "Authorization: Bearer ${TOKEN}" \\
    --header "Content-Type: application/json" \\
    --header "Accept: */*" \\
    --data '{
        "collectionName": "medium_articles_2020",
        "dimension": 768
    }'

# Output:
# {"code":200,"data":{}}
```

</TabItem>
</Tabs>

By running the above snippets, you are allowing Zilliz Cloud to take charge of some default settings:

- Primary key
    Zilliz Cloud automatically creates a primary key and dubs it `id`.

- Vector field
    A default vector field named `vector` is initialized.

Additionally, collections established using this method automatically enable the dynamic schema feature. With this capability active, Zilliz Cloud seamlessly saves each undefined field in the data as dynamic fields upon insertion.

## Limits{#limits}

For a serverless cluster, you can create up to two collections. For a dedicated cluster, the number of collections you can create varies with the CU that your cluster uses.

|                                      |  Maximum number of collections |
| ------------------------------------ | ------------------------------ |
|  Serverless cluster                  |  **2**                         |
|  Dedicated cluster (8 CUs and less)  |  **32**                        |
|  Dedicated cluster (More than 8 CUs) |  **256**                       |

## Related topics{#related-topics}

- [Insert Entities](./insert-entities) 

- [Search and Query](./search-query-and-get) 

- [Drop Collection](./drop-collection-1) 

- [Use Customized Schema](./create-collection-with-schema) 

- [Enable Dynamic Schema](./enable-dynamic-schema) 

- [JavaScript Object Notation (JSON)](./javascript-object-notation-json-1) 
