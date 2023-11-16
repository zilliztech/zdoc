---
slug: /drop-collection-1
beta: FALSE
notebook: 00_quick_start.ipynb,01_use_customized_schema.ipynb
sidebar_position: 3
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Drop Collection

This guide walks you through dropping a collection from a cluster.

Dropping a collection eradicates all linked data, encompassing data, metadata, and indexes. Exercise caution before dropping a collection because this operation is irreversible.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

<Tabs groupId="python" defaultValue='python' values={[{"label":"Starter API","value":"python"},{"label":"Advanced API","value":"python_1"}]}>
<TabItem value='python'>

```python
# Drop a collection that is created using a MilvusClient object
from pymilvus import MilvusClient

res = client.drop_collection(collection_name="medium_articles_2020")

print(res)

```

</TabItem>
<TabItem value='python_1'>

```python
# Drop a collection that is created using a Collection object
from pymilvus import utility

res = utility.drop_collection(collection_name="medium_articles_2020")
```

</TabItem>
</Tabs>
</TabItem>

<TabItem value='javascript'>

```javascript
async function main() {

    // (Continued)
    
    // 8. Drop collection

    res = await client.dropCollection({
        collection_name: collectionName
    })     
    
    console.log(res);

    // Output
    // 
    // { error_code: 'Success', reason: '', code: 0 }
    // 

}
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.param.R;
import io.milvus.param.RpcStatus;
import io.milvus.param.collection.DropCollectionParam;

public class UseCustomizedSchemaDemo 
{
    public static void main( String[] args )
    {
        // (Continued)
        
        DropCollectionParam dropCollectionParam = DropCollectionParam.newBuilder()
            .withCollectionName(collectionName)
            .build();

        R<RpcStatus> dropCollection = client.dropCollection(dropCollectionParam);

        if (dropCollection.getException() != null) {
            System.out.println("Failed to drop collection: " + dropCollection.getException().getMessage());
            return;            
        }
    }
}
```

</TabItem>

<TabItem value='go'>

```go
func main() {
        // (Continued)
    
        // 9. Drop collection
        err = conn.DropCollection(context.Background(), COLLNAME)

        if err != nil {
                log.Fatal("Failed to drop collection:", err.Error())
        }       
}
```

</TabItem>

<TabItem value='bash'>

```bash
# Replace uri and API key with your own
curl --location --request POST "${PUBLIC_ENDPOINT}/v1/vector/collections/drop" \\
    --header "Authorization: Bearer ${API_KEY}" \\
    --header "Content-Type: application/json" \\
    --header "Accept: */*" \\
    --data '{"collectionName": "medium_articles_2020"}'

# Output
# {"code":200,"data":{}}
```

</TabItem>
</Tabs>

## Limits{#limits}

On the Zilliz Cloud cluster, each collection can accommodate only one vector field.

## Related topics{#related-topics}

- [Insert Entities](./insert-entities) 

- [Search, Query, and Get](./search-query-and-get) 

- [Delete Entities](./delete-entities) 
