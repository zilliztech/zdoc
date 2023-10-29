---
slug: /drop-collection-1
beta: FALSE
notebook: 00_quick_start.ipynb
sidebar_position: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Drop Collection

This guide walks you through dropping a collection from a cluster.

Dropping a collection eradicates all linked data, encompassing data, metadata, and indexes. Exercise caution before dropping a collection because this operation is irreversible.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
# Drop a collection that is created using a MilvusClient object
from pymilvus import MilvusClient

res = client.drop_collection(collection_name="medium_articles_2020")

print(res)

# Output:
# None
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.dropCollection({
    collection_name: "medium_articles_2020"
});

console.log(res)

// Output
// { error_code: 'Success', reason: '' }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.param.R;
import io.milvus.param.RpcStatus;
import io.milvus.param.collection.DropCollectionParam;

public class QuickStart 
{
    public static void main( String[] args )
    {
        ...
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
// Drop collection
err = conn.DropCollection(context.Background(), COLLNAME)

if err != nil {
    log.Fatal("Failed to drop collection:", err.Error())
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

- [Insert Entities](https://www.notion.so/Insert-Entities-375dd098632d4a5297617a51c69c7967?pvs=21)

- [Search and Query](https://www.notion.so/Search-and-Query-40930370867642c6b8b65249cfb58c5b?pvs=21)

- [Delete Entities](https://www.notion.so/Delete-Entities-cd0af9c2006b4726b0c46ba9b1590078?pvs=21)
