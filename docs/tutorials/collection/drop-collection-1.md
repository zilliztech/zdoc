---
slug: /drop-collection-1
beta: FALSE
notebook: 00_quick_start.ipynb
sidebar_position: 13
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Drop Collection

This guide walks you through dropping a collection from a cluster.

## Before you start{#before-you-start}

Dropping a collection deletes all information associated with it, including data, metadata, and indexes. Exercise caution before dropping a collection because this operation is irreversible.

:::info Notes

The collection created in this guide series has a primary key named **id**, and a vector field named **vector**. If you prefer to take full control of the collection’s schema, refer to [Use Customized Schema](https://www.notion.so/Use-Customized-Schema-c74dda39712041a589a2e378386e142b?pvs=21), [Enable Dynamic Schema](https://www.notion.so/353bcaa305154240aa15baad91e7549f?pvs=21), and [JavaScript Object Notation](https://www.notion.so/5ba1d65c243d4c5c8ff08f7188efeb25?pvs=21).

:::

## Procedure{#procedure}

To drop a collection from a cluster, use the following code:

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
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

When using a Zilliz Cloud cluster, be aware that you can create only one vector field in each collection.

## Related topics{#related-topics}

- [Insert Entities](https://www.notion.so/Insert-Entities-375dd098632d4a5297617a51c69c7967?pvs=21)

- [Search and Query](https://www.notion.so/Search-and-Query-40930370867642c6b8b65249cfb58c5b?pvs=21)

- [Delete Entities](https://www.notion.so/Delete-Entities-cd0af9c2006b4726b0c46ba9b1590078?pvs=21)
