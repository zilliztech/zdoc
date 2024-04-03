---
slug: /run-deletion-pipelines
beta: FALSE
notebook: FALSE
type: origin
token: Up5KwgdCfiqEwskKlGtcPYxDnZg
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Run Deletion Pipeline

After creating a Deletion pipeline, you can run it to remove all chunks in a specified document from a collection. 

## On web UI{#on-web-ui}

1. Click the "▶︎" button next to your Deletion pipeline. Alternatively, you can also click on the __Playground__ tab.

![run-pipeline](/img/run-pipeline.png)

1. Input the name of the document to delete in the `doc_name` field. Click __Run__.

    ![run-deletion-pipeline-playground](/img/run-deletion-pipeline-playground.png)

1. Check the results.

## Via RESTful API{#via-restful-api}

The following example runs the Deletion pipeline named `my_doc_deletion_pipeline`. 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_CLUSTER_TOKEN}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}/run" \
    -d '{
        "data": {
            "doc_name": "zilliz_concept_doc.md",
        }
    }'
```

The parameters in the above code are described as follows:

- `YOUR_CLUSTER_TOKEN`: The token used to authenticate API requests. This token can be an [API key](/docs/manage-api-keys) or a [cluster credential](/docs/cluster-credentials) that consists of a username and password pair.

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- `doc_name`: the name of the document to delete. If a document with the `doc_name` you specified exists, all chunks in this document will be deleted. If the document with the `doc_name` does not exist, the request can still be executed but the value of `num_deleted_chunks` in the output will be 0.

Below is an example response.

```bash
{
  "code": 200,
  "data": {
    "num_deleted_chunks": 567
  }
}
```

## Related topics{#related-topics}

- [Manage Pipelines](./manage-pipelines)

- [Estimate Pipelines Usage](./estimate-pipelines-usage)

- [Zilliz Cloud Limits](./limits#pipelines)

- [FAQs](/docs/faq-pipelines)

