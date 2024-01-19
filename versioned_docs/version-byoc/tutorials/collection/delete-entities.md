---
slug: /delete-entities
beta: FALSE
notebook: 00_quick_start.ipynb,01_use_customized_schema.ipynb
token: EcMiwjPhRiwTL0kHuvjcaW1Bng1
sidebar_position: 10
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# [DEPRECATE] Delete Entities

Entities on Zilliz Cloud refer to data objects stored in a cluster, containing data for processing, search, and queries. If an entity is no longer needed, you can perform operations to delete it.

## Delete entities{#delete-entities}

If an entity is outdated or no longer needed, you can run the following sample code to delete it:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

<Tabs groupId="python" defaultValue='python' values={[{"label":"Starter API","value":"python"},{"label":"Advanced API","value":"python_1"}]}>
<TabItem value='python'>

```python
# Delete a single entity using a MilvusClient object
from pymilvus import MilvusClient

res = client.delete(
    collection_name="medium_articles_2020", # Collection name
    pks=253 # Entity ID, Use a list for multiple entities, such as [246, 253]
)

print(res)

# Output:
# [253]

```

</TabItem>
<TabItem value='python_1'>

```python
# Delete a single entity using a Collection object
from pymilvus import Collection

collection.delete(expr="id in [253]") 

# Include the IDs of all entities to delete in the expr, such as 'id in [246, 253]'
```

</TabItem>
</Tabs>
</TabItem>

<TabItem value='javascript'>

```javascript
async function main () {

    // Continued

    res = await client.delete({
        collection_name: "medium_articles_2020",
        ids: [253] // Include the IDs of all entities to delete, such as [246, 253]
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
    
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.List;

import io.milvus.param.highlevel.dml.DeleteIdsParam;
import io.milvus.param.highlevel.dml.response.DeleteResponse;

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
        
        DeleteIdsParam deleteParam = DeleteIdsParam.newBuilder()
                .withCollectionName(collectionName)
                .withPrimaryIds(ids)
                .build();

        R<DeleteResponse> deleteRes = client.delete(deleteParam);

        if (deleteRes.getException() != null) {
            System.err.println("Failed to delete: " + deleteRes.getException().getMessage());
            return;
        }

        System.out.println(deleteRes.getData().toString());

        // Output:
        // deleteIds=[]
    }
}
```

</TabItem>

<TabItem value='go'>

```go
func main() {

    // (Continued)
    
    err = conn.Delete(context.Background(), COLLNAME, "", "id in [253]")
    // err = conn.Delete(context.Background(), COLLNAME, "", "id in [253, 254]")

    if err != nil {
        log.Fatal("Failed to delete rows:", err.Error())
    }
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
     --url "${PUBLIC_ENDPOINT}/v1/vector/delete" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data "{
        \"collectionName\": \"medium_articles_2020\",
        \"id\": 253
      }"

# Output:
# {"code":200,"data":{}}
```

</TabItem>
</Tabs>

The preceding code deletes an entity with ID `253` from collection `medium_articles_2020`.

<Admonition type="caution" icon="🚧" title="Warning">

Deleting entities is an irreversible operation. Make sure you have a backup or the data is no longer needed before proceeding with the operation.

</Admonition>

## Related topics{#related-topics}

- [Create Collection](./create-collection)

- [Insert Entities](./insert-entities)

- [Search and Query](./search-query-and-get) 

