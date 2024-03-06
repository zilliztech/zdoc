---
slug: /run-search-pipelines
beta: TRUE
notebook: FALSE
token: JQDDwqHi3i47jAkybnCcgNt6nSe
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Run Search Pipeline

After creating a Search pipeline, you can run it to perform a semantic search. 

## On web UI{#on-web-ui}

1. Click the "▶︎" button next to your Search pipeline. Alternatively, you can also click on the **Run Pipelines** tab.

![run-pipeline](/img/run-pipeline.png)

1. Configure the required parameters. Click **Run**.

    ![run-search-pipeline-playground](/img/run-search-pipeline-playground.png)

1. Check the results.

## Via RESTful API{#via-restful-api}

The following example runs the Search pipeline named `my_text_search_pipeline` (assuming its `pipelineId` is `pipe-26a18a66ffc8c0edfdb874`). The query text is "How many collections can a cluster with more than 8 CUs hold?".

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_CLUSTER_TOKEN}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/pipe-26a18a66ffc8c0edfdb874/run" \
    -d '{
      "data": {
        "query_text": "How many collections can a cluster with more than 8 CUs hold?"
      },
      "params":{
          "limit": 1,
          "offset": 0,
          "outputFields": [ "chunk_id", "doc_name" ],
          "filter": "id >= 0", 
      }
    }'

```

The parameters in the above code are described as follows:

- `YOUR_CLUSTER_TOKEN`: The token used to authenticate API requests. This token can be an [API key](./manage-api-keys) or a [cluster credential](./cluster-credentials) that consists of a username and password pair.

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- Query input field: The name should be consistent with what you defined when [adding the ](./create-search-piplines#via-restful-api)[**SEARCH_DOC_CHUNK**](./create-search-piplines#via-restful-api)[ function](./create-search-piplines#via-restful-api). Input the text string you want to query in the value of this field.

- `params`: The search parameters to configure.

    - `limit`: The maximum number of entities to return. The value should be an integer ranging from **1** to **100**. The sum of this value of that of `offset` should be less than **1024**.

    - `offset`: The number of entities to skip in the search results.

        The sum of this value and that of `limit` should not be greater than **1024**.The maximum value is **1024**.

    - `outputFields`: An array of fields to return along with the search results. Note that `id`（entity ID）, `distance`, and `chunk_text` will be returned in the search result by default. If you need other output fields in the returned result, you can configure this parameter.

    - `filter`: The [filter](./search-query-and-get#search-with-filters) in boolean expression used to find matches for the search

Below is an example response.

```bash
{
  "code": 200,
  "data": {
    "result": [
      {
        "id": "445951244000281783",
        "distance": 0.7270776033401489,
        "chunk_text": "After determining the CU type, you must also specify its size. Note that the\nnumber of collections a cluster can hold varies based on its CU size. A\ncluster with less than 8 CUs can hold no more than 32 collections, while a\ncluster with more than 8 CUs can hold as many as 256 collections.\n\nAll collections in a cluster share the CUs associated with the cluster. To\nsave CUs, you can unload some collections. When a collection is unloaded, its\ndata is moved to disk storage and its CUs are freed up for use by other\ncollections. You can load the collection back into memory when you need to\nquery it. Keep in mind that loading a collection requires some time, so you\nshould only do so when necessary.\n\n## Collection\n\nA collection collects data in a two-dimensional table with a fixed number of\ncolumns and a variable number of rows. In the table, each column corresponds\nto a field, and each row represents an entity.\n\nThe following figure shows a sample collection that comprises six entities and\neight fields.\n\n### Fields\n\nIn most cases, people describe an object in terms of its attributes, including\nsize, weight, position, etc. These attributes of the object are similar to the\nfields in a collection.\n\nAmong all the fields in a collection, the primary key is one of the most\nspecial, because the values stored in this field are unique throughout the\nentire collection. Each primary key maps to a different record in the\ncollection.",
        "chunk_id": 123,
        "doc_name": "zilliz_concept_doc.md",
      }
    ],
    "token_usage": 200
  }
}
```

## Related topics{#related-topics}

- [Manage Pipelines](./manage-pipelines)

- [Estimate Pipelines Usage](./estimate-pipelines-usage)

- [Zilliz Cloud Limits](./limits#pipelines)

- [FAQs](./faq-pipelines)

