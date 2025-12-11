---
title: "Tune Recall Rate | Cloud"
slug: /tune-recall-rate
sidebar_label: "Tune Recall Rate"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud introduces a search parameter `level` to allow users to balance search recall and performance. It also provides another search parameter, `enablerecallcalculation`, to give users the estimated recall rate of the current search. You can combine these two parameters to tune the recall rate of vector searches. | Cloud"
type: origin
token: Fz9swr5WwixkH8kKHircWCejnye
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - vector search
  - ann
  - recall rate
  - tune recall rate
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index

---

import Admonition from '@theme/Admonition';


# Tune Recall Rate

Zilliz Cloud introduces a search parameter `level` to allow users to balance search recall and performance. It also provides another search parameter, `enable_recall_calculation`, to give users the estimated recall rate of the current search. You can combine these two parameters to tune the recall rate of vector searches.

## Overview\{#overview}

The recall rate in Zilliz Cloud usually refers to the proportion of relevant results successfully retrieved by a search. It measures the system's ability to recover all the relevant items from a collection.

![OdMnbeHYOoAEqKxNEEnc9SwNnmf](https://zdoc-images.s3.us-west-2.amazonaws.com/odmnbehyooaeqkxneenc9swnnmf.png "OdMnbeHYOoAEqKxNEEnc9SwNnmf")

To calculate a search's recall rate, you can divide the number of relevant items retrieved by the total number of applicable items that should be retrieved. For example, if a search retrieves 90 of 100 relevant items, the recall rate should be **0.9** or **90%**.

A high recall rate usually indicates a more precise search result, which may be time-consuming. You may want to tune the recall rate to balance the precision and efficiency of vector searches.

## Set up a search request\{#set-up-a-search-request}

To set up a search request with tunable recall, you must include the `level` parameter inside the search parameters as follows:

```python
query_vector = [0.3580376395471989, ..., 0.9029438446296592],

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # The number of results to return
    search_params={
        "params": {
            # highlight-next-line
            "level": 1 # The precision control
        }
    }
)
```

The `level` parameter ranges from `1` to `10` and defaults to `1`. The default value results in a recall rate of 90%, which is typically sufficient for most use cases. 

For scenarios that require a high recall rate (**99%** or above), try setting the `level` parameter to an integer between `6` and `10`. If search efficiency is not a concern, you can set this parameter to `10` to get the most precise results.

<Admonition type="info" icon="📘" title="Notes">

<p>If the top-most level settings still do not suffice, contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud support</a>.</p>

</Admonition>

## Tune recall rate\{#tune-recall-rate}

Zilliz Cloud also introduces another search parameter named `enable_recall_calculation` to facilitate the tuning process. Setting this parameter to `True` indicates that Zilliz Cloud will estimate the recall rate of the current search and includes the estimated recall rate along with the search results.

```python
query_vector = [0.3580376395471989, ..., 0.9029438446296592],

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # The number of results to return
    search_params={
        "params": {
            "level": 6 # The precision control
            # highlight-next-line
            "enable_recall_calculation": True # Ask for recall rate calculation
        }
    }
)
```

With the above search request, you can get an estimated recall rate of the current search as follows:

```python
# data: [...], recalls: [0.98]
```

During the estimation process, Zilliz Cloud:

1. Searches with the `level` parameter set to the user-defined value, and

1. Conducts another search in an internal high-precision mode.

1. Use the second search as the ground truth to estimate the recall rate.

While setting `enable_recall_calculation` to `True`, you can adjust the value of the `level` parameter to obtain multiple recall rates. By considering these estimated figures and the duration of each search, you can roughly estimate the appropriate level setting.

<Admonition type="info" icon="📘" title="Notes">

<p>Enabling <code>enable_recall_calculation</code> may impact search performance and is not recommended in production.</p>

</Admonition>

## Limits\{#limits}

Currently, this feature is available only for Zilliz Cloud clusters in basic vector searches, filtered searches, and range searches.

