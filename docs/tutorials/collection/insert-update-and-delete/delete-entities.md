---
slug: /delete-entities
beta: FALSE
notebook: 00_quick_start.ipynb
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Delete Entities

Entities on Zilliz Cloud refer to data objects stored in a cluster, containing data for processing, search, and queries. If an entity is no longer needed, you can perform operations to delete it.

:::info Notes

The collection created in this guide series has a primary key named **id**, and a vector field named **vector**. If you prefer to take full control of the collection’s schema, refer to [Use Customized Schema](./undefined), [Enable Dynamic Schema](./enable-dynamic-schema), and [JavaScript Object Notation (JSON)](./javascript-object-notation-json-1).

:::

## Delete a single entity{#delete-a-single-entity}

If an entity is outdated or no longer needed, you can run the following sample code to delete it:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.delete(
        collection_name="medium_articles_2020", # Collection name
        pks=253 # Entity ID
)

print(res)

# Output:
# [253]
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.delete({
    collection_name: "medium_articles_2020",
    ids: [253]
});

console.log(res)

// Output
//  {
//   succ_index: [],
//   err_index: [],
//   status: { error_code: 'Success', reason: '' },
//   IDs: { int_id: { data: [Array] }, id_field: 'int_id' },
//   acknowledged: false,
//   insert_cnt: '0',
//   delete_cnt: '1',
//   upsert_cnt: '0',
//   timestamp: '442192913812684801'
// }
```

</TabItem>

<TabItem value='java'>

```java
import java.util.List;

import io.milvus.param.highlevel.dml.DeleteIdsParam;
import io.milvus.param.highlevel.dml.response.DeleteResponse;

public class QuickStart 
{
    public static void main( String[] args )
    {
        ...
        List<String> ids = Lists.newArrayList("253");

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
    }
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \\
     --url "${PUBLIC_ENDPOINT}/v1/vector/delete" \\
     --header "Authorization: Bearer ${API_KEY}" \\
     --header 'accept: application/json' \\
     --header 'content-type: application/json' \\
     --data "{
        \\"collectionName\\": \\"medium_articles_2020\\",
        \\"id\\": 253
      }"

# Output:
# {"code":200,"data":{}}
```

</TabItem>
</Tabs>

The preceding code deletes an entity with ID `253` from collection `medium_articles_2020`.

:::caution Warning

Deleting an entity is an irreversible operation. Make sure you have a backup or the data is no longer needed before proceeding with the operation.

:::

## Delete multiple entities at a time{#delete-multiple-entities-at-a-time}

Zilliz Cloud allows you to delete multiple entities at a time. To do this, run the following sample code:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python

res = client.delete(
        collection_name="medium_articles_2020", # Collection name
        pks=[252, 236] # Entity IDs
)

print(res)

# Output:
# [252, 236]
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.delete({
    collection_name: "medium_articles_2020",
    ids: [252, 236]
});

console.log(res)

// Output
//  {
//   succ_index: [],
//   err_index: [],
//   status: { error_code: 'Success', reason: '' },
//   IDs: { int_id: { data: [Array] }, id_field: 'int_id' },
//   acknowledged: false,
//   insert_cnt: '0',
//   delete_cnt: '2',
//   upsert_cnt: '0',
//   timestamp: '44219291381268543'
// }
```

</TabItem>

<TabItem value='java'>

```java
import java.util.List;

import io.milvus.param.highlevel.dml.DeleteIdsParam;
import io.milvus.param.highlevel.dml.response.DeleteResponse;

public class QuickStart 
{
    public static void main( String[] args )
    {
        ...
        List<String> ids = Lists.newArrayList("252", "236");

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
    }
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \\
     --url "${PUBLIC_ENDPOINT}/v1/vector/delete" \\
     --header "Authorization: Bearer ${API_KEY}" \\
     --header 'accept: application/json' \\
     --header 'content-type: application/json' \\
     --data "{
        \\"collectionName\\": \\"medium_articles_2020\\",
        \\"id\\": [252, 236]
      }"

# Output:
#
# {"code":200,"data":{}}
```

</TabItem>
</Tabs>

The preceding code deletes entities with IDs `252` and `236` from collection `medium_articles_2020` at a time.

:::caution Warning

Deleting entities is an irreversible operation. Make sure you have a backup or the data is no longer needed before proceeding with the operation.

:::

## Related topics{#related-topics}

- [Create Collection](./create-collection-2) 

- [Insert Entities](./insert-entities) 

- [Search and Query](./search-and-query) 
