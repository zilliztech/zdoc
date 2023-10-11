---
slug: /create-collection-2
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create Collection

This guide walks you through creating a collection for a cluster.

If your cluster is a serverless cluster, note that each serverless cluster can hold up to two collections.

## Before you start{#before-you-start}

Before creating a collection, ensure that

- You have a blueprint of your data model (i.e. schema). For details, see [Schema Explained](./data-models-explained).

- You have connected to a cluster. For details, see [Connect to Cluster](./connect-to-cluster).

- You have downloaded the example dataset, For details, see [Example Dataset](./example-dataset-1).

:::info Notes

The collection created in this guide series has a primary key named **id**, and a vector field named **vector**. If you prefer to take full control of the collection’s schema, refer to [Use Customized Schema](./use-customized-schema), [Enable Dynamic Schema](./enable-dynamic-schema), and [JavaScript Object Notation (JSON)](./javascript-object-notation-json-1).

:::

## Procedure{#procedure}

With dynamic schema enabled, Zilliz Cloud can refactor the schema of your collection while you insert entities. Zilliz Cloud enables a dynamic data model for serverless clusters by default. When creating a collection, you only need to provide a collection name and the dimension of your vector field:

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
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

public class QuickStart 
{
    public static void main( String[] args )
    {
        ...

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
curl --location --request POST "${PUBLIC_ENDPOINT}/v1/vector/collections/create" \\
    --header "Authorization: Bearer ${API_KEY}" \\
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

The preceding operation automatically creates a primary key named `id`  and a vector field named `vector`  in the backend.

In a dynamic data model, if you insert entities with more fields to the collection, Zilliz Cloud will parse the data and dynamically infer your collection's schema.

## Supported data types{#supported-data-types}

For your reference, Zilliz Cloud supports the following field data types:

- Boolean value (BOOLEAN)

- 8-byte floating-point (DOUBLE)

- 4-byte floating-point (FLOAT)

- Float vector (FLOAT_VECTOR)

- 8-bit integer (INT8)

- 32-bit integer (INT32)

- 64-bit integer (INT64)

- Variable character (VARCHAR)

- [JSON](./javascript-object-notation-json-1)

## Related topics{#related-topics}

- [Insert Entities](./insert-entities) 

- [Search and Query](./search-and-query) 

- [Drop Collection](./drop-collection-1) 

- [Use Customized Schema](./use-customized-schema) 

- [Enable Dynamic Schema](./enable-dynamic-schema) 

- [JavaScript Object Notation (JSON)](./javascript-object-notation-json-1) 
