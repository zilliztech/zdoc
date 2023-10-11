---
slug: /faqs-bulk-insertion
sidebar_position: 3
---

# Bulk insertion

## Contents

- [How to import data from Elasticsearch to Zilliz Cloud?](#how-to-import-data-from-elasticsearch-to-zilliz-cloud)
- [Can I bulk insert data into the Zilliz Cloud vector databases?](#can-i-bulk-insert-data-into-the-zilliz-cloud-vector-databases)
- [What can I do if I receive `ECONNRESET` errors when importing data to or querying Zilliz Cloud clusters with Node.js SDK?](#what-can-i-do-if-i-receive-econnreset-errors-when-importing-data-to-or-querying-zilliz-cloud-clusters-with-nodejs-sdk)

## FAQs


### How to import data from Elasticsearch to Zilliz Cloud?{#how-to-import-data-from-elasticsearch-to-zilliz-cloud}

You can follow the steps below to import data from Elasticsearch to Zilliz Cloud.

1. Connect to ElasticSearch.
    ```python
    print(fmt.format("start connecting to ElasticSearch"))
    es = Elasticsearch(hosts=ELASTICSEARCH_HOST)
    ```

1. Use the Elasticsearch [Scroll API](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/scroll-api.html) to retrieve datasets from Elasticsearch and import them into Zilliz Cloud.  The following example imports the Elasticsearch data into a collection named `hello_milvus` in Zilliz Cloud.
    ```python
    print(fmt.format("Start inserting entities"))
    rng = np.random.default_rng(seed=19530)
    resp = es.search(index=ELASTICSEARCH_INDEX, query={"match_all": {}}, scroll="1m", size=500)
    scroll_id = resp["_scroll_id"]
    
    query = {
      "scroll": "1m",
      "scroll_id": scroll_id,
    }
    
    # Start the primary key from 0
    pk = 0
    while len(resp["hits"]["hits"]):
        l = len(resp["hits"]["hits"])
        entities = [[str(i + pk) for i in range(l)], rng.random(l).tolist()]
        embeddings = []
        for item in resp['hits']['hits']:
            embeddings.append(list(item["_source"].values()))
            entities.append(embeddings)
            insert_result = hello_milvus.insert(entities)
            print(insert_result)
            pk += l
    resp = es.scroll(scroll_id=scroll_id, scroll="1m")
    ```

1. Check the number of entities you have imported.
    ```python
    hello_milvus.flush()
    print(f"Number of entities in Milvus: {hello_milvus.num_entities}")
    ```

### Can I bulk insert data into the Zilliz Cloud vector databases?{#can-i-bulk-insert-data-into-the-zilliz-cloud-vector-databases}

Yes. But currently, you can only bulk insert data into the vector databases by using the Zilliz Cloud UI. Please refer to [Bulk-Insert Data](./bulk-insert-data) for more information.

### What can I do if I receive `ECONNRESET` errors when importing data to or querying Zilliz Cloud clusters with Node.js SDK?{#what-can-i-do-if-i-receive-econnreset-errors-when-importing-data-to-or-querying-zilliz-cloud-clusters-with-nodejs-sdk}

To solve this problem, please follow the steps below.

1. Upgrade to the latest version of Milvus NodeJS SDK which supports **channelOptions**.

1. Add channelOptions manually.
    ```javascript
    const channelOptions: ChannelOptions = {
    
    // Send keepalive pings every 10 seconds, default is 2 hours.
    
    'grpc.keepalive_time_ms': 10 * 1000,
    
    // Keepalive ping timeout after 5 seconds, default is 20 seconds.
    
    'grpc.keepalive_timeout_ms': 5 * 1000,
    
    // Allow keepalive pings when there are no gRPC calls.
    
    'grpc.keepalive_permit_without_calls': 1,
    
    };
    ```

1. Initialize the client with the channelOptions.
    ```javascript
    import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';
    
    new MilvusClient({
      address: 'your-zilliz-cloud-address',
      ssl: true,
      username: 'username',
      password: 'your-pass',
      channelOptions: channel options
    })
    ```
