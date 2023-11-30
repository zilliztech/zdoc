---
slug: /docs/manage-index
beta: FALSE
notebook: 01_use_customized_schema.ipynb
sidebar_position: 2
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Manage Index

Utilize vector indexes as metadata structures in Zilliz Cloud to enhance vector similarity search performance. An index must be created prior to performing ANN searches on a Zilliz Cloud cluster.

## Before you start{#before-you-start}

Ensure you have created a collection. For details, refer to [Create Collection](./create-collection).

## Index collection{#index-collection}

For optimal ANN search performance in Zilliz Cloud, indexing is imperative. Note that Zilliz Cloud permits indexing solely on the vector field. Thus, indexing a collection inherently means indexing its vector field and generating an index file.

Zilliz Cloud currently supports the AUTOINDEX type exclusively. If any other index type is selected, the system will default to AUTOINDEX. Further details on this can be found in [AUTOINDEX Explained](./autoindex-explained).

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 4. Index collection
# 'index_type' defines the index algorithm to be used.
#    AUTOINDEX is the only option.
#
# 'metric_type' defines the way to measure the distance 
#    between vectors. Possible values are L2, IP, and Cosine,
#    and defaults to Cosine.
index_params = {
    "index_type": "AUTOINDEX",
    "metric_type": "L2",
    "params": {}
}

# To name the index, do as follows:
collection.create_index(
    field_name="title_vector", 
    index_params=index_params,
    index_name='title_vector_index' # Optional
)

```

</TabItem>

<TabItem value='javascript'>

```javascript
async function main() {

    // (Continued)
    
    // 4. Create index
    res = await client.createIndex({
        collection_name: collectionName,
        field_name: "title_vector",
        index_type: "IVF_FLAT",
        metric_type: "L2",
        params: {
            nlist: 1024
        }
    })

    console.log(res)

    // Output
    // 
    // { error_code: 'Success', reason: '', code: 0 }
    // 

}
```

</TabItem>

<TabItem value='java'>

```java
public final class UseCustomizedSchemaDemo  {
    public static void main(String[] args) {
        
        // (Continued)
        
        // 4. Create index

        CreateIndexParam createIndexParam = CreateIndexParam.newBuilder()
            .withCollectionName(collectionName)
            .withFieldName("title_vector")
            .withIndexName("title_vector_index")
            .withIndexType(IndexType.AUTOINDEX)
            .withMetricType(MetricType.L2)
            .build();

        R<RpcStatus> res = client.createIndex(createIndexParam);

        if (res.getException() != null) {
            System.err.println("Failed to create index: " + res.getException().getMessage());
            return;
        }

        System.out.println("Index created!");

        // Output:
        // Index created! 
    }
}
```

</TabItem>

<TabItem value='go'>

```go
func main() {
        // (Continued)
    
        // 3. Create index for cluster
        index, err := entity.NewIndexAUTOINDEX(entity.MetricType("L2"))

        if err != nil {
                log.Fatal("Failed to prepare the index:", err.Error())
        }

        fmt.Println(index.Name())

        err = conn.CreateIndex(context.Background(), COLLNAME, "title_vector", index, false)

        if err != nil {
                log.Fatal("Failed to create the index:", err.Error())
        }          
}
```

</TabItem>
</Tabs>

## Load index{#load-index}

Before conducting any searches or queries within a collection, the index file associated with that collection must be loaded into memory.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 5. Load collection
collection.load()

# Get loading progress
progress = utility.loading_progress(COLLECTION_NAME)

print(progress)

# Output
#
# {
#     "loading_progress": "100%"
# }
```

</TabItem>

<TabItem value='javascript'>

```javascript
async function main() {

    // (Continued)
    
    res = await client.loadCollection({
        collection_name: collectionName
    })

    console.log(res)

    // Output
    // 
    // { error_code: 'Success', reason: '', code: 0 }
    // 

}
```

</TabItem>

<TabItem value='java'>

```java
public final class UseCustomizedSchemaDemo  {
    public static void main(String[] args) {
        
        // (Continued)
        
        // 5. Load collection

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
    }
}
```

</TabItem>

<TabItem value='go'>

```go
func main() {
        // (Continued)
    
        // 4. Load collection
        loadCollErr := conn.LoadCollection(context.Background(), COLLNAME, false)

        if loadCollErr != nil {
                log.Fatal("Failed to load collection:", loadCollErr.Error())
        }

        // 5. Get load progress
        progress, err := conn.GetLoadingProgress(context.Background(), COLLNAME, nil)

        if err != nil {
                log.Fatal("Failed to get loading progress:", err.Error())
        }

        fmt.Println("Loading progress:", progress)        
}
```

</TabItem>
</Tabs>

## Release index{#release-index}

You can also release the index file if the collections are not needed temporarily.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
collection.release()
```

</TabItem>

<TabItem value='javascript'>

```javascript
async function main() {

    // (Continued)
    
    res = await client.releaseCollection({
        collection_name: collectionName
    })

    // Output
    // 
    // { error_code: 'Success', reason: '', code: 0 }
    // 

}
```

</TabItem>

<TabItem value='java'>

```java
public final class UseCustomizedSchemaDemo  {
    public static void main(String[] args) {
        
        // (Continued)

        ReleaseCollectionParam releaseCollectionParam = ReleaseCollectionParam.newBuilder()
            .withCollectionName(collectionName)
            .build();

        R<RpcStatus> releaseCollectionRes = client.releaseCollection(releaseCollectionParam);

        if (releaseCollectionRes.getException() != null) {
            System.err.println("Failed to release collection: " + releaseCollectionRes.getException().getMessage());
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
    
    releaseColErr := conn.ReleaseCollection(context.Background(), COLLNAME)

    if releaseColErr != nil {
        log.Fatal("Failed to release collection:", releaseColErr.Error())
    }       
}
```

</TabItem>
</Tabs>

