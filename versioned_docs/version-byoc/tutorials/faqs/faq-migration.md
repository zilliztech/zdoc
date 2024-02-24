---
slug: /faq-migration
beta: null
notebook: null
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 5
---

# FAQ: Migration

This topic lists the possible issues that you may encounter while you migrate data on Zilliz Cloud and the corresponding solution.

## Contents



## FAQs




__How to migrate data from Elasticsearch to Zilliz Cloud?__

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

Alternatively, you can also import data from Elasticsearch on the Zilliz Cloud web console. For more information, see [Migrate from Elasticsearch](./migrate-from-elasticsearch) .
