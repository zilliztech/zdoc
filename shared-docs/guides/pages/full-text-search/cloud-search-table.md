| Parameter | Description |
| --- | --- |
| `search_params` | A dictionary containing search parameters. |
| `params.level` | Controls the search precision with simplified search optimization. For details, refer to [Tune Recall Rate](https://docs.zilliz.com/docs/tune-recall-rate). |
| `data` | Raw query text in natural language. Zilliz Cloud automatically converts your text query into sparse vectors using the BM25 function - do not provide pre-computed vectors. |
| `anns_field` | The name of the field that contains internally generated sparse vectors. |
| `output_fields` | List of field names to return in search results. Supports all fields **except the sparse vector field** containing BM25-generated embeddings. Common output fields include the primary key field (e.g., `id`) and the original text field (e.g., `text`). For more information, refer to [FAQ](https://docs.zilliz.com/docs/full-text-search#can-i-output-or-access-the-sparse-vectors-generated-by-the-bm25-function-in-full-text-search). |
| `limit` | Maximum number of top matches to return. |
