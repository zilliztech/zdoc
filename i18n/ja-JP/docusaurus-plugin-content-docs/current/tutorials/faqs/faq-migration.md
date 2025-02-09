---
title: "FAQ:マイグレーション | CLOUD"
slug: /faq-migration
sidebar_label: "FAQ:マイグレーション"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloudでデータを移行する際に発生する可能性のある問題と、それに対応する解決策について説明します。 | CLOUD"
type: origin
token: LKxiwykkhi5VyLkTfAGcE3LinBe
sidebar_position: 6

---

# FAQ:マイグレーション

このトピックでは、Zilliz Cloudでデータを移行する際に発生する可能性のある問題と、それに対応する解決策について説明します。

## Contents

- [ElasticsearchからZilliz Cloudにデータを移行する方法は?](#how-to-migrate-data-from-elasticsearch-to-zilliz-cloud)
- [無料クラスターをサーバーレスまたは専用クラスターにアップグレードできますか?](#can-i-upgrade-a-free-cluster-to-a-serverless-or-dedicated-cluster)

## FAQs




### ElasticsearchからZilliz Cloudにデータを移行する方法は?{#how-to-migrate-data-from-elasticsearch-to-zilliz-cloud}

ElasticsearchからZilliz Cloudにデータをインポートするには、以下の手順に従ってください。

1. Elastic Searchに接続します。

    ```python
    print(fmt.format("start connecting to ElasticSearch"))
    es = Elasticsearch(hosts=ELASTICSEARCH_HOST)
    ```

1. Elasticsearch[Scroll API](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/scroll-api.html)を使用して、Elasticsearchからデータセットを取得し、Zilliz Cloudにインポートします。次の例では、ElasticsearchデータをZilliz Cloudの`hello_milvus`というコレクションにインポートします。

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

1. インポートした図形の数を確認します。

    ```python
    hello_milvus.flush()
    print(f"Number of entities in Milvus: {hello_milvus.num_entities}")
    ```

代わりに、Zilliz CloudウェブコンソールからElasticsearchからデータを移行することもできます。詳細については、「[ElasticsearchからZilliz Cloudへの移行](./migrate-from-elasticsearch)」を参照してください。

### 無料クラスターをサーバーレスまたは専用クラスターにアップグレードできますか?{#can-i-upgrade-a-free-cluster-to-a-serverless-or-dedicated-cluster}

はい。詳細については、「[クラスタ管理](./manage-cluster)」を参照してください。
